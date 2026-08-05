import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, checkBookingRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit';
import { generateOrderId } from '@/lib/data/orders';
import { createSessionToken } from '@/lib/auth';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Audit 1.1: Rate Limiting & Bot Protection', () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it('allows requests within rate limit window', () => {
    const ip = '192.168.1.100';
    for (let i = 0; i < 5; i++) {
      const result = checkBookingRateLimit(ip);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it('blocks 6th request when limit is 5', () => {
    const ip = '192.168.1.101';
    for (let i = 0; i < 5; i++) {
      checkBookingRateLimit(ip);
    }
    const blocked = checkBookingRateLimit(ip);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it('tracks distinct IP addresses separately', () => {
    const ipA = '10.0.0.1';
    const ipB = '10.0.0.2';

    for (let i = 0; i < 5; i++) {
      checkBookingRateLimit(ipA);
    }

    expect(checkBookingRateLimit(ipA).success).toBe(false);
    expect(checkBookingRateLimit(ipB).success).toBe(true);
  });

  it('correctly parses client IP from proxy headers', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }))).toBe('203.0.113.195');
    expect(getClientIp(new Headers({ 'cf-connecting-ip': '198.51.100.1' }))).toBe('198.51.100.1');
    expect(getClientIp(new Headers({ 'x-real-ip': '192.0.2.1' }))).toBe('192.0.2.1');
    expect(getClientIp(new Headers())).toBe('127.0.0.1');
  });
});

describe('Audit 1.2: Collision-Resistant Order ID Generator', () => {
  it('generates order IDs matching the expected format', () => {
    const id = generateOrderId();
    expect(id).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]{8}$/);
  });

  it('generates 5,000 unique IDs without any collisions', () => {
    const generated = new Set();
    const count = 5000;

    for (let i = 0; i < count; i++) {
      const id = generateOrderId();
      expect(generated.has(id)).toBe(false);
      generated.add(id);
    }

    expect(generated.size).toBe(count);
  });
});

describe('Audit 1.4: Edge Middleware HMAC Verification', () => {
  const secret = 'super-secret-key-that-is-longer-than-16-bytes';

  beforeEach(() => {
    process.env.SESSION_SECRET = secret;
  });

  it('allows access with a valid HMAC-signed session token', async () => {
    const token = createSessionToken('admin@superdrycleaners.co.uk');
    const req = new NextRequest('http://localhost:3000/admin/orders', {
      headers: {
        cookie: `bc_session=${token}`,
      },
    });

    const res = await middleware(req);
    // NextResponse.next() returns a response that does not redirect
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects to login when token is missing', async () => {
    const req = new NextRequest('http://localhost:3000/admin/orders');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login?from=%2Fadmin%2Forders');
  });

  it('redirects to login when token signature is tampered', async () => {
    const token = createSessionToken('admin@superdrycleaners.co.uk');
    const [payload] = token.split('.');
    const tamperedToken = `${payload}.invalidSignatureHere123`;

    const req = new NextRequest('http://localhost:3000/admin/orders', {
      headers: {
        cookie: `bc_session=${tamperedToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('returns 401 Unauthorized for admin API routes with invalid session', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: {
        cookie: 'bc_session=invalid.token',
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('allows unauthenticated requests to /admin/login', async () => {
    const req = new NextRequest('http://localhost:3000/admin/login');
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
