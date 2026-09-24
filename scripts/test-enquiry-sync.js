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

async function sendTestEnquiry() {
  const sampleName = process.argv[2] || 'Multi-Device Test Student';
  const samplePhone = process.argv[3] || '9876543210';
  const sampleCourse = process.argv[4] || 'Diploma in Computer Applications (DCA)';
  const sampleMessage = process.argv[5] || 'Testing direct database submission & live multi-device admin page sync.';

  console.log(`\n======================================================`);
  console.log(`🚀 Sending test enquiry directly to Supabase Database...`);
  console.log(`======================================================`);
  console.log(`👤 Name: ${sampleName}`);
  console.log(`📞 Phone: ${samplePhone}`);
  console.log(`📚 Course: ${sampleCourse}`);
  console.log(`💬 Message: ${sampleMessage}`);

  const enquiry = {
    name: sampleName,
    phone: samplePhone,
    email: 'student.test@maxinstitute.edu.in',
    course_name: sampleCourse,
    message: sampleMessage,
    status: 'New',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('enquiries').insert(enquiry).select().single();

  if (error) {
    console.error('\n❌ Failed to insert enquiry into database:', error.message);
    process.exit(1);
  }

  console.log('\n✅ ENQUIRY SUCCESSFULLY STORED IN DATABASE!');
  console.log('📄 Saved Database Record:', data);
  console.log('🔔 All admin dashboards across ALL connected devices (mobile, laptop, desktop) will now update instantly!');
  console.log(`======================================================\n`);
}

sendTestEnquiry();
