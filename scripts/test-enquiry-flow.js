import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const clientAnon = createClient(supabaseUrl, supabaseKey);
const clientAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Checking enquiries in Supabase ---');
  const { data: existing, error: readErr } = await clientAdmin.from('enquiries').select('*');
  if (readErr) {
    console.error('Error reading enquiries:', readErr);
  } else {
    console.log(`Current enquiries in DB: ${existing.length}`);
    console.log(existing);
  }

  console.log('\n--- Testing Anonymous User Insertion ---');
  const testPayload = {
    name: 'Test Student ' + Date.now(),
    phone: '9876543210',
    email: 'test@example.com',
    course_name: 'Basic Computer Training',
    message: 'Testing user enquiry submission flow',
    status: 'New'
  };

  const { data: inserted, error: insertErr } = await clientAnon.from('enquiries').insert(testPayload).select().single();
  if (insertErr) {
    console.error('❌ Insert failed:', insertErr);
  } else {
    console.log('✓ Successfully inserted enquiry:', inserted);
  }

  console.log('\n--- Testing Admin Fetch from separate client ---');
  const { data: adminFetch, error: adminErr } = await clientAdmin.from('enquiries').select('*').order('created_at', { ascending: false });
  if (adminErr) {
    console.error('❌ Admin fetch failed:', adminErr);
  } else {
    const found = adminFetch.find(e => e.id === inserted?.id);
    console.log(`✓ Admin fetched ${adminFetch.length} total enquiries. Found new submission: ${Boolean(found)}`);
  }
}

run();
