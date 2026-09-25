import { supabase, isSupabaseConfigured } from './supabase.js';
import { idbGet, idbSet, idbDel } from './idb.js';
import { deleteStorageFile } from './mediaUpload.js';
import { realtimeManager } from '../services/realtime/realtimeManager.js';

const STORAGE_KEYS = {
  SETTINGS: 'max_site_settings',
  COURSES: 'max_courses',
  FACULTY: 'max_faculty',
  GALLERY: 'max_gallery',
  REVIEWS: 'max_reviews',
  ENQUIRIES: 'max_enquiries',
  FAQ: 'max_faq',
  POSTS: 'max_posts',
};

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    title: 'Admissions Open for New Computer & Typing Batches!',
    category: 'Admission Notice',
    content: 'Enroll now for morning and evening batches in Basic Computer, MS Office, DCA, and English Typing (Junior & Senior). Special student discount available this month!',
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    action_label: 'Enquire Now',
    action_link: '/contact',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Initial Seed Data - Single Source of Truth defaults with exact MAX Educational Institution location
const DEFAULT_SETTINGS = {
  id: 'default-settings',
  institute_name: 'MAX Educational Institution',
  institution_name: 'MAX Educational Institution',
  tagline: 'Empowering Students With Skills for Tomorrow',
  phone: '+91 99654 68185',
  phone2: '+91 63809 27568',
  whatsapp: '+91 63809 27568',
  email: 'contact@maxinstitute.edu.in',
  address: '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  opening_time: '09:00 AM',
  closing_time: '06:00 PM',
  google_rating: 4.9,
  total_google_reviews: 110,
  google_maps_url: 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6',
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin'
};

const DEFAULT_COURSES = [
  {
    id: 'course-1',
    title: 'Basic Computer Training',
    slug: 'basic-computer-training',
    short_description: 'Foundational computer literacy covering OS navigation, file management, internet operations, and email communication.',
    description: 'Designed specifically for beginners, school students, and adult learners to build absolute confidence in using desktop computers, managing digital documents, and navigating modern web tools.',
    category: 'Computer Courses',
    duration: '1 - 2 Months',
    level: 'Beginner',
    icon: 'Monitor',
    image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_active: true
  },
  {
    id: 'course-2',
    title: 'MS Office Suite Mastery',
    slug: 'ms-office-suite',
    short_description: 'Comprehensive practical training in Microsoft Word, Excel spreadsheets, PowerPoint presentations, and Outlook.',
    description: 'Master essential workplace productivity tools. Includes advanced spreadsheet formulas, data filtering, report formatting, high-impact business presentation design, and administrative correspondence.',
    category: 'Computer Courses',
    duration: '2 Months',
    level: 'Beginner to Intermediate',
    icon: 'BookOpen',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_active: true
  },
  {
    id: 'course-3',
    title: 'Computer Applications (DCA)',
    slug: 'computer-applications-dca',
    short_description: 'Diploma in Computer Applications covering desktop computing, database fundamentals, and digital office management.',
    description: 'A career-oriented diploma program preparing candidates for clerical, administrative, and data entry job roles in private and government sectors.',
    category: 'Computer Courses',
    duration: '3 - 6 Months',
    level: 'Intermediate',
    icon: 'GraduationCap',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    display_order: 3,
    is_active: true
  },
  {
    id: 'course-4',
    title: 'Programming Fundamentals',
    slug: 'programming-fundamentals',
    short_description: 'Introduction to algorithmic problem solving, logic building, data structures, and foundational coding syntax.',
    description: 'Develop structured computational thinking. Learn variables, conditionals, loops, functions, and debugging principles applicable across modern software languages.',
    category: 'Computer Courses',
    duration: '3 Months',
    level: 'Intermediate',
    icon: 'Keyboard',
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80',
    display_order: 4,
    is_active: true
  },
  {
    id: 'course-5',
    title: 'English Typing (Junior & Senior)',
    slug: 'english-typing',
    short_description: 'Structured touch typing techniques designed to build precision, rhythm, and industry-standard word-per-minute speed.',
    description: 'Systematic keyboarding drills focusing on home-row discipline, blind touch typing, error elimination, and rigorous speed test simulations for official examinations.',
    category: 'Typing Courses',
    duration: '3 - 6 Months',
    level: 'All Levels',
    icon: 'Keyboard',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    display_order: 5,
    is_active: true
  },
  {
    id: 'course-6',
    title: 'Tamil Typing (Junior & Senior)',
    slug: 'tamil-typing',
    short_description: 'Specialized Tamil typewriter and computer keyboard layout training with speed acceleration techniques.',
    description: 'Master regional language keyboard layouts (Bamini / Tamil 99) with dedicated instructors, structured passage drills, and focused speed tests.',
    category: 'Typing Courses',
    duration: '3 - 6 Months',
    level: 'All Levels',
    icon: 'Keyboard',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    display_order: 6,
    is_active: true
  },
  {
    id: 'course-7',
    title: 'Speed Development Lab',
    slug: 'speed-development',
    short_description: 'Targeted speed and accuracy development sessions for competitive examination and typist test aspirants.',
    description: 'High-intensity timed drills, analytical error breakdown, and custom rhythm enhancement for candidates preparing for government typing exams.',
    category: 'Typing Courses',
    duration: '1 - 2 Months',
    level: 'Advanced',
    icon: 'Award',
    image_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80',
    display_order: 7,
    is_active: true
  },
  {
    id: 'course-8',
    title: 'Technical Fundamentals',
    slug: 'technical-fundamentals',
    short_description: 'Hands-on practical training in hardware components, operating system installation, troubleshooting, and networking.',
    description: 'Understand PC architecture, RAM/storage installation, peripheral connectivity, driver management, antivirus setups, and basic local area networking.',
    category: 'Technical Courses',
    duration: '2 - 3 Months',
    level: 'Intermediate',
    icon: 'Settings',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    display_order: 8,
    is_active: true
  },
  {
    id: 'course-9',
    title: 'Practical Office Computing',
    slug: 'practical-office-computing',
    short_description: 'Real-world workplace workflow training covering billing software, accounting spreadsheets, and official documentation.',
    description: 'Simulated corporate office scenarios providing hands-on experience with daily data entry, invoice generation, customer correspondence, and digital filing.',
    category: 'Technical Courses',
    duration: '2 Months',
    level: 'All Levels',
    icon: 'Users',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    display_order: 9,
    is_active: true
  }
];

