import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function postScheduledAnnouncement() {
  const title = process.argv[2] || '🚀 New DCA & English Typing Morning Batches Starting!';
  const category = process.argv[3] || 'Admission Notice';
  const content = process.argv[4] || 'Special admissions open for school & college students with flexible lab timings.';

  const now = new Date();
  const startTime = now.toISOString();
  // Expires in 14 days by default
  const endTime = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  console.log(`\n======================================================`);
  console.log(`🚀 Posting Scheduled Announcement to Database...`);
  console.log(`======================================================`);
  console.log(`📣 Title: ${title}`);
  console.log(`🏷️ Category: ${category}`);
  console.log(`⏰ Start Time: ${startTime}`);
  console.log(`⌛ End Time: ${endTime}`);

  const post = {
    title,
    category,
    content,
    action_label: 'Enquire Now',
    action_link: '/contact',
    is_active: true,
    start_time: startTime,
    end_time: endTime,
    created_at: now.toISOString()
  };

  const { data, error } = await supabase.from('posts').insert(post).select().single();

  if (error) {
    console.error('\n❌ Failed to insert announcement:', error.message);
    process.exit(1);
  }

  console.log('\n✅ ANNOUNCEMENT SUCCESSFULLY STORED & SCHEDULED!');
  console.log('📄 Saved Database Record:', data);
  console.log('🔔 It will now render live at the top of the website banner across ALL devices!');
  console.log(`======================================================\n`);
}

postScheduledAnnouncement();
