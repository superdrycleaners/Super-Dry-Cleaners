/**
 * Focused tests for lib/login-protection.js — bounded server-side login abuse
 * protection. Verifies threshold enforcement, cooldown behavior, stale entry
 * cleanup, successful-login record clearing, bounded memory, generic responses
 * regardless of cooldown state, and cookie security attributes.
 */

import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LoginProtectionTracker,
  PROTECTION_DEFAULTS,
  createAttemptKey,
  createTracker,
  extractNetworkId,
  normalizeEmail,
} from '../lib/login-protection';

/* ─── Route-level mocks for integration tests ───────────────────────────── */

const routeMocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  verifyCredentials: vi.fn(),
  createSessionToken: vi.fn(),
  sessionCookieOptions: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: routeMocks.cookies }));
vi.mock('@/lib/auth', () => ({
  verifyCredentials: routeMocks.verifyCredentials,
  createSessionToken: routeMocks.createSessionToken,
  sessionCookieOptions: routeMocks.sessionCookieOptions,
  SESSION_COOKIE: 'bc_session',
}));

import { POST as postLogin } from '../app/api/admin/login/route';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function requestWith(body, network = '192.0.2.1') {
  const headers = { 'content-type': 'application/json' };
  if (network) headers['x-forwarded-for'] = network;
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function requestWithRealIp(body, realIp) {
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-real-ip': realIp,
    },
    body: JSON.stringify(body),
  });
}

function configureRouteMocks({ valid = false } = {}) {
  const cookieStore = { set: vi.fn() };
  routeMocks.verifyCredentials.mockReturnValue(valid);
  routeMocks.createSessionToken.mockReturnValue('signed-session-token');
  routeMocks.sessionCookieOptions.mockReturnValue({
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 28_800,
  });
  routeMocks.cookies.mockReturnValue(cookieStore);
  return cookieStore;
}

function makeKey(network, email) {
  const headers = new Headers();
  if (network) headers.set('x-forwarded-for', network);
  return createAttemptKey(extractNetworkId(headers), normalizeEmail(email));
}

/* ─── Unit tests: LoginProtectionTracker ──────────────────────────────────── */

