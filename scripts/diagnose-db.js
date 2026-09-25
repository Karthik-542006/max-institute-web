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

async function checkDatabase() {
  console.log('Testing Supabase connection to:', supabaseUrl);
  
  const tables = ['site_settings', 'gallery', 'profiles', 'admin_activity_log', 'courses', 'faculty', 'reviews', 'enquiries', 'faq', 'posts'];
  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(2);
      if (error) {
        console.log(`Table [${t}]: ERROR ->`, error.message, error.code);
      } else {
        console.log(`Table [${t}]: OK (${count !== null ? count : data?.length} rows)`);
        if (data && data[0]) {
          console.log(`   Sample columns in [${t}]:`, Object.keys(data[0]).join(', '));
        }
      }
    } catch (e) {
      console.log(`Table [${t}]: EXCEPTION ->`, e.message);
    }
  }

  // Check Storage buckets
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.log('Storage buckets check ERROR:', bErr.message);
    } else {
      console.log('Storage buckets:', buckets.map(b => `${b.name} (public: ${b.public})`));
    }
  } catch (e) {
    console.log('Storage check exception:', e.message);
  }
}

checkDatabase();
