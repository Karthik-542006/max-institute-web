import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
}

const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSettingsAndStorage() {
  const { data: settings, error: sErr } = await supabase.from('site_settings').select('*');
  console.log('Site settings data:', settings);

  // Test uploading a tiny test file to storage bucket 'gallery'
  const testBuffer = Buffer.from('test-image-content');
  const testPath = `test/test-${Date.now()}.txt`;
  const { data: upData, error: upErr } = await supabase.storage.from('gallery').upload(testPath, testBuffer, {
    contentType: 'text/plain',
    upsert: true
  });
  console.log('Storage upload test to gallery bucket:', { upData, upErr });
  if (!upErr && upData) {
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(testPath);
    console.log('Public URL:', urlData.publicUrl);
    // clean up
    await supabase.storage.from('gallery').remove([testPath]);
    console.log('Test file cleaned up.');
  }

  // Test Realtime connection
  console.log('Testing Realtime subscription...');
  const channel = supabase.channel('test-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      console.log('Realtime event received:', payload);
    })
    .subscribe((status, err) => {
      console.log('Realtime subscribe status:', status, err || '');
    });

  setTimeout(async () => {
    await supabase.removeChannel(channel);
    console.log('Realtime test complete.');
    process.exit(0);
  }, 4000);
}

inspectSettingsAndStorage();
