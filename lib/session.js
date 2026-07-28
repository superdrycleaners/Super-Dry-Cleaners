/**
 * Server-side session helpers for the admin area.
 *
 * These run in server components, server actions, and route handlers to
 * authoritatively verify the session (HMAC signature + expiry) using
 * node:crypto. Middleware does a cheap structural check; this is the real one.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Read and verify the current admin session from cookies.
 *
 * @returns {{ sub: string, exp: number }|null} The session payload, or null.
 */
export function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Require a valid admin session or redirect to the login page.
 *
 * Call at the top of every protected server component and mutation.
 * @returns {{ sub: string, exp: number }} The verified session payload.
 */
export function requireSession() {
  const session = getSession();
  if (!session) redirect('/admin/login');
  return session;
}
