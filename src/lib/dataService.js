import { supabase, isSupabaseConfigured } from './supabase.js';
import { idbGet, idbSet, idbDel } from './idb.js';
import { deleteStorageFile } from './mediaUpload.js';

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

// Immediate Auto-Sanitization Script for local storage phone number persistence
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem('max_site_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      let needsSave = false;
      if (!parsed.phone || parsed.phone === '063809 27568' || parsed.phone.includes('063809')) {
        parsed.phone = '+91 99654 68185';
        needsSave = true;
      }
      if (!parsed.phone2 || parsed.phone2 === '063809 27568' || parsed.phone2 === '63809 27568') {
        parsed.phone2 = '+91 63809 27568';
        needsSave = true;
      }
      if (needsSave) {
        localStorage.setItem('max_site_settings', JSON.stringify(parsed));
      }
    }
  }
} catch (e) {}

// Initial Seed Data
const DEFAULT_SETTINGS = {
  id: 'default-settings',
  institute_name: 'MAX Educational Institution',
  tagline: 'Empowering Students With Skills for Tomorrow',
  phone: '+91 99654 68185',
  phone2: '+91 63809 27568',
  email: 'contact@maxinstitute.edu.in',
  address: '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  opening_time: '09:00 AM',
  closing_time: '06:00 PM',
  google_rating: 4.9,
  total_google_reviews: 110,
  google_maps_url: 'https://maps.app.goo.gl/Py3cme7zBE4aBK777',
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

// Unified Data Service API
export const dataService = {
  // SETTINGS
  async getSettings() {
    let settings = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        if (!error && data) {
          settings = data;
        }
      } catch (e) {
        console.warn('Supabase fetch settings failed, falling back to local storage', e);
      }
    }
    if (!settings) {
      settings = getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    
    // Auto-Sanitization Script: Ensure phone & phone2 formatting in perfect order
    let modified = false;
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
      modified = true;
    }
    if (!settings.phone || settings.phone === '063809 27568' || settings.phone.includes('063809')) {
      settings.phone = '+91 99654 68185';
      modified = true;
    }
    if (!settings.phone2 || settings.phone2 === '063809 27568' || settings.phone2 === '63809 27568') {
      settings.phone2 = '+91 63809 27568';
      modified = true;
    }
    if (settings.address && (settings.address.includes('Near Nagercoil Bus Stop') || settings.address.includes('Junction,'))) {
      settings.address = settings.address.replace(/,?\s*Near Nagercoil Bus Stop/g, '').replace(/,?\s*Junction/g, '').trim();
      modified = true;
    }
    if (modified) {
      setLocal(STORAGE_KEYS.SETTINGS, settings);
      idbSet(STORAGE_KEYS.SETTINGS, settings);
      if (isSupabaseConfigured && supabase && settings.id && settings.id !== 'default-settings') {
        supabase.from('site_settings').upsert({ id: settings.id, phone: '+91 99654 68185', phone2: '+91 63809 27568' }).catch(() => {});
      }
    }
    return settings;
  },

  // SETTINGS & REAL-TIME MULTI-DEVICE SYNC ALGORITHM
  broadcastSettingsChange(detail = null) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('max_settings_updated', { detail }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('max_settings_sync_channel');
        bc.postMessage({ type: 'SETTINGS_CHANGED', detail });
        bc.close();
      } catch (e) {}
    }
  },

  subscribeToSettings(callback) {
    const handleLocal = (e) => callback(e.detail || null);

    if (typeof window !== 'undefined') {
      window.addEventListener('max_settings_updated', handleLocal);
    }

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('max_settings_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'SETTINGS_CHANGED') {
            callback(event.data.detail);
          }
        };
      } catch (e) {}
    }

    let supabaseChannel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseChannel = supabase
          .channel('public:site_settings:realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_settings' },
            (payload) => {
              callback(payload.new || payload.old || payload);
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Supabase site_settings realtime subscription failed:', e);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('max_settings_updated', handleLocal);
      }
      if (channel) channel.close();
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },

  async updateSettings(updates) {
    const current = getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const merged = { ...DEFAULT_SETTINGS, ...current, ...updates, updated_at: new Date().toISOString() };
    
    // Auto-sanitization fallback checks
    if (!merged.phone) merged.phone = '+91 99654 68185';
    if (!merged.phone2) merged.phone2 = '+91 63809 27568';
    if (!merged.email) merged.email = 'contact@maxinstitute.edu.in';
    if (!merged.address) merged.address = '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167';

    let result = merged;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        const payload = existing?.id ? { ...existing, ...merged, id: existing.id } : { ...merged };
        const { data, error } = await supabase.from('site_settings').upsert(payload).select().single();
        if (!error && data) {
          result = data;
        } else if (error) {
          console.error('Supabase updateSettings error:', error);
        }
      } catch (e) {
        console.warn('Supabase updateSettings failed, saving locally', e);
      }
    }
    
    setLocal(STORAGE_KEYS.SETTINGS, result);
    idbSet(STORAGE_KEYS.SETTINGS, result);
    this.broadcastSettingsChange(result);
    return result;
  },

  // COURSES
  async getCourses() {
    const deletedIds = new Set(getLocal('max_courses_deleted_ids', []).map(String));
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          const supabaseIds = new Set(data.map(d => String(d.id)));
          const localItems = getLocal(STORAGE_KEYS.COURSES, []);
          const localOnly = localItems.filter(l => !supabaseIds.has(String(l.id)) && !deletedIds.has(String(l.id)));

          let combined = [...data, ...localOnly];
          items = combined.filter(c => !deletedIds.has(String(c.id)));
          setLocal(STORAGE_KEYS.COURSES, items);
        } else if (error) {
          console.warn('Supabase getCourses notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase courses failed', e);
      }
    }

    if (items === null) {
      let localItems = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
      items = localItems.filter(c => !deletedIds.has(String(c.id)));
    }

    return items;
  },

  async addCourse(course) {
    const newId = (course.id && isUUID(course.id))
      ? course.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `course-${Date.now()}`);

    const newCourse = {
      ...course,
      id: newId,
      is_active: course.is_active ?? true,
      created_at: course.created_at || new Date().toISOString()
    };

    const currentLocal = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const updatedLocal = [newCourse, ...currentLocal.filter(c => String(c.id) !== String(newCourse.id))];
    setLocal(STORAGE_KEYS.COURSES, updatedLocal);

    const deletedIds = getLocal('max_courses_deleted_ids', []);
    if (deletedIds.includes(String(newCourse.id))) {
      setLocal('max_courses_deleted_ids', deletedIds.filter(id => String(id) !== String(newCourse.id)));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = { ...newCourse };
        if (!isUUID(payload.id)) delete payload.id;
        const { data, error } = await supabase.from('courses').insert(payload).select().single();
        if (!error && data) {
          const latestLocal = getLocal(STORAGE_KEYS.COURSES, updatedLocal);
          const replaced = latestLocal.map(x => (String(x.id) === String(newCourse.id) ? data : x));
          setLocal(STORAGE_KEYS.COURSES, replaced);
          return data;
        }
      } catch (e) {
        console.warn('Supabase addCourse failed', e);
      }
    }

    return newCourse;
  },

  async updateCourse(id, updates) {
    const stringId = String(id);
    const currentLocal = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const updatedLocal = currentLocal.map(c => (String(c.id) === stringId ? { ...c, ...updates } : c));
    setLocal(STORAGE_KEYS.COURSES, updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isUUID(id)) {
          const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
          if (!error && data) {
            const latestLocal = getLocal(STORAGE_KEYS.COURSES, updatedLocal);
            const replaced = latestLocal.map(x => (String(x.id) === stringId ? { ...x, ...data } : x));
            setLocal(STORAGE_KEYS.COURSES, replaced);
            return data;
          }
        }
      } catch (e) {
        console.warn('Supabase updateCourse failed', e);
      }
    }

    return updatedLocal.find(c => String(c.id) === stringId);
  },

  async deleteCourse(id) {
    const stringId = String(id);
    const currentLocal = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const filteredLocal = currentLocal.filter(c => String(c.id) !== stringId);
    setLocal(STORAGE_KEYS.COURSES, filteredLocal);

    const deletedIds = getLocal('max_courses_deleted_ids', []);
    if (!deletedIds.includes(stringId)) {
      setLocal('max_courses_deleted_ids', [...deletedIds, stringId]);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (isUUID(id)) {
          await supabase.from('courses').delete().eq('id', id);
        }
      } catch (e) {
        console.warn('Supabase deleteCourse failed', e);
      }
    }

    return true;
  },

  // FACULTY / INSTRUCTORS
  async getFaculty() {
    const deletedIds = new Set(getLocal('max_faculty_deleted_ids', []).map(String));
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          const supabaseIds = new Set(data.map(d => String(d.id)));
          const localItems = getLocal(STORAGE_KEYS.FACULTY, []);
          const localOnly = localItems.filter(l => !supabaseIds.has(String(l.id)) && !deletedIds.has(String(l.id)));

          let combined = [...data, ...localOnly];
          items = combined.filter(f => !deletedIds.has(String(f.id)));
          setLocal(STORAGE_KEYS.FACULTY, items);
        } else if (error) {
          console.warn('Supabase getFaculty notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase faculty failed, using fallback', e);
      }
    }

    if (items === null || (Array.isArray(items) && items.length === 0 && deletedIds.size === 0)) {
      let localItems = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
      if (!Array.isArray(localItems) || localItems.length === 0) {
        localItems = DEFAULT_FACULTY;
        setLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
      }
      items = localItems.filter(f => !deletedIds.has(String(f.id)));
    }

    return items;
  },

  async addFaculty(member) {
    const newId = (member.id && isUUID(member.id))
      ? member.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `faculty-${Date.now()}`);

    const newMember = {
      ...member,
      id: newId,
      is_active: member.is_active ?? true,
      display_order: member.display_order || 1,
      created_at: member.created_at || new Date().toISOString()
    };

    const currentLocal = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const updatedLocal = [newMember, ...currentLocal.filter(f => String(f.id) !== String(newMember.id))];
    setLocal(STORAGE_KEYS.FACULTY, updatedLocal);

    const deletedIds = getLocal('max_faculty_deleted_ids', []);
    if (deletedIds.includes(String(newMember.id))) {
      setLocal('max_faculty_deleted_ids', deletedIds.filter(id => String(id) !== String(newMember.id)));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = { ...newMember };
        if (!isUUID(payload.id)) delete payload.id;
        const { data, error } = await supabase.from('faculty').insert(payload).select().single();
        if (!error && data) {
          const latestLocal = getLocal(STORAGE_KEYS.FACULTY, updatedLocal);
          const replaced = latestLocal.map(x => (String(x.id) === String(newMember.id) ? data : x));
          setLocal(STORAGE_KEYS.FACULTY, replaced);
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('max_faculty_updated'));
          return data;
        } else if (error) {
          console.warn('Supabase addFaculty notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase addFaculty failed', e);
      }
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('max_faculty_updated'));
    return newMember;
  },

  async updateFaculty(id, updates) {
    const stringId = String(id);
    const currentLocal = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const updatedLocal = currentLocal.map(f => (String(f.id) === stringId ? { ...f, ...updates } : f));
    setLocal(STORAGE_KEYS.FACULTY, updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isUUID(id)) {
          const { data, error } = await supabase.from('faculty').update(updates).eq('id', id).select().single();
          if (!error && data) {
            const latestLocal = getLocal(STORAGE_KEYS.FACULTY, updatedLocal);
            const replaced = latestLocal.map(x => (String(x.id) === stringId ? { ...x, ...data } : x));
            setLocal(STORAGE_KEYS.FACULTY, replaced);
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('max_faculty_updated'));
            return data;
          }
        }
      } catch (e) {
        console.warn('Supabase updateFaculty failed', e);
      }
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('max_faculty_updated'));
    return updatedLocal.find(f => String(f.id) === stringId);
  },

  async deleteFaculty(id) {
    const stringId = String(id);

    const currentLocal = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const filteredLocal = currentLocal.filter(f => String(f.id) !== stringId);
    setLocal(STORAGE_KEYS.FACULTY, filteredLocal);

    const deletedIds = getLocal('max_faculty_deleted_ids', []);
    if (!deletedIds.includes(stringId)) {
      setLocal('max_faculty_deleted_ids', [...deletedIds, stringId]);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (isUUID(id)) {
          const { error } = await supabase.from('faculty').delete().eq('id', id);
          if (error) console.warn('Supabase deleteFaculty notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase deleteFaculty failed', e);
      }
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('max_faculty_updated'));
    return true;
  },

  // AUDIT LOGGING HELPER FOR MULTIPLE SYSTEM ADMINS
  async logAdminActivity(action, tableName = null, recordId = null, oldData = null, newData = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        const payload = {
          admin_id: user?.id || 'system-admin',
          admin_email: user?.email || 'Admin@2006',
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

  // GALLERY REALTIME & MULTI-ADMIN SYNC
  broadcastGalleryChange(detail = null) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('max_gallery_updated', { detail }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('max_gallery_sync_channel');
        bc.postMessage({ type: 'GALLERY_CHANGED', detail });
        bc.close();
      } catch (e) {}
    }
  },

  subscribeToGallery(callback) {
    const handleLocal = () => callback();

    if (typeof window !== 'undefined') {
      window.addEventListener('max_gallery_updated', handleLocal);
    }

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('max_gallery_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'GALLERY_CHANGED') {
            callback();
          }
        };
      } catch (e) {}
    }

    let supabaseChannel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseChannel = supabase
          .channel('public:gallery:realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'gallery' },
            () => callback()
          )
          .subscribe();
      } catch (e) {}
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('max_gallery_updated', handleLocal);
      }
      if (channel) channel.close();
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },

  // GALLERY (Supports Images, Videos, 1000+ Items with IndexedDB & Supabase Sync)
  async getGallery(category = 'All') {
    const deletedIds = new Set(getLocal('max_gallery_deleted_ids', []).map(String));
    let items = null;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const supabaseIds = new Set(data.map(d => String(d.id)));
          const localItems = await getStored(STORAGE_KEYS.GALLERY, []);
          const localOnly = localItems.filter(l => !supabaseIds.has(String(l.id)) && !deletedIds.has(String(l.id)));

          let combined = [...data, ...localOnly];
          if (category && category !== 'All') {
            combined = combined.filter(img => img.category?.toLowerCase() === category.toLowerCase());
          }
          items = combined.filter(img => !deletedIds.has(String(img.id)));
          await setStored(STORAGE_KEYS.GALLERY, items);
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
      items = localItems.filter(img => !deletedIds.has(String(img.id)));
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
      const newId = (item.id && isUUID(item.id))
        ? item.id
        : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `gal-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`);

      const fileUrl = item.file_url || item.image_url || '';
      const imageUrl = item.image_url || fileUrl;

      return {
        ...item,
        id: newId,
        media_type: item.media_type || (fileUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? 'video' : 'image'),
        file_url: fileUrl,
        image_url: imageUrl,
        thumbnail_url: item.thumbnail_url || imageUrl,
        storage_path: item.storage_path || null,
        file_name: item.file_name || null,
        file_size: item.file_size || null,
        mime_type: item.mime_type || null,
        category: item.category || 'Institute',
        is_published: item.is_published !== false,
        is_featured: item.is_featured ?? true,
        uploaded_by: item.uploaded_by || 'admin',
        created_at: item.created_at || new Date(Date.now() - idx * 100).toISOString()
      };
    });

    // 1. Update local & IndexedDB storage
    const currentLocal = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const existingMap = new Map(currentLocal.map(x => [String(x.id), x]));

    formattedItems.forEach(item => {
      existingMap.set(String(item.id), item);
    });

    const updatedList = Array.from(existingMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    await setStored(STORAGE_KEYS.GALLERY, updatedList);

    // Clear from deleted tracking if re-added
    const deletedIds = getLocal('max_gallery_deleted_ids', []);
    const addedIdsSet = new Set(formattedItems.map(i => String(i.id)));
    const filteredDeleted = deletedIds.filter(id => !addedIdsSet.has(String(id)));
    setLocal('max_gallery_deleted_ids', filteredDeleted);

    // 2. Batch insert into Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const CHUNK_SIZE = 50;
        const insertedFromSupabase = [];

        for (let i = 0; i < formattedItems.length; i += CHUNK_SIZE) {
          const chunk = formattedItems.slice(i, i + CHUNK_SIZE).map(item => {
            const payload = { ...item };
            if (!isUUID(payload.id)) delete payload.id;
            return payload;
          });

          const { data, error } = await supabase.from('gallery').insert(chunk).select();
          if (!error && Array.isArray(data)) {
            insertedFromSupabase.push(...data);
          } else if (error) {
            console.warn('Supabase batch insert notice:', error.message || error);
            // Storage cleanup on DB insert failure
            for (const failedItem of chunk) {
              if (failedItem.storage_path) {
                deleteStorageFile('gallery', failedItem.storage_path).catch(() => {});
              }
            }
          }
        }

        if (insertedFromSupabase.length > 0) {
          const latestLocal = await getStored(STORAGE_KEYS.GALLERY, updatedList);
          const sbMap = new Map(insertedFromSupabase.map(d => [String(d.id), d]));
          const replaced = latestLocal.map(x => sbMap.get(String(x.id)) || x);
          await setStored(STORAGE_KEYS.GALLERY, replaced);
        }
      } catch (e) {
        console.warn('Supabase addGalleryItems batch failed', e);
      }
    }

    this.logAdminActivity('UPLOADED_GALLERY_MEDIA', 'gallery', formattedItems.map(i => i.id).join(','), null, formattedItems);
    this.broadcastGalleryChange(formattedItems);
    return formattedItems;
  },

  async updateGalleryItem(id, updates) {
    const currentLocal = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const target = currentLocal.find(g => String(g.id) === String(id));
    if (!target) return null;

    const merged = { ...target, ...updates, updated_at: new Date().toISOString() };

    const updatedList = currentLocal.map(g => (String(g.id) === String(id) ? merged : g));
    await setStored(STORAGE_KEYS.GALLERY, updatedList);

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      try {
        const { data, error } = await supabase.from('gallery').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const replaced = updatedList.map(g => (String(g.id) === String(id) ? data : g));
          await setStored(STORAGE_KEYS.GALLERY, replaced);
        }
      } catch (e) {
        console.warn('Supabase updateGalleryItem failed', e);
      }
    }

    const actionName = updates.is_published !== undefined 
      ? (updates.is_published ? 'PUBLISHED_GALLERY_MEDIA' : 'UNPUBLISHED_GALLERY_MEDIA')
      : 'UPDATED_GALLERY_MEDIA';

    this.logAdminActivity(actionName, 'gallery', id, target, merged);
    this.broadcastGalleryChange(merged);
    return merged;
  },

  async deleteGalleryItem(id) {
    return this.deleteGalleryItems([id]);
  },

  async deleteGalleryItems(idsArray) {
    if (!Array.isArray(idsArray) || idsArray.length === 0) return true;

    const idsSet = new Set(idsArray.map(String));

    // 1. Delete from local IndexedDB & LocalStorage
    const currentLocal = await getStored(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const itemsToDelete = currentLocal.filter(g => idsSet.has(String(g.id)));
    const filteredLocal = currentLocal.filter(g => !idsSet.has(String(g.id)));
    await setStored(STORAGE_KEYS.GALLERY, filteredLocal);

    // 2. Track deleted IDs
    const deletedIds = getLocal('max_gallery_deleted_ids', []);
    const updatedDeleted = Array.from(new Set([...deletedIds, ...idsArray.map(String)]));
    setLocal('max_gallery_deleted_ids', updatedDeleted);

    // 3. Delete files from Storage & records from Supabase DB
    for (const item of itemsToDelete) {
      if (item.storage_path) {
        deleteStorageFile('gallery', item.storage_path).catch(() => {});
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const validUUIDs = idsArray.filter(isUUID);
        if (validUUIDs.length > 0) {
          const { error } = await supabase.from('gallery').delete().in('id', validUUIDs);
          if (error) console.warn('Supabase deleteGalleryItems notice:', error.message || error);
        }
      } catch (e) {
        console.warn('Supabase deleteGalleryItems failed', e);
      }
    }

    this.logAdminActivity('DELETED_GALLERY_MEDIA', 'gallery', idsArray.join(','), itemsToDelete, null);
    this.broadcastGalleryChange(idsArray);
    return true;
  },

  // REVIEWS & REAL-TIME MULTI-DEVICE SYNC ALGORITHM
  broadcastReviewChange(detail = null) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('max_review_changed', { detail }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('max_reviews_sync_channel');
        bc.postMessage({ type: 'REVIEW_CHANGED', detail });
        bc.close();
      } catch (e) {}
    }
  },

  subscribeToReviews(callback) {
    const handleLocal = (e) => callback(e.detail || null);

    if (typeof window !== 'undefined') {
      window.addEventListener('max_review_changed', handleLocal);
    }

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('max_reviews_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'REVIEW_CHANGED') {
            callback(event.data.detail);
          }
        };
      } catch (e) {}
    }

    let supabaseChannel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseChannel = supabase
          .channel('public:reviews:realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reviews' },
            (payload) => {
              callback(payload.new || payload.old || payload);
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Supabase reviews realtime subscription failed:', e);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('max_review_changed', handleLocal);
      }
      if (channel) channel.close();
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },

  async getReviews() {
    let list = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          list = data;
        }
      } catch (e) {
        console.warn('Supabase reviews failed', e);
      }
    }
    if (!list || list.length === 0) {
      list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    }

    // Ranking algorithm: Featured (Admin priority) -> Rating (5 to 1) -> Newest Date
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
    const defaultId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `rev-${Date.now()}`;
    const newRev = {
      ...review,
      id: review.id || defaultId,
      source: review.source || 'Direct Submission',
      is_featured: review.is_featured ?? true,
      created_at: review.created_at || new Date().toISOString()
    };
    let result = newRev;
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = { ...newRev };
        if (payload.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id)) {
          delete payload.id;
        }
        const { data, error } = await supabase.from('reviews').insert(payload).select().single();
        if (!error && data) result = data;
        else if (error) console.warn('Supabase addReview error:', error);
      } catch (e) {
        console.warn('Supabase addReview failed, saving locally', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const updated = [result, ...list.filter(r => r.id !== result.id)];
    setLocal(STORAGE_KEYS.REVIEWS, updated);
    this.broadcastReviewChange(result);
    return result;
  },

  async updateReview(id, updates) {
    let result = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').update(updates).eq('id', id).select().single();
        if (!error && data) result = data;
      } catch (e) {
        console.warn('Supabase updateReview failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const updated = list.map(r => (r.id === id ? { ...r, ...updates } : r));
    setLocal(STORAGE_KEYS.REVIEWS, updated);
    this.broadcastReviewChange(result || { id, ...updates });
    return updated.find(r => r.id === id);
  },

  async deleteReview(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reviews').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteReview failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const filtered = list.filter(r => r.id !== id);
    setLocal(STORAGE_KEYS.REVIEWS, filtered);
    this.broadcastReviewChange({ id, deleted: true });
    return true;
  },

  // ENQUIRIES & REAL-TIME MULTI-DEVICE SYNC
  subscribeToEnquiries(callback) {
    const handleLocal = (e) => callback(e.detail || null);

    if (typeof window !== 'undefined') {
      window.addEventListener('max_enquiry_submitted', handleLocal);
    }

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('max_enquiries_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'ENQUIRY_CHANGED') {
            callback(event.data.detail || null);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel subscription failed', err);
      }
    }

    let supabaseSub = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseSub = supabase
          .channel('public:enquiries:realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'enquiries' },
            (payload) => {
              callback(payload.new || payload.old || null);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime subscription error', err);
      }
    }

    // Backup polling every 8 seconds across devices
    const pollTimer = setInterval(() => {
      callback(null);
    }, 8000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('max_enquiry_submitted', handleLocal);
      }
      if (channel) {
        try { channel.close(); } catch (e) {}
      }
      if (supabaseSub && supabase) {
        try { supabase.removeChannel(supabaseSub); } catch (e) {}
      }
      clearInterval(pollTimer);
    };
  },

  broadcastEnquiryChange(detail = null) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('max_enquiry_submitted', { detail }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('max_enquiries_sync_channel');
        bc.postMessage({ type: 'ENQUIRY_CHANGED', detail });
        bc.close();
      } catch (e) {}
    }
  },

  async getEnquiries() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase enquiries failed', e);
      }
    }
    return getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
  },

  async createEnquiry(enquiry) {
    const defaultId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `enq-${Date.now()}`;
    const newEnq = {
      ...enquiry,
      id: defaultId,
      status: enquiry.status || 'New',
      created_at: enquiry.created_at || new Date().toISOString()
    };
    let result = newEnq;
    if (isSupabaseConfigured && supabase) {
      try {
        const insertPayload = { ...newEnq };
        if (insertPayload.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(insertPayload.id)) {
          delete insertPayload.id;
        }
        const { data, error } = await supabase.from('enquiries').insert(insertPayload).select().single();
        if (!error && data) result = data;
        else if (error) console.warn('Supabase createEnquiry error:', error);
      } catch (e) {
        console.warn('Supabase createEnquiry failed, saving locally', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const updated = [result, ...list.filter(item => item.id !== result.id)];
    setLocal(STORAGE_KEYS.ENQUIRIES, updated);
    this.broadcastEnquiryChange(result);
    return result;
  },

  async updateEnquiryStatus(id, status) {
    let result = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('enquiries').update({ status }).eq('id', id).select().single();
        if (!error && data) {
          result = data;
        }
      } catch (e) {
        console.warn('Supabase updateEnquiryStatus failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const updated = list.map(e => (e.id === id ? { ...e, status } : e));
    setLocal(STORAGE_KEYS.ENQUIRIES, updated);
    this.broadcastEnquiryChange(result || { id, status });
    return updated.find(e => e.id === id);
  },

  async deleteEnquiry(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('enquiries').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteEnquiry failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const filtered = list.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.ENQUIRIES, filtered);
    this.broadcastEnquiryChange({ id, deleted: true });
    return true;
  },

  // FAQ REALTIME & SYNC
  broadcastFAQChange(detail = null) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('max_faq_updated', { detail }));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('max_faq_sync_channel');
        bc.postMessage({ type: 'FAQ_CHANGED', detail });
        bc.close();
      } catch (e) {}
    }
  },

  subscribeToFAQ(callback) {
    const handleLocal = () => callback();

    if (typeof window !== 'undefined') {
      window.addEventListener('max_faq_updated', handleLocal);
    }

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('max_faq_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'FAQ_CHANGED') {
            callback();
          }
        };
      } catch (e) {}
    }

    let supabaseChannel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseChannel = supabase
          .channel('public:faq:realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'faq' },
            () => callback()
          )
          .subscribe();
      } catch (e) {}
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('max_faq_updated', handleLocal);
      }
      if (channel) channel.close();
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },

  async getFAQ() {
    let supabaseData = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faq').select('*').order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          supabaseData = data;
        } else if (error) {
          console.error('Supabase getFAQ error:', error);
        }
      } catch (e) {
        console.warn('Supabase FAQ failed', e);
      }
    }

    const localData = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);

    if (supabaseData) {
      const supabaseIds = new Set(supabaseData.map(item => String(item.id)));
      const localOnly = localData.filter(item => item && item.id && !supabaseIds.has(String(item.id)));
      const merged = [...supabaseData, ...localOnly];
      setLocal(STORAGE_KEYS.FAQ, merged);
      idbSet(STORAGE_KEYS.FAQ, merged);
      return merged;
    }

    return localData;
  },

  async addFAQ(faq) {
    const rawId = faq.id;
    const isValUUID = isUUID(rawId);
    
    const insertPayload = {
      category: faq.category || 'General',
      question: String(faq.question || '').trim(),
      answer: String(faq.answer || '').trim(),
      display_order: parseInt(faq.display_order) || 1,
      is_active: faq.is_active !== false,
      created_at: new Date().toISOString()
    };

    if (isValUUID) {
      insertPayload.id = rawId;
    }

    let savedItem = { id: rawId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `faq-${Date.now()}`), ...insertPayload };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faq').insert(insertPayload).select().single();
        if (!error && data) {
          savedItem = data;
        } else if (error) {
          console.error('Supabase addFAQ error:', error);
        }
      } catch (e) {
        console.warn('Supabase addFAQ failed', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const updated = [...current.filter(f => String(f.id) !== String(savedItem.id) && String(f.id) !== String(rawId)), savedItem];
    setLocal(STORAGE_KEYS.FAQ, updated);
    idbSet(STORAGE_KEYS.FAQ, updated);
    this.broadcastFAQChange(updated);
    return savedItem;
  },

  async updateFAQ(id, updates) {
    const current = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const target = current.find(f => String(f.id) === String(id)) || {};
    const merged = { ...target, ...updates, id };

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      try {
        const { data, error } = await supabase.from('faq').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const updated = current.map(f => (String(f.id) === String(id) ? data : f));
          setLocal(STORAGE_KEYS.FAQ, updated);
          idbSet(STORAGE_KEYS.FAQ, updated);
          this.broadcastFAQChange(updated);
          return data;
        } else if (error) {
          console.error('Supabase updateFAQ error:', error);
        }
      } catch (e) {
        console.warn('Supabase updateFAQ failed', e);
      }
    }

    const updated = current.map(f => (String(f.id) === String(id) ? merged : f));
    setLocal(STORAGE_KEYS.FAQ, updated);
    idbSet(STORAGE_KEYS.FAQ, updated);
    this.broadcastFAQChange(updated);
    return merged;
  },

  async deleteFAQ(id) {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      try {
        await supabase.from('faq').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteFAQ failed', e);
      }
    }

    const current = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const filtered = current.filter(f => String(f.id) !== String(id));
    setLocal(STORAGE_KEYS.FAQ, filtered);
    idbSet(STORAGE_KEYS.FAQ, filtered);
    this.broadcastFAQChange(filtered);
    return true;
  },

  // ANNOUNCEMENTS / POSTS WITH TIME SCHEDULING
  async getPosts() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          setLocal(STORAGE_KEYS.POSTS, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase getPosts failed, using local fallback', e);
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

  broadcastPostsChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('max_posts_updated'));
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('max_posts_sync_channel');
        bc.postMessage({ type: 'POSTS_CHANGED' });
        bc.close();
      } catch (e) {}
    }
  },

  async addPost(post) {
    const defaultId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `post-${Date.now()}`;
    const newPost = {
      ...post,
      id: defaultId,
      is_active: post.is_active ?? true,
      start_time: post.start_time || null,
      end_time: post.end_time || null,
      created_at: post.created_at || new Date().toISOString()
    };
    let result = newPost;
    const list = getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);

    if (isSupabaseConfigured && supabase) {
      try {
        const insertPayload = { ...newPost };
        if (insertPayload.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(insertPayload.id)) {
          delete insertPayload.id;
        }
        const { data, error } = await supabase.from('posts').insert(insertPayload).select().single();
        if (!error && data) {
          result = data;
        } else if (error) {
          console.warn('Supabase addPost error:', error);
        }
      } catch (e) {
        console.warn('Supabase addPost failed', e);
      }
    }
    const updated = [result, ...list.filter(p => String(p.id) !== String(result.id))];
    setLocal(STORAGE_KEYS.POSTS, updated);
    this.broadcastPostsChange();
    return result;
  },

  async updatePost(id, updates) {
    let result = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select().single();
        if (!error && data) {
          result = data;
        }
      } catch (e) {
        console.warn('Supabase updatePost failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    const updated = list.map(p => (String(p.id) === String(id) ? { ...p, ...updates, ...(result || {}) } : p));
    setLocal(STORAGE_KEYS.POSTS, updated);
    this.broadcastPostsChange();
    return updated.find(p => String(p.id) === String(id));
  },

  async deletePost(id) {
    const list = getLocal(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    const filtered = list.filter(p => String(p.id) !== String(id));
    setLocal(STORAGE_KEYS.POSTS, filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('posts').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deletePost failed', e);
      }
    }
    this.broadcastPostsChange();
    return true;
  }
};
