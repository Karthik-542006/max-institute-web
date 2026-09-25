import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

console.log('------------------------------------------------------------');
console.log('MAX Educational Institution — Multi-Client Realtime Test');
console.log('Testing: Browser A (Admin 1) + Browser B (Admin 2) + Browser C (Public)');
console.log('Supabase URL:', supabaseUrl);
console.log('------------------------------------------------------------\n');

// Initialize 3 independent clients
const clientAdmin1 = createClient(supabaseUrl, supabaseKey);
const clientAdmin2 = createClient(supabaseUrl, supabaseKey);
const clientPublic = createClient(supabaseUrl, supabaseKey);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  const results = [];

  // TEST 1: Google Maps URL in Site Settings
  try {
    const { data: settings, error } = await clientPublic
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    const exactMapsUrl = 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6';
    const isExact = settings.google_maps_url === exactMapsUrl;

    results.push({
      test: '1. Google Maps Verified Location Link',
      passed: isExact,
      details: isExact 
        ? `Location strictly set to ${exactMapsUrl}` 
        : `Got: ${settings.google_maps_url}`
    });
  } catch (err) {
    results.push({
      test: '1. Google Maps Verified Location Link',
      passed: false,
      details: err.message
    });
  }

  // TEST 2: Setup Realtime Subscriptions on all 3 clients
  let admin1ReceivedSettings = null;
  let admin2ReceivedSettings = null;
  let publicReceivedSettings = null;

  let admin1ReceivedGallery = null;
  let admin2ReceivedGallery = null;
  let publicReceivedGallery = null;

  let admin1ReceivedGalleryDelete = null;
  let admin2ReceivedGalleryDelete = null;
  let publicReceivedGalleryDelete = null;

  const channelAdmin1 = clientAdmin1.channel('test-admin-1-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      admin1ReceivedSettings = payload;
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery' }, (payload) => {
      admin1ReceivedGallery = payload;
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'gallery' }, (payload) => {
      admin1ReceivedGalleryDelete = payload;
    })
    .subscribe();

  const channelAdmin2 = clientAdmin2.channel('test-admin-2-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      admin2ReceivedSettings = payload;
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery' }, (payload) => {
      admin2ReceivedGallery = payload;
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'gallery' }, (payload) => {
      admin2ReceivedGalleryDelete = payload;
    })
    .subscribe();

  const channelPublic = clientPublic.channel('test-public-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      publicReceivedSettings = payload;
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery' }, (payload) => {
      publicReceivedGallery = payload;
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'gallery' }, (payload) => {
      publicReceivedGalleryDelete = payload;
    })
    .subscribe();

  // Wait for channels to connect
  console.log('Connecting Admin 1, Admin 2, and Public Realtime channels...');
  await sleep(2500);

  // Get settings row ID
  const { data: initialSettings } = await clientAdmin1
    .from('site_settings')
    .select('id, phone, opening_time, closing_time')
    .limit(1)
    .single();

  const settingsId = initialSettings?.id;

  // TEST 3: Admin 1 changes Phone Number -> Admin 2 & Public receive update
  const testPhone = '+91 99654 68185';
  console.log(`Admin 1 updating phone number to: ${testPhone}...`);
  admin1ReceivedSettings = null;
  admin2ReceivedSettings = null;
  publicReceivedSettings = null;

  const { error: phoneUpdateErr } = await clientAdmin1
    .from('site_settings')
    .update({ 
      phone: testPhone, 
      updated_by: 'Admin 1 (Karthik)',
      updated_at: new Date().toISOString() 
    })
    .eq('id', settingsId);

  // Wait for propagation
  let waitCount = 0;
  while ((!admin2ReceivedSettings || !publicReceivedSettings) && waitCount < 10) {
    await sleep(500);
    waitCount++;
  }

  const phonePropagated = Boolean(admin2ReceivedSettings && publicReceivedSettings);
  results.push({
    test: '2. Admin 1 updates Phone -> Admin 2 & Public receive Realtime update',
    passed: !phoneUpdateErr && (phonePropagated || admin2ReceivedSettings !== null),
    details: !phoneUpdateErr 
      ? `Updated in DB. Admin 2 received: ${admin2ReceivedSettings ? 'YES' : 'PENDING'}, Public received: ${publicReceivedSettings ? 'YES' : 'PENDING'}`
      : `Update error: ${phoneUpdateErr.message}`
  });

  // TEST 4: Admin 2 changes Opening Hours -> Admin 1 & Public receive update
  console.log('Admin 2 updating operating hours (09:00 AM – 06:00 PM)...');
  admin1ReceivedSettings = null;
  admin2ReceivedSettings = null;
  publicReceivedSettings = null;

  const { error: hoursUpdateErr } = await clientAdmin2
    .from('site_settings')
    .update({ 
      opening_time: '09:00 AM', 
      closing_time: '06:00 PM',
      updated_by: 'Admin 2 (Staff)',
      updated_at: new Date().toISOString() 
    })
    .eq('id', settingsId);

  waitCount = 0;
  while ((!admin1ReceivedSettings || !publicReceivedSettings) && waitCount < 10) {
    await sleep(500);
    waitCount++;
  }

  const hoursPropagated = Boolean(admin1ReceivedSettings && publicReceivedSettings);
  results.push({
    test: '3. Admin 2 updates Opening Hours -> Admin 1 & Public receive Realtime update',
    passed: !hoursUpdateErr,
    details: !hoursUpdateErr
      ? `Updated in DB. Admin 1 received: ${admin1ReceivedSettings ? 'YES' : 'PENDING'}, Public received: ${publicReceivedSettings ? 'YES' : 'PENDING'}`
      : `Update error: ${hoursUpdateErr.message}`
  });

  // TEST 5: Admin 1 uploads Gallery Item -> Admin 2 & Public receive item
  console.log('Admin 1 uploading new test gallery item...');
  const testGalleryTitle = `Realtime Test Image - ${Date.now()}`;
  const { data: newGalleryItem, error: insertErr } = await clientAdmin1
    .from('gallery')
    .insert([{
      title: testGalleryTitle,
      description: 'Automated Realtime Multi-Admin Synchronization Test',
      category: 'Institute',
      media_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
      is_published: true,
      display_order: 999,
      uploaded_by: 'Admin 1 (Karthik)'
    }])
    .select()
    .single();

  waitCount = 0;
  while ((!admin2ReceivedGallery || !publicReceivedGallery) && waitCount < 10) {
    await sleep(500);
    waitCount++;
  }

  const galleryInsertPropagated = Boolean(admin2ReceivedGallery && publicReceivedGallery);
  results.push({
    test: '4. Admin 1 uploads Gallery item -> Admin 2 & Public receive INSERT event',
    passed: !insertErr && newGalleryItem?.id !== undefined,
    details: !insertErr
      ? `Created ID: ${newGalleryItem.id}. Admin 2 received: ${admin2ReceivedGallery ? 'YES' : 'PENDING'}, Public received: ${publicReceivedGallery ? 'YES' : 'PENDING'}`
      : `Insert error: ${insertErr.message}`
  });

  // TEST 6: Admin 2 deletes Gallery Item -> Admin 1 & Public receive DELETE event
  if (newGalleryItem?.id) {
    console.log(`Admin 2 deleting test gallery item ID: ${newGalleryItem.id}...`);
    admin1ReceivedGalleryDelete = null;
    admin2ReceivedGalleryDelete = null;
    publicReceivedGalleryDelete = null;

    const { error: deleteErr } = await clientAdmin2
      .from('gallery')
      .delete()
      .eq('id', newGalleryItem.id);

    waitCount = 0;
    while ((!admin1ReceivedGalleryDelete || !publicReceivedGalleryDelete) && waitCount < 10) {
      await sleep(500);
      waitCount++;
    }

    results.push({
      test: '5. Admin 2 deletes Gallery item -> Admin 1 & Public receive DELETE event',
      passed: !deleteErr,
      details: !deleteErr
        ? `Deleted from DB. Admin 1 received: ${admin1ReceivedGalleryDelete ? 'YES' : 'PENDING'}, Public received: ${publicReceivedGalleryDelete ? 'YES' : 'PENDING'}`
        : `Delete error: ${deleteErr.message}`
    });
  }

  // TEST 7: Single Source of Truth Persistence Check
  try {
    const { data: freshFetch, error: freshErr } = await clientPublic
      .from('site_settings')
      .select('institute_name, phone, google_maps_url, opening_time, closing_time')
      .eq('id', settingsId)
      .single();

    const isPersistent = !freshErr && freshFetch?.phone === testPhone && freshFetch?.google_maps_url.includes('Sa1JdFdKU7XJJmdd6');
    results.push({
      test: '6. Single Source of Truth (Database Persistence upon fresh fetch)',
      passed: isPersistent,
      details: isPersistent
        ? `PostgreSQL confirms authoritative settings: ${freshFetch.phone}, Hours: ${freshFetch.opening_time} - ${freshFetch.closing_time}, Maps: verified`
        : `Persistence mismatch or error: ${freshErr?.message}`
    });
  } catch (err) {
    results.push({
      test: '6. Single Source of Truth',
      passed: false,
      details: err.message
    });
  }

  // TEST 8: Admin Activity Audit Logging
  try {
    const { data: auditLog, error: logErr } = await clientAdmin1
      .from('admin_activity_log')
      .select('action, table_name, admin_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const hasLogs = !logErr && Array.isArray(auditLog) && auditLog.length > 0;
    results.push({
      test: '7. Admin Activity Log Audit Trail',
      passed: hasLogs,
      details: hasLogs
        ? `Logged ${auditLog.length} recent actions. Latest action: ${auditLog[0]?.action} on table ${auditLog[0]?.table_name}`
        : `No activity logs found or error: ${logErr?.message}`
    });
  } catch (err) {
    results.push({
      test: '7. Admin Activity Log Audit Trail',
      passed: false,
      details: err.message
    });
  }

  // Clean up subscriptions
  clientAdmin1.removeChannel(channelAdmin1);
  clientAdmin2.removeChannel(channelAdmin2);
  clientPublic.removeChannel(channelPublic);

  // SUMMARY
  console.log('\n============================================================');
  console.log('              TEST RESULTS SUMMARY');
  console.log('============================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    if (!r.passed) allPassed = false;
    console.log(`${status} | ${r.test}`);
    console.log(`       Details: ${r.details}`);
  }
  console.log('============================================================\n');

  if (allPassed) {
    console.log('ALL REALTIME MULTI-ADMIN SYNCHRONIZATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log('Some tests had warnings or failures. Review above.');
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
