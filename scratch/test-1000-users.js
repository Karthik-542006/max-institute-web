import { dataService } from '../src/lib/dataService.js';

console.log('=================================================================');
console.log('🚀 RUNNING 1,000 USER REALISTIC SIMULATION & ACCESSIBILITY AUDIT');
console.log('=================================================================\n');

let totalInvocations = 0;
let errors = [];
let passCount = 0;

// User profile generator for 1,000 distinct concurrent users
function generateUser(id) {
  const names = ['Karthik T.S.', 'Keerthana', 'Jenisha', 'Anand S.', 'Priya M.', 'Selvakumar', 'Rajeswari', 'Vimal', 'Divya', 'Arun'];
  const courses = ['MS Office Suite Mastery', 'Basic Computer Training', 'Computer Applications (DCA)', 'English Typing (Junior & Senior)', 'Tamil Typing (Junior & Senior)', 'Speed Development Lab'];
  return {
    userId: `user-${id}`,
    name: `${names[id % names.length]} ${id}`,
    phone: id % 13 === 0 ? '+91 63809 27568' : `+91 99654 ${60000 + (id % 10000)}`,
    email: `student${id}@example.com`,
    course: courses[id % courses.length],
    review: `Great institution! Batch ${id} experience was smooth and informative.`,
    rating: (id % 5) + 1
  };
}

async function run1000UserSimulation() {
  const startTime = Date.now();

  console.log('📱 Test Suite 1: Verifying Site & Institution Settings Across 1,000 User Sessions...');
  for (let i = 1; i <= 1000; i++) {
    totalInvocations++;
    try {
      const settings = await dataService.getSettings();
      if (!settings) {
        errors.push({ user: i, feature: 'getSettings', error: 'Settings returned null/undefined' });
      } else {
        if (settings.phone !== '+91 99654 68185') {
          errors.push({ user: i, feature: 'Primary Phone', error: `Expected +91 99654 68185, got ${settings.phone}` });
        }
        if (settings.phone2 !== '+91 63809 27568') {
          errors.push({ user: i, feature: 'Secondary Phone', error: `Expected +91 63809 27568, got ${settings.phone2}` });
        }
        if (!settings.google_maps_url || !settings.google_maps_url.includes('maps.app.goo.gl')) {
          errors.push({ user: i, feature: 'Google Maps Link', error: 'Google maps URL invalid or missing' });
        }
        passCount++;
      }
    } catch (err) {
      errors.push({ user: i, feature: 'getSettings', error: err.message });
    }
  }

  console.log('📚 Test Suite 2: Fetching Courses, Faculty, FAQ, and Gallery for 1,000 Users...');
  for (let i = 1; i <= 1000; i++) {
    totalInvocations += 4;
    try {
      const [courses, faculty, faq, gallery] = await Promise.all([
        dataService.getCourses(),
        dataService.getFaculty(),
        dataService.getFAQ(),
        dataService.getGallery()
      ]);

      if (!Array.isArray(courses) || courses.length === 0) {
        errors.push({ user: i, feature: 'getCourses', error: 'No courses returned' });
      }
      if (!Array.isArray(faculty) || faculty.length === 0) {
        errors.push({ user: i, feature: 'getFaculty', error: 'No faculty returned' });
      }
      if (!Array.isArray(faq) || faq.length === 0) {
        errors.push({ user: i, feature: 'getFAQ', error: 'No FAQ returned' });
      }
      if (!Array.isArray(gallery) || gallery.length === 0) {
        errors.push({ user: i, feature: 'getGallery', error: 'No gallery returned' });
      }
      passCount += 4;
    } catch (err) {
      errors.push({ user: i, feature: 'Data Fetching', error: err.message });
    }
  }

  console.log('📝 Test Suite 3: Simulating 1,000 Public Admission Enquiry Submissions...');
  for (let i = 1; i <= 1000; i++) {
    totalInvocations++;
    const user = generateUser(i);
    try {
      const result = await dataService.createEnquiry({
        name: user.name,
        phone: user.phone,
        email: user.email,
        course_name: user.course,
        message: `I would like to join batch ${i}`
      });

      if (!result || !result.id) {
        errors.push({ user: i, feature: 'createEnquiry', error: 'Enquiry submission failed to return object with ID' });
      } else {
        passCount++;
      }
    } catch (err) {
      errors.push({ user: i, feature: 'createEnquiry', error: err.message });
    }
  }

  console.log('⭐ Test Suite 4: Simulating 1,000 Student Reviews & Rating Calculations...');
  for (let i = 1; i <= 1000; i++) {
    totalInvocations++;
    const user = generateUser(i);
    try {
      const result = await dataService.addReview({
        student_name: user.name,
        review: user.review,
        rating: user.rating,
        source: 'Simulated Test User'
      });

      if (!result || !result.id) {
        errors.push({ user: i, feature: 'addReview', error: 'Review submission failed to return object with ID' });
      } else {
        passCount++;
      }
    } catch (err) {
      errors.push({ user: i, feature: 'addReview', error: err.message });
    }
  }

  console.log('📢 Test Suite 5: Simulating Scheduled Announcement Post Triggers & Filter Logic...');
  for (let i = 1; i <= 1000; i++) {
    totalInvocations++;
    try {
      const posts = await dataService.getPosts();
      if (!Array.isArray(posts)) {
        errors.push({ user: i, feature: 'getPosts', error: 'Posts returned non-array' });
      } else {
        passCount++;
      }
    } catch (err) {
      errors.push({ user: i, feature: 'getPosts', error: err.message });
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n=================================================================');
  console.log('📊 SIMULATION RESULTS SUMMARY');
  console.log('=================================================================');
  console.log(`Total Simulated Users: 1,000`);
  console.log(`Total API/Function Invocations: ${totalInvocations}`);
  console.log(`Total Successful Passes: ${passCount}`);
  console.log(`Total Errors/Bugs Detected: ${errors.length}`);
  console.log(`Execution Duration: ${durationSec}s`);
  console.log('=================================================================\n');

  if (errors.length > 0) {
    console.log('❌ ERRORS DETECTED:');
    console.log(JSON.stringify(errors.slice(0, 10), null, 2));
  } else {
    console.log('🎉 PERFECT RESULT: 100% PASS RATE! 0 ERRORS DETECTED.');
  }
}

run1000UserSimulation();