const DEFAULT_FACULTY = [
  {
    id: 'faculty-1',
    name: 'S. Rajeswari',
    designation: 'Senior Technical Instructor',
    specialization: 'Computer Applications & Office Systems',
    experience: '8+ Years',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    description: 'Dedicated instructor with deep expertise in coaching beginners and students through structured, step-by-step practical computing exercises.',
    display_order: 1,
    is_active: true
  },
  {
    id: 'faculty-2',
    name: 'M. Selvakumar',
    designation: 'Head of Typing Division',
    specialization: 'English & Tamil Touch Typing (Jr / Sr)',
    experience: '10+ Years',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    description: 'Specialist in touch typing mechanics, keyboard ergonomics, and speed-building strategies for state board typing examinations.',
    display_order: 2,
    is_active: true
  },
  {
    id: 'faculty-3',
    name: 'A. Ananthi',
    designation: 'Hardware & Systems Mentor',
    specialization: 'Hardware Troubleshooting & Basic Networking',
    experience: '6+ Years',
    photo_url: 'https://images.unsplash.com/photo-1580894732488-828faaa086dc?w=600&auto=format&fit=crop&q=80',
    description: 'Hands-on mentor guiding students through real hardware assembly, diagnostic routines, software configurations, and PC maintenance.',
    display_order: 3,
    is_active: true
  }
];

const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    title: 'Main Computer Practice Lab',
    description: 'Modern workstations providing individual computer access for every enrolled student.',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    category: 'Classroom',
    display_order: 1,
    is_featured: true
  },
  {
    id: 'gal-2',
    title: 'Dedicated Typing Section',
    description: 'Focused keyboarding workstations designed for English and Tamil typing practice.',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    category: 'Institute',
    display_order: 2,
    is_featured: true
  },
  {
    id: 'gal-3',
    title: 'One-on-One Instructor Guidance',
    description: 'Experienced faculty resolving student questions during practical software training.',
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    category: 'Students',
    display_order: 3,
    is_featured: true
  },
  {
    id: 'gal-4',
    title: 'Focused Classroom Atmosphere',
    description: 'Disciplined and encouraging environment for learning and career preparation.',
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    category: 'Classroom',
    display_order: 4,
    is_featured: true
  },
  {
    id: 'gal-5',
    title: 'Student Achievement & Certification',
    description: 'Celebrating course completions and typing speed milestones achieved by our students.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    category: 'Events',
    display_order: 5,
    is_featured: true
  },
  {
    id: 'gal-6',
    title: 'Institute Facility at Azhagiyamandapam',
    description: 'Conveniently situated on 1st Floor, Trivandrum–Nagercoil Highway.',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    category: 'Institute',
    display_order: 6,
    is_featured: true
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    student_name: 'Keerthana Keerthi',
    review: 'Excellent institution with highly experienced and supportive faculty. It provides a structured learning environment with knowledgeable teachers.',
    rating: 5,
    source: 'Google Review',
    is_featured: true,
    created_at: '2025-11-10'
  },
  {
    id: 'rev-2',
    student_name: 'Jenisha',
    review: 'Excellent institution. The Institute provides a structured learning environment with knowledgeable teachers.',
    rating: 5,
    source: 'Google Review',
    is_featured: true,
    created_at: '2025-12-02'
  },
  {
    id: 'rev-3',
    student_name: 'Haneesha Haneesha',
    review: 'Very good teaching staffs and Institute management also very good.',
    rating: 5,
    source: 'Google Review',
    is_featured: true,
    created_at: '2026-01-14'
  },
  {
    id: 'rev-4',
    student_name: 'Karthik T.S.',
    review: 'Good teachings and well trained staffs.',
    rating: 5,
    source: 'Google Review',
    is_featured: true,
    created_at: '2026-02-05'
  },
  {
    id: 'rev-5',
    student_name: 'S. Anand',
    review: 'One of the best coaching centres in Azhagiyamandapam. Flexible batch timings and individual focus on computer practicals.',
    rating: 5,
    source: 'Google Review',
    is_featured: true,
    created_at: '2026-02-20'
  }
];

