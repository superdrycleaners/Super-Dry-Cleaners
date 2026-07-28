import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

import {
  LoginProtectionTracker,
  createAttemptKey,
  normalizeEmail,
  extractNetworkId,
} from '../lib/login-protection';
import { POST as postLogin } from '../app/api/admin/login/route';

const ORIGINAL_ENV = { ...process.env };

function requestWith(body, network = '192.0.2.1') {
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': network },
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

function key(network, account) {
  const headers = new Headers({ 'x-forwarded-for': network });
  return createAttemptKey(
    extractNetworkId(headers),
    normalizeEmail(account),
  );
}

describe('admin login abuse protection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns the same generic response for malformed, invalid, and cooling-down requests', async () => {
    configureRouteMocks();
    const malformed = await postLogin(new Request('http://localhost/api/admin/login', {
      method: 'POST',
      body: '{not-json',
    }));
    const invalid = await postLogin(requestWith({ email: 'admin@example.test', password: 'wrong' }));

    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(401);
    expect(await malformed.json()).toEqual({ error: 'Invalid email or password.' });
    expect(await invalid.json()).toEqual({ error: 'Invalid email or password.' });

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await postLogin(requestWith({ email: 'admin@example.test', password: 'wrong' }));
    }
    const coolingDown = await postLogin(requestWith({ email: 'admin@example.test', password: 'wrong' }));

    expect(coolingDown.status).toBe(401);
    expect(await coolingDown.json()).toEqual({ error: 'Invalid email or password.' });
  });

  it('sets the signed session cookie with the existing security attributes after valid credentials', async () => {
    const cookieStore = configureRouteMocks({ valid: true });
    const response = await postLogin(
      requestWith({ email: ' Admin@Example.Test ', password: 'correct' }, '198.51.100.2'),
    );

    expect(response.status).toBe(200);
    expect(routeMocks.createSessionToken).toHaveBeenCalledWith('admin@example.test');
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

  it('clears the matching route record after successful authentication', async () => {
    const network = '203.0.113.7';
    configureRouteMocks();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await postLogin(requestWith({ email: 'reset@example.test', password: 'wrong' }, network));
    }

    routeMocks.verifyCredentials.mockReturnValue(true);
    const success = await postLogin(
      requestWith({ email: 'reset@example.test', password: 'correct' }, network),
    );
    expect(success.status).toBe(200);

    routeMocks.verifyCredentials.mockReturnValue(false);
    const afterReset = await postLogin(
      requestWith({ email: 'reset@example.test', password: 'wrong' }, network),
    );
    expect(afterReset.status).toBe(401);
    expect(await afterReset.json()).toEqual({ error: 'Invalid email or password.' });
  });

  it('rejects oversized credentials generically before verification', async () => {
    configureRouteMocks({ valid: true });
    const response = await postLogin(
      requestWith({ email: `${'a'.repeat(255)}@example.test`, password: 'correct' }, '203.0.113.8'),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid email or password.' });
    expect(routeMocks.verifyCredentials).not.toHaveBeenCalled();
  });

  it('hashes network and account identifiers into a non-reversible key', () => {
    const attemptKey = key('  192.0.2.1 ', ' Admin@Example.Test ');

    expect(attemptKey).toMatch(/^[a-f0-9]{64}$/);
    expect(attemptKey).toBe(
      crypto.createHash('sha256').update('192.0.2.1\u0000admin@example.test').digest('hex'),
    );
    expect(attemptKey).not.toContain('admin@example.test');
  });

  it('starts cooldown at the threshold and expires it', () => {
    let now = 1_000;
    const tracker = new LoginProtectionTracker({
      failureThreshold: 3,
      cooldownMs: 500,
      entryTtlMs: 2_000,
      maxKeys: 10,
      now: () => now,
    });
    const attemptKey = key('192.0.2.1', 'admin@example.test');

    expect(tracker.isBlocked(attemptKey)).toBe(false);
    tracker.recordFailure(attemptKey);
    tracker.recordFailure(attemptKey);
    expect(tracker.isBlocked(attemptKey)).toBe(false);
    tracker.recordFailure(attemptKey);
    expect(tracker.isBlocked(attemptKey)).toBe(true);

    now += 500;
    expect(tracker.isBlocked(attemptKey)).toBe(false);
  });

  it('clears successful authentication records', () => {
    const tracker = new LoginProtectionTracker({ failureThreshold: 2, maxKeys: 10 });
    const attemptKey = key('192.0.2.1', 'admin@example.test');

    tracker.recordFailure(attemptKey);
    tracker.clearOnSuccess(attemptKey);
    tracker.recordFailure(attemptKey);
    expect(tracker.isBlocked(attemptKey)).toBe(false);
  });

  it('removes stale records and never exceeds the configured key cap', () => {
    let now = 10_000;
    const tracker = new LoginProtectionTracker({
      failureThreshold: 2,
      cooldownMs: 100,
      entryTtlMs: 100,
      maxKeys: 2,
      now: () => now,
    });

    tracker.recordFailure(key('192.0.2.1', 'one@example.test'));
    tracker.recordFailure(key('192.0.2.2', 'two@example.test'));
    tracker.recordFailure(key('192.0.2.3', 'three@example.test'));
    expect(tracker.size).toBe(2);

    now += 100;
    expect(tracker.size).toBe(0);
  });
});
