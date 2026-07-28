/**
 * Quick test to verify Supabase connection and table access.
 * Run with: node scripts/test-supabase.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key, ...rest] = trimmed.split('=');
  env[key.trim()] = rest.join('=').trim();
}

const url = env.SUPABASE_PROJECT_URL;
const key = env.SUPABASE_SERVICE_ROLE;

if (!url || !key) {
  console.error('❌ Missing SUPABASE_PROJECT_URL or SUPABASE_SERVICE_ROLE in .env.local');
  process.exit(1);
}

console.log(`Connecting to: ${url}`);

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Test orders table
const { data: d1, error: e1 } = await supabase.from('orders').select('id').limit(1);
console.log('orders table:', e1 ? `❌ ERROR — ${e1.message}` : `✅ OK (${d1.length} rows found)`);

// Test site_content table
const { data: d2, error: e2 } = await supabase.from('site_content').select('section').limit(1);
console.log('site_content table:', e2 ? `❌ ERROR — ${e2.message}` : `✅ OK (${d2.length} rows found)`);

// Try inserting a test order
const testId = `TEST-${Date.now()}`;
const { error: e3 } = await supabase.from('orders').insert({
  id: testId, name: 'Test', email: 'test@test.com', phone: '000',
  service: 'Test', address1: '1 Test St', city: 'Test', postcode: 'TE1 1ST',
  date: '2026-01-01', slot: '10:00–12:00', status: 'pending', items: [], total: 0,
  created_at: new Date().toISOString(),
});
console.log('insert order:', e3 ? `❌ ERROR — ${e3.message}` : '✅ OK');

// Clean up test order
if (!e3) {
  await supabase.from('orders').delete().eq('id', testId);
  console.log('cleanup:', '✅ test order removed');
}

console.log('\n🎉 Connection test complete!');
