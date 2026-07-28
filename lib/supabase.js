/**
 * Supabase client for server-side operations.
 *
 * Uses the service_role key so it bypasses RLS — this client must NEVER
 * be imported in client components or exposed to the browser. All access
 * is mediated through the data-access layer in lib/data/*.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

/**
 * Server-only Supabase client with service_role privileges.
 * Returns null if env vars are not configured (allows graceful fallback).
 * Do not import this in any client ('use client') component.
 */
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;