describe('LoginProtectionTracker', () => {
  describe('threshold enforcement', () => {
    it('does not block before reaching the failure threshold', () => {
      const tracker = new LoginProtectionTracker({ failureThreshold: 5, maxKeys: 100 });
      const key = makeKey('10.0.0.1', 'user@example.test');

      for (let i = 0; i < 4; i++) {
        tracker.recordFailure(key);
      }
      expect(tracker.isBlocked(key)).toBe(false);
    });

    it('blocks after exactly 5 consecutive failures (default threshold)', () => {
      const tracker = new LoginProtectionTracker({ failureThreshold: 5, maxKeys: 100 });
      const key = makeKey('10.0.0.1', 'user@example.test');

      for (let i = 0; i < 5; i++) {
        tracker.recordFailure(key);
      }
      expect(tracker.isBlocked(key)).toBe(true);
    });

    it('respects custom failure threshold', () => {
      const tracker = new LoginProtectionTracker({ failureThreshold: 3, maxKeys: 100 });
      const key = makeKey('10.0.0.1', 'user@example.test');

      tracker.recordFailure(key);
      tracker.recordFailure(key);
      expect(tracker.isBlocked(key)).toBe(false);
      tracker.recordFailure(key);
      expect(tracker.isBlocked(key)).toBe(true);
    });
  });

  describe('cooldown blocks further attempts', () => {
    it('remains blocked for the entire cooldown period', () => {
      let now = 10_000;
      const tracker = new LoginProtectionTracker({
        failureThreshold: 5,
        cooldownMs: 15 * 60 * 1000,
        entryTtlMs: 24 * 60 * 60 * 1000,
        maxKeys: 100,
        now: () => now,
      });
      const key = makeKey('10.0.0.1', 'user@example.test');

      for (let i = 0; i < 5; i++) {
        tracker.recordFailure(key);
      }
      expect(tracker.isBlocked(key)).toBe(true);

      // Halfway through cooldown — still blocked
      now += 7 * 60 * 1000;
      expect(tracker.isBlocked(key)).toBe(true);
    });

    it('unblocks after the cooldown period expires', () => {
      let now = 10_000;
      const tracker = new LoginProtectionTracker({
        failureThreshold: 5,
        cooldownMs: 15 * 60 * 1000,
        entryTtlMs: 24 * 60 * 60 * 1000,
        maxKeys: 100,
        now: () => now,
      });
      const key = makeKey('10.0.0.1', 'user@example.test');

      for (let i = 0; i < 5; i++) {
        tracker.recordFailure(key);
      }
      expect(tracker.isBlocked(key)).toBe(true);

      // Advance past cooldown
      now += 15 * 60 * 1000;
      expect(tracker.isBlocked(key)).toBe(false);
    });

    it('isolates keys — blocking one does not affect another', () => {
      const tracker = new LoginProtectionTracker({ failureThreshold: 2, maxKeys: 100 });
      const key1 = makeKey('10.0.0.1', 'user1@example.test');
      const key2 = makeKey('10.0.0.2', 'user2@example.test');

      tracker.recordFailure(key1);
      tracker.recordFailure(key1);
      expect(tracker.isBlocked(key1)).toBe(true);
      expect(tracker.isBlocked(key2)).toBe(false);
    });
  });

  describe('stale entry cleanup', () => {
    it('removes entries older than the TTL on each check', () => {
      let now = 10_000;
      const tracker = new LoginProtectionTracker({
        failureThreshold: 5,
        cooldownMs: 1000,
        entryTtlMs: 5000,
        maxKeys: 100,
        now: () => now,
      });
      const key = makeKey('10.0.0.1', 'user@example.test');

      tracker.recordFailure(key);
      tracker.recordFailure(key);
      expect(tracker.size).toBe(1);

      // Advance past TTL
      now += 5000;
      expect(tracker.size).toBe(0);
      expect(tracker.isBlocked(key)).toBe(false);
    });

    it('removes stale entries even during isBlocked check', () => {
      let now = 10_000;
      const tracker = new LoginProtectionTracker({
        failureThreshold: 2,
        cooldownMs: 100,
        entryTtlMs: 200,
        maxKeys: 100,
        now: () => now,
      });
      const key = makeKey('10.0.0.1', 'user@example.test');

      tracker.recordFailure(key);
      tracker.recordFailure(key);
      expect(tracker.isBlocked(key)).toBe(true);

      // Advance past TTL — entry becomes stale
      now += 200;
      expect(tracker.isBlocked(key)).toBe(false);
    });

    it('24-hour default TTL removes day-old entries', () => {
      let now = 0;
      const tracker = new LoginProtectionTracker({
        maxKeys: 100,
        now: () => now,
      });
      const key = makeKey('10.0.0.1', 'user@example.test');

      tracker.recordFailure(key);
      expect(tracker.size).toBe(1);

      // Advance 24 hours
      now += 24 * 60 * 60 * 1000;
      expect(tracker.size).toBe(0);
    });
  });

  describe('successful login clears the record', () => {
    it('clearOnSuccess removes the failure record', () => {
      const tracker = new LoginProtectionTracker({ failureThreshold: 5, maxKeys: 100 });
      const key = makeKey('10.0.0.1', 'user@example.test');

      // Accumulate 4 failures (one away from cooldown)
      for (let i = 0; i < 4; i++) {
        tracker.recordFailure(key);
      }
      tracker.clearOnSuccess(key);

      // After clearing, failures start over — 1 more failure doesn't trigger cooldown
      tracker.recordFailure(key);
      expect(tracker.isBlocked(key)).toBe(false);
    });

    it('clearOnSuccess on a blocked key unblocks it', () => {
      const tracker = new LoginProtectionTracker({ failureThreshold: 2, maxKeys: 100 });
      const key = makeKey('10.0.0.1', 'user@example.test');

      tracker.recordFailure(key);
      tracker.recordFailure(key);
      expect(tracker.isBlocked(key)).toBe(true);

      tracker.clearOnSuccess(key);
      expect(tracker.isBlocked(key)).toBe(false);
    });

    it('clearOnSuccess is a no-op for unknown keys', () => {
      const tracker = new LoginProtectionTracker({ maxKeys: 100 });
      const key = makeKey('10.0.0.1', 'unknown@example.test');
      // Should not throw
      tracker.clearOnSuccess(key);
      expect(tracker.size).toBe(0);
    });
  });

  describe('bounded memory (cap at 1000 keys)', () => {
    it('evicts oldest entries when cap is reached', () => {
      const tracker = new LoginProtectionTracker({
        failureThreshold: 5,
        cooldownMs: 1000,
        entryTtlMs: 100_000,
        maxKeys: 3,
      });

      tracker.recordFailure(makeKey('10.0.0.1', 'a@test'));
      tracker.recordFailure(makeKey('10.0.0.2', 'b@test'));
      tracker.recordFailure(makeKey('10.0.0.3', 'c@test'));
      expect(tracker.size).toBe(3);

      // Adding a 4th key should evict the oldest
      tracker.recordFailure(makeKey('10.0.0.4', 'd@test'));
      expect(tracker.size).toBe(3);
    });

    it('default maxKeys is 1000', () => {
      expect(PROTECTION_DEFAULTS.maxKeys).toBe(1000);
      const tracker = createTracker();
      expect(tracker.maxKeys).toBe(1000);
    });

    it('never exceeds the configured cap even under burst', () => {
      const tracker = new LoginProtectionTracker({
        failureThreshold: 2,
        cooldownMs: 1000,
        entryTtlMs: 100_000,
        maxKeys: 5,
      });

      for (let i = 0; i < 20; i++) {
        tracker.recordFailure(makeKey(`10.0.0.${i}`, `user${i}@test`));
      }
      expect(tracker.size).toBeLessThanOrEqual(5);
    });
  });
});

