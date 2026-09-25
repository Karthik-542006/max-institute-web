import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const clientAnon = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  console.log('Testing RLS policies on `enquiries`...');

  // 1. Anon SELECT
  const { data: selectData, error: selectErr } = await clientAnon
    .from('enquiries')
    .select('*')
    .limit(5);
  console.log('1. Anonymous SELECT:', selectErr ? `DENIED (${selectErr.message})` : `ALLOWED (${selectData?.length} rows returned)`);

  // 2. Anon INSERT
  const testId = '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000);
  const { data: insertData, error: insertErr } = await clientAnon
    .from('enquiries')
    .insert({
      id: testId,
      name: 'RLS Test User',
      phone: '1234567890',
      message: 'Testing RLS',
      status: 'New'
    })
    .select();
  console.log('2. Anonymous INSERT:', insertErr ? `DENIED (${insertErr.message})` : `ALLOWED (id: ${insertData?.[0]?.id})`);

  // 3. Anon UPDATE
  const { data: updateData, error: updateErr } = await clientAnon
    .from('enquiries')
    .update({ status: 'Contacted' })
    .eq('id', testId)
    .select();
  console.log('3. Anonymous UPDATE:', updateErr ? `DENIED (${updateErr.message})` : (updateData?.length ? `ALLOWED (${updateData.length} updated)` : 'BLOCKED / 0 updated'));

  // 4. Anon DELETE
  const { data: deleteData, error: deleteErr } = await clientAnon
    .from('enquiries')
    .delete()
    .eq('id', testId)
    .select();
  console.log('4. Anonymous DELETE:', deleteErr ? `DENIED (${deleteErr.message})` : (deleteData?.length ? `ALLOWED (${deleteData.length} deleted)` : 'BLOCKED / 0 deleted'));
}

checkRLS();