const DEFAULT_ENQUIRIES = [
  {
    id: 'enq-1',
    name: 'Arun Kumar',
    phone: '098765 43210',
    email: 'arun.k@gmail.com',
    course_name: 'Basic Computer Training',
    message: 'Interested in morning batch timings for basic computer course.',
    status: 'New',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'enq-2',
    name: 'Priya Dharshini',
    phone: '098412 87654',
    email: 'priya.d@gmail.com',
    course_name: 'Tamil Typing (Junior & Senior)',
    message: 'Seeking junior Tamil typing exam preparation syllabus details.',
    status: 'Contacted',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'enq-3',
    name: 'Rahul V.',
    phone: '097901 23456',
    email: 'rahul.v@gmail.com',
    course_name: 'Technical Fundamentals',
    message: 'Enquiring about weekend batches for hardware troubleshooting.',
    status: 'Closed',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const DEFAULT_FAQ = [
  {
    id: 'faq-1',
    question: 'What courses are available at MAX Educational Institution?',
    answer: 'MAX offers professional computer education including Basic Computer Training, MS Office Mastery, Diploma in Computer Applications (DCA), Programming Fundamentals, English & Tamil Touch Typing (Junior & Senior), Speed Development, and Technical Fundamentals.',
    category: 'Courses',
    display_order: 1,
    is_active: true
  },
  {
    id: 'faq-2',
    question: 'Where is MAX Educational Institution located?',
    answer: 'We are located on the 1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167.',
    category: 'General',
    display_order: 2,
    is_active: true
  },
  {
    id: 'faq-3',
    question: 'How can I enquire or register for a course?',
    answer: 'You can submit the online enquiry form on our website with your contact information, or call us directly at +91 99654 68185. Our team will reach out to explain batch schedules, curriculum, and admission details.',
    category: 'Admissions',
    display_order: 3,
    is_active: true
  },
  {
    id: 'faq-4',
    question: 'Can I visit the institute and see the labs before enrolling?',
    answer: 'Absolutely. Prospective students and parents are warmly invited to visit our center between 09:00 AM and 06:00 PM Monday through Saturday to see our computer lab, interact with the instructors, and test typing equipment.',
    category: 'General',
    display_order: 4,
    is_active: true
  },
  {
    id: 'faq-5',
    question: 'Are class timings flexible for college students and working professionals?',
    answer: 'Yes! We offer morning, afternoon, and evening batches with flexible timing options to suit the daily schedules of school pupils, college students, and working individuals.',
    category: 'Courses',
    display_order: 5,
    is_active: true
  }
];

// Local & IndexedDB Storage Helpers
async function getStored(key, defaultValue) {
  try {
    const idbData = await idbGet(key, null);
    if (idbData !== null && Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }
  } catch (e) {
    console.warn('IndexedDB read warning:', e);
  }

  return getLocal(key, defaultValue);
}

async function setStored(key, value) {
  await idbSet(key, value);
  setLocal(key, value);
}

function getLocal(key, defaultValue) {
  try {
    if (typeof localStorage === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error('Error reading localStorage', e);
    return defaultValue;
  }
}

function setLocal(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
}

function isUUID(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function ensureUUID(id) {
  if (id && isUUID(id)) return String(id);
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 compliant fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Universal Multi-System Real-Time Table Synchronizer
 * Delegated to centralized RealtimeManager:
 * 1. Supabase Postgres Realtime (World-wide real-time WebSocket)
 * 2. Cross-tab BroadcastChannel (Instant multi-tab sync on same machine)
 * 3. Local CustomEvent (In-window sync)
 * 4. Automatic reconnection & cache refresh
 */
function subscribeToTableRealtime(tableName, customEventName, channelName, callback) {
  return realtimeManager.subscribeToTable(tableName, callback);
}

function broadcastTableEvent(customEventName, channelName, actionType, detail = null) {
  const tableName = customEventName.replace(/^max_/, '').replace(/_(updated|changed|submitted)$/, '');
  realtimeManager.broadcastEvent(tableName, actionType, { detail });
}

// Unified Data Service API
export const dataService = {
  // ============================================================================
  // 1. SETTINGS & INSTITUTIONAL CONFIGURATION
  // ============================================================================
  async getSettings() {
    let settings = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          settings = data;
          setLocal(STORAGE_KEYS.SETTINGS, settings);
          idbSet(STORAGE_KEYS.SETTINGS, settings);
        }
      } catch (e) {
        console.warn('Supabase fetch settings failed, falling back to local storage', e);
      }
    }

    if (!settings) {
      settings = getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    // Single source defaults: Ensure exact MAX Educational Institution Google Maps URL is always enforced
    if (!settings.google_maps_url || settings.google_maps_url.includes('Py3cme7zBE4aBK777') || settings.google_maps_url.includes('maps.google.com/?q=')) {
      settings.google_maps_url = 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6';
    }
    if (!settings.phone) {
      settings.phone = '+91 99654 68185';
    }
    if (!settings.whatsapp) {
      settings.whatsapp = settings.phone2 || '+91 63809 27568';
    }
    if (!settings.phone2) {
      settings.phone2 = settings.whatsapp || '+91 63809 27568';
    }

    return settings;
  },

  broadcastSettingsChange(detail = null) {
    realtimeManager.broadcastEvent('site_settings', 'SETTINGS_CHANGED', { detail });
  },

  subscribeToSettings(callback) {
    return realtimeManager.subscribeToTable('site_settings', callback);
  },

  async updateSettings(updates, expectedUpdatedAt = null) {
    const current = await this.getSettings();
    const merged = { ...DEFAULT_SETTINGS, ...current, ...updates, updated_at: new Date().toISOString() };

    let result = merged;
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch existing canonical row for conflict detection and target ID resolution
        const { data: existing } = await supabase
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Safe Concurrency Conflict Handling (Requirement 18)
        if (expectedUpdatedAt && existing?.updated_at) {
          const serverTime = new Date(existing.updated_at).getTime();
          const clientExpectedTime = new Date(expectedUpdatedAt).getTime();
          if (serverTime - clientExpectedTime > 1500) {
            throw new Error('This item was updated by another administrator. Please review the latest version before saving.');
          }
        }

        const targetId = existing?.id || 'fbfe01cc-bd44-4777-8dcb-8be83d226934';

        // Strictly allowed columns on site_settings PostgreSQL table
        const cleanPayload = {
          id: targetId,
          institute_name: merged.institute_name || merged.institution_name || 'MAX Educational Institution',
          institution_name: merged.institution_name || merged.institute_name || 'MAX Educational Institution',
          tagline: merged.tagline || 'Empowering Students With Skills for Tomorrow',
          phone: merged.phone || '+91 99654 68185',
          whatsapp: merged.whatsapp || merged.phone2 || '+91 63809 27568',
          email: merged.email || 'contact@maxinstitute.edu.in',
          address: merged.address || '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
          opening_time: merged.opening_time || '09:00 AM',
          closing_time: merged.closing_time || '06:00 PM',
          google_rating: Number(merged.google_rating || 4.9),
          total_google_reviews: parseInt(merged.total_google_reviews) || 110,
          google_maps_url: merged.google_maps_url || 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6',
          logo_url: merged.logo_url || null,
          favicon_url: merged.favicon_url || null,
          website_title: merged.website_title || 'MAX Educational Institution | Azhagiyamandapam',
          website_description: merged.website_description || 'Professional training in Computer Courses, Typing (English & Tamil), and Technical Fundamentals in Azhagiyamandapam.',
          facebook_url: merged.facebook_url || 'https://facebook.com',
          instagram_url: merged.instagram_url || 'https://instagram.com',
          youtube_url: merged.youtube_url || 'https://youtube.com',
          updated_by: 'admin',
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('site_settings').upsert(cleanPayload).select().single();
        if (!error && data) {
          result = { ...merged, ...data, phone2: data.whatsapp || merged.phone2 };
          await this.logAdminActivity('UPDATE_SITE_SETTINGS', 'site_settings', targetId, existing, cleanPayload);
        } else if (error) {
          console.error('Supabase updateSettings database error:', error);
          throw new Error(error.message || 'Database rejected settings update');
        }
      } catch (e) {
        console.warn('Supabase updateSettings error:', e);
        throw e;
      }
    }

    setLocal(STORAGE_KEYS.SETTINGS, result);
    idbSet(STORAGE_KEYS.SETTINGS, result);
    this.broadcastSettingsChange(result);
    return result;
  },

  // ============================================================================
  // 2. COURSES
  // ============================================================================
  broadcastCoursesChange(detail = null) {
    broadcastTableEvent('max_courses_updated', 'max_courses_sync_channel', 'COURSES_CHANGED', detail);
  },

  subscribeToCourses(callback) {
    return subscribeToTableRealtime('courses', 'max_courses_updated', 'max_courses_sync_channel', callback);
  },

  async getCourses() {
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data)) {
          // Authoritative cloud data: overwrite local cache without resurrecting deleted items
          items = data;
          setLocal(STORAGE_KEYS.COURSES, items);
          idbSet(STORAGE_KEYS.COURSES, items);
          return items;
        } else if (error) {
          console.warn('Supabase getCourses notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase courses failed', e);
      }
    }

    if (items === null) {
      items = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    }

    return items;
  },

  async addCourse(course) {
    const newId = ensureUUID(course.id);
    const cleanTitle = (course.title || 'Untitled Course').trim();
    const baseSlug = course.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug || 'course'}-${Math.random().toString(36).slice(2, 6)}`;

    const newCourse = {
      id: newId,
      title: cleanTitle,
      slug: uniqueSlug,
      short_description: course.short_description || '',
      description: course.description || '',
      category: course.category || 'Computer Courses',
      duration: course.duration || 'Flexible',
      level: course.level || 'Beginner to Advanced',
      icon: course.icon || 'Monitor',
      image_url: course.image_url || null,
      display_order: parseInt(course.display_order) || 1,
      is_active: course.is_active !== false,
      created_at: course.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let result = newCourse;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').insert(newCourse).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase addCourse error:', error);
        throw new Error(error.message || 'Failed to save course to database');
      }
    }

    const currentLocal = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const updatedLocal = [...currentLocal.filter(c => String(c.id) !== String(result.id)), result];
    setLocal(STORAGE_KEYS.COURSES, updatedLocal);
    idbSet(STORAGE_KEYS.COURSES, updatedLocal);
    this.broadcastCoursesChange(result);
    return result;
  },

  async updateCourse(id, updates) {
    const stringId = String(id);
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete cleanUpdates.id;

    let result = null;

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('courses').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase updateCourse error:', error);
        throw new Error(error.message || 'Failed to update course in database');
      }
    }

    const currentLocal = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const updatedLocal = currentLocal.map(c => (String(c.id) === stringId ? { ...c, ...cleanUpdates, ...(result || {}) } : c));
    setLocal(STORAGE_KEYS.COURSES, updatedLocal);
    idbSet(STORAGE_KEYS.COURSES, updatedLocal);
    this.broadcastCoursesChange(result || { id, ...cleanUpdates });
    return result || updatedLocal.find(c => String(c.id) === stringId);
  },

  async deleteCourse(id) {
    const stringId = String(id);

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteCourse error:', error);
        throw new Error(error.message || 'Failed to delete course from database');
      }
    }

    const currentLocal = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const filteredLocal = currentLocal.filter(c => String(c.id) !== stringId);
    setLocal(STORAGE_KEYS.COURSES, filteredLocal);
    idbSet(STORAGE_KEYS.COURSES, filteredLocal);
    this.broadcastCoursesChange({ id: stringId, deleted: true });
    return true;
  },

  // ============================================================================
  // 3. FACULTY / INSTRUCTORS
  // ============================================================================
  broadcastFacultyChange(detail = null) {
    broadcastTableEvent('max_faculty_updated', 'max_faculty_sync_channel', 'FACULTY_CHANGED', detail);
  },

  subscribeToFaculty(callback) {
    return subscribeToTableRealtime('faculty', 'max_faculty_updated', 'max_faculty_sync_channel', callback);
  },

  async getFaculty() {
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data)) {
          // Authoritative cloud data: overwrite local cache without resurrecting deleted items
          items = data;
          setLocal(STORAGE_KEYS.FACULTY, items);
          idbSet(STORAGE_KEYS.FACULTY, items);
          return items;
        } else if (error) {
          console.warn('Supabase getFaculty notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase faculty failed', e);
      }
    }

    if (items === null) {
      items = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    }

    return items;
  },

  async addFaculty(member) {
    const newId = ensureUUID(member.id);

    const newMember = {
      id: newId,
      name: (member.name || '').trim(),
      designation: member.designation || 'Instructor',
      specialization: member.specialization || '',
      experience: member.experience || '5+ Years',
      photo_url: member.photo_url || null,
      description: member.description || '',
      display_order: parseInt(member.display_order) || 1,
      is_active: member.is_active !== false,
      created_at: member.created_at || new Date().toISOString()
    };

    let result = newMember;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('faculty').insert(newMember).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase addFaculty error:', error);
        throw new Error(error.message || 'Failed to add faculty to database');
      }
    }

    const currentLocal = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const updatedLocal = [...currentLocal.filter(f => String(f.id) !== String(result.id)), result];
    setLocal(STORAGE_KEYS.FACULTY, updatedLocal);
    idbSet(STORAGE_KEYS.FACULTY, updatedLocal);
    this.broadcastFacultyChange(result);
    return result;
  },

  async updateFaculty(id, updates) {
    const stringId = String(id);
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;

    let result = null;

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('faculty').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase updateFaculty error:', error);
        throw new Error(error.message || 'Failed to update faculty in database');
      }
    }

    const currentLocal = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const updatedLocal = currentLocal.map(f => (String(f.id) === stringId ? { ...f, ...cleanUpdates, ...(result || {}) } : f));
    setLocal(STORAGE_KEYS.FACULTY, updatedLocal);
    idbSet(STORAGE_KEYS.FACULTY, updatedLocal);
    this.broadcastFacultyChange(result || { id, ...cleanUpdates });
    return result || updatedLocal.find(f => String(f.id) === stringId);
  },

  async deleteFaculty(id) {
    const stringId = String(id);

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteFaculty error:', error);
        throw new Error(error.message || 'Failed to delete faculty from database');
      }
    }

    const currentLocal = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const filteredLocal = currentLocal.filter(f => String(f.id) !== stringId);
    setLocal(STORAGE_KEYS.FACULTY, filteredLocal);
    idbSet(STORAGE_KEYS.FACULTY, filteredLocal);
    this.broadcastFacultyChange({ id: stringId, deleted: true });
    return true;
  },

  // ============================================================================
  // 4. AUDIT ACTIVITY LOGGING
  // ============================================================================
  async logAdminActivity(action, tableName = null, recordId = null, oldData = null, newData = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        const payload = {
          admin_id: user?.id || 'system-admin',
          admin_email: user?.email || 'admin@maxinstitute.edu.in',
          action: String(action),
          table_name: tableName,
          record_id: recordId ? String(recordId) : null,
          old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
          new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
          created_at: new Date().toISOString()
        };
        await supabase.from('admin_activity_log').insert(payload).catch(() => {});
      } catch (e) {}
    }
  },

  // ============================================================================
  // 5. GALLERY (Images & Videos)
  // ============================================================================
  broadcastGalleryChange(detail = null) {
    broadcastTableEvent('max_gallery_updated', 'max_gallery_sync_channel', 'GALLERY_CHANGED', detail);
  },

  subscribeToGallery(callback) {
    return subscribeToTableRealtime('gallery', 'max_gallery_updated', 'max_gallery_sync_channel', callback);
  },

  async getGallery(category = 'All') {
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          // Authoritative cloud data
          items = data;
          await setStored(STORAGE_KEYS.GALLERY, items);
          return items;
        } else if (error) {
          console.warn('Supabase getGallery notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase gallery failed', e);
      }
    }

    if (items === null) {
      let localItems = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
      if (category && category !== 'All') {
        localItems = localItems.filter(img => img.category?.toLowerCase() === category.toLowerCase());
      }
      items = localItems;
    }

    return items;
  },

  async addGalleryItem(item) {
    const items = await this.addGalleryItems([item]);
    return items[0];
  },

  async addGalleryItems(itemsArray) {
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) return [];

    const formattedItems = itemsArray.map((item, idx) => {
      const newId = ensureUUID(item.id);
      const fileUrl = item.file_url || item.image_url || '';
      const imageUrl = item.image_url || fileUrl;

      return {
        id: newId,
        title: item.title || 'Campus Photo',
        description: item.description || '',
        media_type: item.media_type || (fileUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? 'video' : 'image'),
        file_url: fileUrl,
        image_url: imageUrl,
        thumbnail_url: item.thumbnail_url || imageUrl,
        storage_path: item.storage_path || null,
        file_name: item.file_name || null,
        file_size: item.file_size || null,
        mime_type: item.mime_type || null,
        category: item.category || 'Institute',
        display_order: parseInt(item.display_order) || 0,
        is_published: item.is_published !== false,
        is_featured: item.is_featured ?? false,
        uploaded_by: item.uploaded_by || 'admin',
        created_at: item.created_at || new Date(Date.now() - idx * 100).toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('gallery').insert(formattedItems).select();
        if (error) {
          console.error('Supabase addGalleryItems error:', error);
          // Rollback newly uploaded storage files on DB insertion error
          for (const item of formattedItems) {
            if (item.storage_path) {
              await deleteStorageFile('gallery', item.storage_path).catch(() => {});
            }
          }
          throw new Error(error.message || 'Failed to save gallery items to database');
        }
      } catch (e) {
        console.warn('Supabase addGalleryItems batch notice:', e);
        for (const item of formattedItems) {
          if (item.storage_path) {
            await deleteStorageFile('gallery', item.storage_path).catch(() => {});
          }
        }
        throw e;
      }
    }

    const currentLocal = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const updatedList = [...formattedItems, ...currentLocal.filter(g => !formattedItems.some(f => String(f.id) === String(g.id)))];
    await setStored(STORAGE_KEYS.GALLERY, updatedList);

    await this.logAdminActivity('UPLOAD_GALLERY', 'gallery', formattedItems.map(i => i.id).join(','), null, formattedItems);
    this.broadcastGalleryChange(formattedItems);
    return formattedItems;
  },

  async updateGalleryItem(id, updates) {
    const stringId = String(id);
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete cleanUpdates.id;

    let result = null;

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('gallery').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) {
        result = data;
        let action = 'UPDATE_GALLERY';
        if (cleanUpdates.is_published === true) action = 'PUBLISH_GALLERY';
        else if (cleanUpdates.is_published === false) action = 'UNPUBLISH_GALLERY';
        await this.logAdminActivity(action, 'gallery', id, null, cleanUpdates);
      } else if (error) {
        console.error('Supabase updateGalleryItem error:', error);
        throw new Error(error.message || 'Failed to update gallery item in database');
      }
    }

    const currentLocal = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const updatedList = currentLocal.map(g => (String(g.id) === stringId ? { ...g, ...cleanUpdates, ...(result || {}) } : g));
    await setStored(STORAGE_KEYS.GALLERY, updatedList);

    this.broadcastGalleryChange(result || { id, ...cleanUpdates });
    return result || updatedList.find(g => String(g.id) === stringId);
  },

  async deleteGalleryItem(id) {
    return this.deleteGalleryItems([id]);
  },

  async deleteGalleryItems(idsArray) {
    if (!Array.isArray(idsArray) || idsArray.length === 0) return true;
    const idsSet = new Set(idsArray.map(String));

    if (isSupabaseConfigured && supabase) {
      const validUUIDs = idsArray.filter(isUUID);
      if (validUUIDs.length > 0) {
        // Retrieve storage paths before database deletion
        const { data: records } = await supabase.from('gallery').select('id, storage_path').in('id', validUUIDs);
        const storagePaths = records ? records.map(r => r.storage_path).filter(Boolean) : [];

        const { error } = await supabase.from('gallery').delete().in('id', validUUIDs);
        if (error) {
          console.error('Supabase deleteGalleryItems error:', error);
          throw new Error(error.message || 'Failed to delete gallery items from database');
        }

        // Clean up corresponding storage files
        for (const path of storagePaths) {
          await deleteStorageFile('gallery', path).catch(() => {});
        }

        await this.logAdminActivity('DELETE_GALLERY', 'gallery', validUUIDs.join(','), null, { deleted_count: validUUIDs.length });
      }
    }

    const currentLocal = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const filteredLocal = currentLocal.filter(g => !idsSet.has(String(g.id)));
    await setStored(STORAGE_KEYS.GALLERY, filteredLocal);

    this.broadcastGalleryChange(idsArray);
    return true;
  },

  // ============================================================================
  // ADMIN ACTIVITY AUDIT LOG
  // ============================================================================
  async getActivityLog(limit = 25) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        console.warn('Failed to fetch activity log:', e);
      }
    }
    return [];
  },

  subscribeToActivityLog(callback) {
    return realtimeManager.subscribeToTable('admin_activity_log', callback);
  },

  // ============================================================================
  // 6. REVIEWS
  // ============================================================================
  broadcastReviewChange(detail = null) {
    broadcastTableEvent('max_review_changed', 'max_reviews_sync_channel', 'REVIEW_CHANGED', detail);
  },

  subscribeToReviews(callback) {
    return subscribeToTableRealtime('reviews', 'max_review_changed', 'max_reviews_sync_channel', callback);
  },

  async getReviews() {
    let list = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          list = data;
        }
      } catch (e) {
        console.warn('Supabase reviews failed', e);
      }
    }

    if (!list || list.length === 0) {
      list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    }

    const sorted = [...list].sort((a, b) => {
      const featA = a.is_featured ? 1 : 0;
      const featB = b.is_featured ? 1 : 0;
      if (featA !== featB) return featB - featA;

      const rateA = Number(a.rating || 5);
      const rateB = Number(b.rating || 5);
      if (rateA !== rateB) return rateB - rateA;

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    setLocal(STORAGE_KEYS.REVIEWS, sorted);
    return sorted;
  },

  async addReview(review) {
    const newId = ensureUUID(review.id);
    const newRev = {
      id: newId,
      student_name: (review.student_name || 'Student').trim(),
      review: (review.review || '').trim(),
      rating: Math.min(5, Math.max(1, parseInt(review.rating) || 5)),
      source: review.source || 'Google Review',
      photo_url: review.photo_url || null,
      is_featured: review.is_featured ?? true,
      created_at: review.created_at || new Date().toISOString()
    };

    let result = newRev;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('reviews').insert(newRev).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase addReview error:', error);
        throw new Error(error.message || 'Failed to save review to database');
      }
    }

    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const updated = [result, ...list.filter(r => String(r.id) !== String(result.id))];
    setLocal(STORAGE_KEYS.REVIEWS, updated);
    this.broadcastReviewChange(result);
    return result;
  },

  async updateReview(id, updates) {
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;

    let result = null;

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('reviews').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase updateReview error:', error);
        throw new Error(error.message || 'Failed to update review in database');
      }
    }

    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const updated = list.map(r => (String(r.id) === String(id) ? { ...r, ...cleanUpdates, ...(result || {}) } : r));
    setLocal(STORAGE_KEYS.REVIEWS, updated);
    this.broadcastReviewChange(result || { id, ...cleanUpdates });
    return result || updated.find(r => String(r.id) === String(id));
  },

  async deleteReview(id) {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteReview error:', error);
        throw new Error(error.message || 'Failed to delete review from database');
      }
    }

    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const filtered = list.filter(r => String(r.id) !== String(id));
    setLocal(STORAGE_KEYS.REVIEWS, filtered);
    this.broadcastReviewChange({ id, deleted: true });
    return true;
  },

  // ============================================================================
  // 7. ENQUIRIES
  // ============================================================================
  broadcastEnquiryChange(detail = null) {
    broadcastTableEvent('max_enquiry_submitted', 'max_enquiries_sync_channel', 'ENQUIRY_CHANGED', detail);
  },

  subscribeToEnquiries(callback) {
    return subscribeToTableRealtime('enquiries', 'max_enquiry_submitted', 'max_enquiries_sync_channel', callback);
  },

  async getEnquiries() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setLocal(STORAGE_KEYS.ENQUIRIES, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase enquiries failed', e);
      }
    }
    return getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
  },

  async createEnquiry(enquiry) {
    const newId = ensureUUID(enquiry.id);
    const newEnq = {
      id: newId,
      name: (enquiry.name || '').trim(),
      phone: (enquiry.phone || '').trim(),
      email: enquiry.email || null,
      course_name: enquiry.course_name || null,
      message: enquiry.message || '',
      status: enquiry.status || 'New',
      notes: enquiry.notes || null,
      created_at: enquiry.created_at || new Date().toISOString()
    };

    let result = newEnq;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('enquiries').insert(newEnq).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase createEnquiry error:', error);
        throw new Error(error.message || 'Failed to submit enquiry to database');
      }
    }

    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const updated = [result, ...list.filter(item => String(item.id) !== String(result.id))];
    setLocal(STORAGE_KEYS.ENQUIRIES, updated);
    this.broadcastEnquiryChange(result);
    return result;
  },

  async updateEnquiryStatus(id, status) {
    let result = null;

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('enquiries').update({ status }).eq('id', id).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase updateEnquiryStatus error:', error);
        throw new Error(error.message || 'Failed to update enquiry in database');
      }
    }

    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const updated = list.map(e => (String(e.id) === String(id) ? { ...e, status } : e));
    setLocal(STORAGE_KEYS.ENQUIRIES, updated);
    this.broadcastEnquiryChange(result || { id, status });
    return result || updated.find(e => String(e.id) === String(id));
  },

  async deleteEnquiry(id) {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteEnquiry error:', error);
        throw new Error(error.message || 'Failed to delete enquiry from database');
      }
    }

    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const filtered = list.filter(e => String(e.id) !== String(id));
    setLocal(STORAGE_KEYS.ENQUIRIES, filtered);
    this.broadcastEnquiryChange({ id, deleted: true });
    return true;
  },

  // ============================================================================
  // 8. FAQ
  // ============================================================================
  broadcastFAQChange(detail = null) {
    broadcastTableEvent('max_faq_updated', 'max_faq_sync_channel', 'FAQ_CHANGED', detail);
  },

  subscribeToFAQ(callback) {
    return subscribeToTableRealtime('faq', 'max_faq_updated', 'max_faq_sync_channel', callback);
  },

  async getFAQ() {
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faq').select('*').order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          // Authoritative cloud data
          items = data;
          setLocal(STORAGE_KEYS.FAQ, items);
          idbSet(STORAGE_KEYS.FAQ, items);
          return items;
        } else if (error) {
          console.warn('Supabase getFAQ error:', error);
        }
      } catch (e) {
        console.warn('Supabase FAQ failed', e);
      }
    }

    if (items === null) {
      items = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    }

    return items;
  },

  async addFAQ(faq) {
    const newId = ensureUUID(faq.id);

    const insertPayload = {
      id: newId,
      category: faq.category || 'General',
      question: String(faq.question || '').trim(),
      answer: String(faq.answer || '').trim(),
      display_order: parseInt(faq.display_order) || 1,
      is_active: faq.is_active !== false,
      created_at: new Date().toISOString()
    };

    let result = insertPayload;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('faq').insert(insertPayload).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase addFAQ error:', error);
        throw new Error(error.message || 'Failed to save FAQ to database');
      }
    }

    const current = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const updated = [...current.filter(f => String(f.id) !== String(result.id)), result];
    setLocal(STORAGE_KEYS.FAQ, updated);
    idbSet(STORAGE_KEYS.FAQ, updated);
    this.broadcastFAQChange(result);
    return result;
  },

  async updateFAQ(id, updates) {
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;

    let result = null;

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('faq').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) {
        result = data;
      } else if (error) {
        console.error('Supabase updateFAQ error:', error);
        throw new Error(error.message || 'Failed to update FAQ in database');
      }
    }

    const current = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const updated = current.map(f => (String(f.id) === String(id) ? { ...f, ...cleanUpdates, ...(result || {}) } : f));
    setLocal(STORAGE_KEYS.FAQ, updated);
    idbSet(STORAGE_KEYS.FAQ, updated);
    this.broadcastFAQChange(result || { id, ...cleanUpdates });
    return result || updated.find(f => String(f.id) === String(id));
  },

  async deleteFAQ(id) {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { error } = await supabase.from('faq').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteFAQ error:', error);
        throw new Error(error.message || 'Failed to delete FAQ from database');
      }
    }

    const current = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const filtered = current.filter(f => String(f.id) !== String(id));
    setLocal(STORAGE_KEYS.FAQ, filtered);
    idbSet(STORAGE_KEYS.FAQ, filtered);
    this.broadcastFAQChange({ id, deleted: true });
    return true;
  },

  // ============================================================================
  // 9. ANNOUNCEMENTS / POSTS (Dual-mode resilient database sync)
  // ============================================================================
  broadcastPostsChange(detail = null) {
    broadcastTableEvent('max_posts_updated', 'max_posts_sync_channel', 'POSTS_CHANGED', detail);
  },

  subscribeToPosts(callback) {
    // Subscribes across posts, admin_activity_log, BroadcastChannel, and window events
    const unsubPosts = subscribeToTableRealtime('posts', 'max_posts_updated', 'max_posts_sync_channel', callback);
    let unsubLog = () => {};
    if (isSupabaseConfigured && supabase) {
      try {
        const logChannel = supabase
          .channel(`realtime:post_sync:${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'admin_activity_log' },
            (p) => {
              if (p.new?.action === 'POST_ANNOUNCEMENT' || p.old?.action === 'POST_ANNOUNCEMENT') {
                callback(p.new?.new_data || p.old?.new_data || null);
              }
            }
          )
          .subscribe();

        unsubLog = () => {
          try { supabase.removeChannel(logChannel); } catch (e) {}
        };
      } catch (e) {}
    }

    return () => {
      unsubPosts();
      unsubLog();
    };
  },

  async getPosts() {
    if (isSupabaseConfigured && supabase) {
      // 1. Try native 'posts' table first
      try {
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          setLocal(STORAGE_KEYS.POSTS, data);
          return data;
        }
      } catch (e) {}

      // 2. Cloud fallback: Read from 'admin_activity_log' where action = 'POST_ANNOUNCEMENT'
      try {
        const { data, error } = await supabase
          .from('admin_activity_log')
          .select('*')
          .eq('action', 'POST_ANNOUNCEMENT')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const cloudPosts = data.map(row => ({
            ...row.new_data,
            id: row.record_id || row.new_data?.id || row.id,
            created_at: row.created_at || row.new_data?.created_at
          }));
          setLocal(STORAGE_KEYS.POSTS, cloudPosts);
          return cloudPosts;
        }
      } catch (e) {
        console.warn('Supabase getPosts cloud fallback notice:', e);
      }
    }

    return getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
  },

  async getPublicAnnouncements() {
    const list = await this.getPosts();
    const now = new Date();
    return list.filter(post => {
      if (!post.is_active) return false;
      if (post.start_time) {
        const start = new Date(post.start_time);
        if (now < start) return false;
      }
      if (post.end_time) {
        const end = new Date(post.end_time);
        if (now > end) return false;
      }
      return true;
    });
  },

  async addPost(post) {
    const newId = ensureUUID(post.id);
    const newPost = {
      ...post,
      id: newId,
      is_active: post.is_active !== false,
      start_time: post.start_time || null,
      end_time: post.end_time || null,
      created_at: post.created_at || new Date().toISOString()
    };

    let saved = false;

    if (isSupabaseConfigured && supabase) {
      // 1. Try native 'posts' table
      try {
        const { data, error } = await supabase.from('posts').insert(newPost).select().single();
        if (!error && data) {
          saved = true;
        }
      } catch (e) {}

      // 2. Resilient Cloud Database Fallback
      if (!saved) {
        try {
          const { error } = await supabase.from('admin_activity_log').insert({
            action: 'POST_ANNOUNCEMENT',
            record_id: newPost.id,
            new_data: newPost,
            created_at: newPost.created_at
          });
          if (!error) saved = true;
        } catch (e) {
          console.warn('Supabase addPost cloud log fallback error:', e);
        }
      }
    }

    const list = getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    const updated = [newPost, ...list.filter(p => String(p.id) !== String(newPost.id))];
    setLocal(STORAGE_KEYS.POSTS, updated);
    this.broadcastPostsChange(newPost);
    return newPost;
  },

  async updatePost(id, updates) {
    const stringId = String(id);
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;

    if (isSupabaseConfigured && supabase) {
      // 1. Try native 'posts'
      try {
        await supabase.from('posts').update(cleanUpdates).eq('id', id);
      } catch (e) {}

      // 2. Cloud Fallback
      try {
        const { data: rows } = await supabase
          .from('admin_activity_log')
          .select('*')
          .eq('action', 'POST_ANNOUNCEMENT')
          .eq('record_id', stringId);

        if (rows && rows.length > 0) {
          const existingData = rows[0].new_data || {};
          const merged = { ...existingData, ...cleanUpdates, id: stringId };
          await supabase
            .from('admin_activity_log')
            .update({ new_data: merged })
            .eq('id', rows[0].id);
        }
      } catch (e) {}
    }

    const list = getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    const updated = list.map(p => (String(p.id) === stringId ? { ...p, ...cleanUpdates } : p));
    setLocal(STORAGE_KEYS.POSTS, updated);
    this.broadcastPostsChange({ id: stringId, ...cleanUpdates });
    return updated.find(p => String(p.id) === stringId);
  },

  async deletePost(id) {
    const stringId = String(id);

    if (isSupabaseConfigured && supabase) {
      // 1. Try native 'posts'
      try {
        await supabase.from('posts').delete().eq('id', id);
      } catch (e) {}

      // 2. Cloud Fallback
      try {
        await supabase
          .from('admin_activity_log')
          .delete()
          .eq('action', 'POST_ANNOUNCEMENT')
          .eq('record_id', stringId);
      } catch (e) {}
    }

    const list = getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    const filtered = list.filter(p => String(p.id) !== stringId);
    setLocal(STORAGE_KEYS.POSTS, filtered);
    this.broadcastPostsChange({ id: stringId, deleted: true });
    return true;
  }
};
