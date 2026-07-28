/**
 * Authentication for the admin area.
 *
 * Security model (static-auth phase):
 * - A single admin account is defined via environment variables
 *   (ADMIN_EMAIL, ADMIN_PASSWORD). No credentials are hardcoded.
 * - On login we issue a session token that is an HMAC-signed, expiring payload.
 * - The token is stored in an httpOnly, Secure, SameSite=Strict cookie so it is
 *   never readable by client-side JS (mitigates XSS token theft) and is not
 *   sent cross-site (mitigates CSRF).
 *
 * TODO(supabase): swap credential checking + sessions for Supabase Auth.
 * `verifyCredentials`, `createSessionToken`, and `verifySessionToken` are the
 * only functions that would change.
 */

import crypto from 'node:crypto';

/** Cookie name for the admin session. */
export const SESSION_COOKIE = 'bc_session';

/** Session lifetime in seconds (8 hours). */
const SESSION_TTL = 8 * 60 * 60;

/**
 * Read the signing secret from the environment.
 *
 * Throws if unset so we never sign sessions with a weak/empty key.
 * @returns {string} The session signing secret.
 */
function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET is not configured (min 16 chars).');
  }
  return secret;
}

/**
 * Constant-time string comparison to avoid timing attacks.
 *
 * @param {string} a - First value.
 * @param {string} b - Second value.
 * @returns {boolean} True if equal.
 */
function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual requires equal lengths; length inequality => not equal.
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify a submitted email/password against the configured admin account.
 *
 * Uses constant-time comparison for both fields so responses do not leak
 * whether the email or the password was the mismatch.
 *
 * @param {string} email - Submitted email.
 * @param {string} password - Submitted password.
 * @returns {boolean} True when both match the configured admin credentials.
 */
export function verifyCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    throw new Error('Admin credentials are not configured.');
  }
  // Evaluate both comparisons regardless, then AND, to keep timing uniform.
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passOk = safeEqual(password, expectedPassword);
  return emailOk && passOk;
}

/**
 * Base64url-encode a string or Buffer.
 * @param {string|Buffer} input - Value to encode.
 * @returns {string} base64url string.
 */
function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

/**
 * Create a signed, expiring session token for the given subject.
 *
 * Token format: `<payloadB64>.<hmacB64>` where payload is JSON
 * `{ sub, exp }`. The HMAC covers the payload, so tampering invalidates it.
 *
 * @param {string} subject - Identifier for the session (the admin email).
 * @returns {string} The signed session token.
 */
export function createSessionToken(subject) {
  const payload = { sub: subject, exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
  const payloadB64 = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

/**
 * Verify a session token's signature and expiry.
 *
 * @param {string|undefined} token - The token from the session cookie.
 * @returns {{ sub: string, exp: number }|null} The payload if valid, else null.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;

  const expected = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  // Signature check first — reject tampered tokens before trusting the payload.
  if (!safeEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Standard cookie options for the session cookie.
 *
 * `secure` is enabled outside development so local HTTP still works while
 * production always uses HTTPS-only cookies.
 * @returns {object} Cookie options for next/headers cookies().set.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL,
  };
}
