/**
 * Edge middleware: protects the admin area.
 *
 * Every request to /admin/** (except the login page and the login API) must
 * carry a valid, cryptographically verified session cookie. Unauthenticated
 * requests are redirected to the login page (or return 401 for API routes).
 *
 * Authoritative cryptographic verification runs at the Edge via Web Crypto API
 * (`crypto.subtle`) ensuring forged or expired tokens are stopped before reaching
 * backend server components.
 */

import { NextResponse } from 'next/server';

/** Cookie name for the admin session — must match lib/auth.js */
const SESSION_COOKIE = 'bc_session';

/**
 * Decode a base64url string to a Uint8Array.
 * Compatible with Edge Runtime and standard Web Crypto.
 *
 * @param {string} str - Base64url string.
 * @returns {Uint8Array} Decoded binary bytes.
 */
function base64UrlToBytes(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Verify HMAC-SHA256 signature and expiration using Web Crypto API.
 *
 * @param {string|undefined} token - The raw session cookie token `<payloadB64>.<sigB64>`.
 * @param {string|undefined} secret - The session secret.
 * @returns {Promise<boolean>} True if signature is authentic and not expired.
 */
async function verifySessionTokenEdge(token, secret) {
  if (!token || typeof token !== 'string' || !secret || secret.length < 16) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = base64UrlToBytes(sigB64);
    const dataBytes = encoder.encode(payloadB64);

    const isValidSig = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!isValidSig) return false;

    // Decode and verify expiration
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);

    if (!payload || !payload.exp || typeof payload.exp !== 'number') {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp >= now;
  } catch {
    return false;
  }
}

/**
 * Middleware entry point.
 * @param {import('next/server').NextRequest} request - Incoming request.
 * @returns {Promise<NextResponse>} The response (next, redirect, or 401).
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page and its API through without a session.
  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;

  const isValid = await verifySessionTokenEdge(token, secret);
  if (!isValid) {
    // Return 401 Unauthorized for admin API endpoints
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Redirect to login for admin pages, preserving return path
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/** Only run middleware on admin pages and admin APIs. */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
