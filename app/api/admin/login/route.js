import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyCredentials,
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '@/lib/auth';
import {
  createAttemptKey,
  createTracker,
  extractNetworkId,
  normalizeEmail,
} from '@/lib/login-protection';

/** Generic response for every invalid or blocked login request. */
const GENERIC_LOGIN_ERROR = 'Invalid email or password.';

/**
 * Keep credential processing bounded before constant-time verification so a
 * hostile request cannot consume disproportionate CPU or memory.
 */
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;

/**
 * Return the client-safe response shared by all credential failures. Cooldown
 * requests intentionally use the same status as invalid credentials so the
 * limiter state is not disclosed through the response contract.
 * @param {number} status - HTTP status appropriate for the request shape.
 * @returns {NextResponse} Generic JSON error response.
 */
function genericLoginResponse(status) {
  return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status });
}

/**
 * Process-local limiter instance. It stores only hashed network/account keys,
 * and is best-effort protection rather than a distributed production boundary.
 * See lib/login-protection.js for full documentation of limitations.
 */
const loginTracker = createTracker();

/**
 * POST /api/admin/login
 *
 * Verifies static admin credentials and, on success, sets a signed httpOnly
 * session cookie. All malformed, failed, and cooling-down requests share the
 * same generic client response so the endpoint never reveals account existence,
 * cooldown state, or which credential was incorrect.
 *
 * @param {Request} request - Incoming request with JSON { email, password }.
 * @returns {Promise<NextResponse>} JSON result; sets the session cookie on success.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return genericLoginResponse(400);
  }

  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const normalizedEmail = normalizeEmail(email);
  const networkId = extractNetworkId(request.headers);
  const attemptKey = createAttemptKey(networkId, normalizedEmail);

  if (
    !email ||
    !password ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return genericLoginResponse(400);
  }

  // Check rate limit after parsing — same generic 401 whether cooldown or bad creds.
  if (loginTracker.isBlocked(attemptKey)) {
    return genericLoginResponse(401);
  }

  // Constant-time credential verification — do not disclose which field was incorrect.
  let credentialsValid = false;
  try {
    credentialsValid = verifyCredentials(email, password);
  } catch {
    // Configuration failures are not client-actionable and must not disclose details.
    return genericLoginResponse(401);
  }

  if (!credentialsValid) {
    loginTracker.recordFailure(attemptKey);
    return genericLoginResponse(401);
  }

  // Successful authentication — clear failure record to prevent lockout of legitimate user.
  loginTracker.clearOnSuccess(attemptKey);
  const token = createSessionToken(normalizedEmail);
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions());

  return NextResponse.json({ ok: true });
}
