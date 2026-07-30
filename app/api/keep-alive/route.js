import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure the route is not statically cached

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Perform a lightweight request. We'll query a dummy table. 
    // Even if the table doesn't exist, the request reaches the database and counts as activity,
    // which is sufficient to prevent the project from being paused.
    const { error } = await supabase.from('keep_alive_ping_dummy').select('*').limit(1);

    return NextResponse.json(
      {
        success: true,
        message: 'Supabase pinged successfully.',
        db_status: error ? 'pinged_with_expected_error' : 'ok',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