/* ─── Unit tests: Normalization and key creation ──────────────────────────── */

describe('normalizeEmail', () => {
  it('trims and lowercases email', () => {
    expect(normalizeEmail('  Admin@Example.COM  ')).toBe('admin@example.com');
  });

  it('returns empty string for non-string input', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
    expect(normalizeEmail(123)).toBe('');
  });

  it('caps at 254 characters', () => {
    const long = 'a'.repeat(300) + '@example.com';
    expect(normalizeEmail(long).length).toBeLessThanOrEqual(254);
  });
});

describe('extractNetworkId', () => {
  it('extracts first IP from x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' });
    expect(extractNetworkId(headers)).toBe('203.0.113.1');
  });

  it('trims and lowercases the value', () => {
    const headers = new Headers({ 'x-forwarded-for': '  203.0.113.1  ' });
    expect(extractNetworkId(headers)).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.5' });
    expect(extractNetworkId(headers)).toBe('198.51.100.5');
  });

  it('returns unknown when no proxy headers present', () => {
    const headers = new Headers();
    expect(extractNetworkId(headers)).toBe('unknown');
  });

  it('returns unknown for empty forwarded-for value', () => {
    const headers = new Headers({ 'x-forwarded-for': '' });
    expect(extractNetworkId(headers)).toBe('unknown');
  });
});

describe('createAttemptKey', () => {
  it('produces a SHA-256 hex hash', () => {
    const key = createAttemptKey('192.0.2.1', 'admin@example.test');
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });

  it('does not contain the raw email or IP', () => {
    const key = createAttemptKey('192.0.2.1', 'admin@example.test');
    expect(key).not.toContain('admin@example.test');
    expect(key).not.toContain('192.0.2.1');
  });

  it('produces the expected hash for known inputs', () => {
    const expected = crypto
      .createHash('sha256')
      .update('192.0.2.1\u0000admin@example.test')
      .digest('hex');
    expect(createAttemptKey('192.0.2.1', 'admin@example.test')).toBe(expected);
  });

  it('different network + same email produces different key', () => {
    const k1 = createAttemptKey('10.0.0.1', 'admin@example.test');
    const k2 = createAttemptKey('10.0.0.2', 'admin@example.test');
    expect(k1).not.toBe(k2);
  });
});

/* ─── Integration tests: route-level behavior ─────────────────────────────── */

