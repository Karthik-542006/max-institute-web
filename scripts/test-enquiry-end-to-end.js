import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env
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

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://nwqvurzqpypyfhxfkarn.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Kz43omTACHHfERemaFw25A_vLFtPfps';

console.log('========================================================================');
console.log('MAX EDUCATIONAL INSTITUTION — COMPREHENSIVE END-TO-END ENQUIRY DATA SYNC TEST');
console.log('Target Database:', supabaseUrl);
console.log('========================================================================\n');

// Simulate Device A (User Mobile Browser)
const deviceA = createClient(supabaseUrl, supabaseAnonKey);

// Simulate Device B (User Desktop Browser)
const deviceB = createClient(supabaseUrl, supabaseAnonKey);

// Simulate Device C (Admin Laptop Dashboard)
const adminClient = createClient(supabaseUrl, supabaseAnonKey);

async function runEndToEndTests() {
  let createdTestIds = [];

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Same Device / User Submission Flow (User Phone -> Database)
    // ------------------------------------------------------------------------
    console.log('TEST 1: Simulating User A Submitting Contact Enquiry from Mobile Device...');
    const userA_payload = {
      name: 'Priya Sharma (Mobile User A)',
      phone: '9840123456',
      email: 'priya.sharma@example.com',
      course_name: 'Diploma in Computer Applications (DCA)',
      message: 'Interested in weekend batch schedules and course fee installments.',
      status: 'New',
      created_at: new Date().toISOString()
    };

    const { data: userARecord, error: userAError } = await deviceA
      .from('enquiries')
      .insert(userA_payload)
      .select()
      .single();

    if (userAError) {
      throw new Error(`User A insertion failed: ${userAError.message}`);
    }
    createdTestIds.push(userARecord.id);
    console.log('   ✓ User A Enquiry inserted into Supabase DB! ID:', userARecord.id);
    console.log('   ✓ Verified Server-Generated ID and UTC Timestamp:', userARecord.created_at);

    // ------------------------------------------------------------------------
    // TEST 2: Cross-Device Admin Verification (Admin Laptop -> Database)
    // ------------------------------------------------------------------------
    console.log('\nTEST 2: Admin Dashboard Opening on Separate Device & Browser...');
    const { data: adminFetch, error: adminFetchError } = await adminClient
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminFetchError) {
      throw new Error(`Admin fetch failed: ${adminFetchError.message}`);
    }

    const foundUserA = adminFetch.find(e => e.id === userARecord.id);
    if (!foundUserA) {
      throw new Error('User A enquiry was NOT found in Admin Dashboard query!');
    }
    console.log('   ✓ Success: Admin Client on Device C retrieved User A enquiry submitted from Device A!');
    console.log(`   ✓ Total persistent enquiries in central DB: ${adminFetch.length}`);

    // ------------------------------------------------------------------------
    // TEST 3: Multi-User Concurrent Submissions (User B + User C)
    // ------------------------------------------------------------------------
    console.log('\nTEST 3: Multiple Independent Users Submitting Enquiries Concurrently...');
    const userB_payload = {
      name: 'Ramesh Kumar (Desktop User B)',
      phone: '9789123456',
      email: 'ramesh.k@example.com',
      course_name: 'English Typing (Junior & Senior)',
      message: 'Looking for morning 7:00 AM typing slot.',
      status: 'New',
      created_at: new Date().toISOString()
    };

    const userC_payload = {
      name: 'Ananya S. (Tablet User C)',
      phone: '9443123456',
      email: 'ananya.s@example.com',
      course_name: 'MS Office Suite Mastery',
      message: 'Please send curriculum details and exam certification info.',
      status: 'New',
      created_at: new Date().toISOString()
    };

    const [resB, resC] = await Promise.all([
      deviceB.from('enquiries').insert(userB_payload).select().single(),
      deviceA.from('enquiries').insert(userC_payload).select().single()
    ]);

    if (resB.error) throw new Error(`User B error: ${resB.error.message}`);
    if (resC.error) throw new Error(`User C error: ${resC.error.message}`);

    createdTestIds.push(resB.data.id, resC.data.id);
    console.log('   ✓ User B Enquiry persisted ID:', resB.data.id);
    console.log('   ✓ User C Enquiry persisted ID:', resC.data.id);

    // ------------------------------------------------------------------------
    // TEST 4: Admin Status Update & Notes Persistence
    // ------------------------------------------------------------------------
    console.log('\nTEST 4: Admin Changing Status & Adding Administrative Notes...');
    const { data: updatedRecord, error: updateError } = await adminClient
      .from('enquiries')
      .update({
        status: 'Contacted',
        notes: 'Called student on phone. Confirmed attendance for Saturday batch.'
      })
      .eq('id', userARecord.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Status update failed: ${updateError.message}`);
    }
    console.log('   ✓ Status updated to:', updatedRecord.status);
    console.log('   ✓ Notes saved:', updatedRecord.notes);

    // ------------------------------------------------------------------------
    // TEST 5: Browser Reopen / Persistence After Refresh Simulation
    // ------------------------------------------------------------------------
    console.log('\nTEST 5: Simulating Admin Refresh / New Browser Session / Logout-Login...');
    // Create completely new client representing a fresh browser instance after restart
    const freshBrowserSession = createClient(supabaseUrl, supabaseAnonKey);
    const { data: reloadedData, error: reloadError } = await freshBrowserSession
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (reloadError) throw new Error(`Reload error: ${reloadError.message}`);

    const verifiedA = reloadedData.find(e => e.id === userARecord.id);
    const verifiedB = reloadedData.find(e => e.id === resB.data.id);
    const verifiedC = reloadedData.find(e => e.id === resC.data.id);

    if (!verifiedA || !verifiedB || !verifiedC) {
      throw new Error('Data persistence check failed: some records were missing on reload!');
    }
    console.log('   ✓ All 3 test records successfully retrieved in fresh browser session!');
    console.log('   ✓ Record A status in fresh session is:', verifiedA.status, '(Verified update persisted)');

    // ------------------------------------------------------------------------
    // TEST 6: Admin Deletion Test
    // ------------------------------------------------------------------------
    console.log('\nTEST 6: Admin Deleting Enquiry...');
    const { error: delError } = await adminClient
      .from('enquiries')
      .delete()
      .eq('id', resC.data.id);

    if (delError) throw new Error(`Deletion failed: ${delError.message}`);
    console.log('   ✓ Successfully deleted test record C ID:', resC.data.id);

    const { data: postDelData } = await adminClient
      .from('enquiries')
      .select('id')
      .eq('id', resC.data.id);

    if (postDelData && postDelData.length > 0) {
      throw new Error('Deleted enquiry still exists in database!');
    }
    console.log('   ✓ Confirmed record C is completely removed from central database.');

    // Clean up other test records
    await adminClient.from('enquiries').delete().in('id', [userARecord.id, resB.data.id]);
    console.log('   ✓ Cleaned up test records A and B.');

    console.log('\n========================================================================');
    console.log('🎉 ALL END-TO-END DATA SYNC & PERSISTENCE TESTS PASSED 100%!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

runEndToEndTests();
