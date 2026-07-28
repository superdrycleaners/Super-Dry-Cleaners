import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth';

/**
 * POST /api/admin/logout
 *
 * Clears the session cookie, ending the admin session.
 * @returns {Promise<NextResponse>} JSON result with the cookie removed.
 */
export async function POST() {
  cookies().delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