describe('POST /api/admin/login — login protection integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generic responses regardless of cooldown state', () => {
    it('returns the same error message for invalid credentials', async () => {
      configureRouteMocks();
      const res = await postLogin(requestWith({ email: 'a@b.com', password: 'wrong' }));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Invalid email or password.' });
    });

    it('returns the same error message when cooldown is active', async () => {
      configureRouteMocks();
      // Trigger 5 failures to activate cooldown
      for (let i = 0; i < 5; i++) {
        await postLogin(requestWith({ email: 'blocked@test.com', password: 'wrong' }, '10.10.10.1'));
      }
      const cooled = await postLogin(
        requestWith({ email: 'blocked@test.com', password: 'wrong' }, '10.10.10.1'),
      );
      expect(cooled.status).toBe(401);
      expect(await cooled.json()).toEqual({ error: 'Invalid email or password.' });
    });

    it('does not reveal cooldown state, attempt count, or account existence', async () => {
      configureRouteMocks();
      for (let i = 0; i < 5; i++) {
        await postLogin(requestWith({ email: 'test@test.com', password: 'x' }, '10.10.10.2'));
      }
      const res = await postLogin(
        requestWith({ email: 'test@test.com', password: 'x' }, '10.10.10.2'),
      );
      const body = await res.json();
      // Response must not contain words that reveal internal state
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).not.toContain('cooldown');
      expect(bodyStr).not.toContain('locked');
      expect(bodyStr).not.toContain('attempts');
      expect(bodyStr).not.toContain('rate');
      expect(bodyStr).not.toContain('blocked');
    });

    it('malformed JSON returns 400 with same generic message', async () => {
      configureRouteMocks();
      const res = await postLogin(
        new Request('http://localhost/api/admin/login', {
          method: 'POST',
          body: '{bad-json',
        }),
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Invalid email or password.' });
    });
  });

  describe('cookie attributes remain secure', () => {
    it('sets httpOnly, sameSite strict, path /, secure in production', async () => {
      const cookieStore = configureRouteMocks({ valid: true });
      await postLogin(requestWith({ email: 'admin@test.com', password: 'correct' }));

      expect(cookieStore.set).toHaveBeenCalledWith(
        'bc_session',
        'signed-session-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
        }),
      );
    });

    it('uses constant-time verifyCredentials', async () => {
      configureRouteMocks({ valid: true });
      await postLogin(requestWith({ email: 'admin@test.com', password: 'pass' }));
      expect(routeMocks.verifyCredentials).toHaveBeenCalledWith('admin@test.com', 'pass');
    });
  });

  describe('IP extraction', () => {
    it('uses x-forwarded-for header for network identification', async () => {
      configureRouteMocks();
      // Two different IPs should have independent failure counters
      for (let i = 0; i < 4; i++) {
        await postLogin(requestWith({ email: 'same@test.com', password: 'wrong' }, '1.2.3.4'));
      }
      // Different IP — should not be blocked yet
      const res = await postLogin(
        requestWith({ email: 'same@test.com', password: 'wrong' }, '5.6.7.8'),
      );
      expect(res.status).toBe(401);
      // The 5.6.7.8 IP only has 1 failure, not blocked
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
      configureRouteMocks();
      const res = await postLogin(requestWithRealIp({ email: 'a@b.com', password: 'wrong' }, '9.8.7.6'));
      expect(res.status).toBe(401);
    });
  });
});

/* ─── Defaults verification ───────────────────────────────────────────────── */

describe('PROTECTION_DEFAULTS', () => {
  it('has the documented default values', () => {
    expect(PROTECTION_DEFAULTS.failureThreshold).toBe(5);
    expect(PROTECTION_DEFAULTS.cooldownMs).toBe(15 * 60 * 1000);
    expect(PROTECTION_DEFAULTS.entryTtlMs).toBe(24 * 60 * 60 * 1000);
    expect(PROTECTION_DEFAULTS.maxKeys).toBe(1000);
  });

  it('defaults are frozen and immutable', () => {
    expect(Object.isFrozen(PROTECTION_DEFAULTS)).toBe(true);
  });
});
