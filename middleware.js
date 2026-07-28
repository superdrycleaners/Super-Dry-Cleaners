/**
 * Edge middleware: protects the admin area.
 *
 * Every request to /admin/** (except the login page and the login API) must
 * carry a valid session cookie. Unauthenticated requests are redirected to the
 * login page. This is the first line of defense; server components and route
 * handlers also re-check the session (defense in depth).
 *
 * Note: signature verification here is a lightweight presence + structure
 * check because Web Crypto in the edge runtime differs from node:crypto. The
 * authoritative verification (HMAC + expiry) runs in `requireSession()` on the
 * server for every protected page and mutation.
 */

import { NextResponse } from 'next/server';

/** Cookie name for the admin session — must match lib/auth.js */
const SESSION_COOKIE = 'bc_session';

/**
 * Middleware entry point.
 * @param {import('next/server').NextRequest} request - Incoming request.
 * @returns {NextResponse} The response (next or redirect).
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page and its API through without a session.
  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // Basic structural gate at the edge; full HMAC check happens server-side.
  const looksValid = typeof token === 'string' && token.split('.').length === 2;
  if (!looksValid) {
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
