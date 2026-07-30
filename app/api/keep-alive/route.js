import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure the route is not statically cached

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert a new log entry to keep the database awake and keep a record of the ping.
    const { data, error } = await supabase
      .from('keep_alive_logs')
      .insert([{ pinged_at: new Date().toISOString() }])
      .select();

    if (error) {
      throw new Error(`Failed to log ping: ${error.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Supabase ping logged successfully.',
        log: data[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
