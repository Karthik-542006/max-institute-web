import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  SETTINGS: 'max_site_settings',
  COURSES: 'max_courses',
  FACULTY: 'max_faculty',
  GALLERY: 'max_gallery',
  REVIEWS: 'max_reviews',
  ENQUIRIES: 'max_enquiries',
  FAQ: 'max_faq',
};

// Initial Seed Data
const DEFAULT_SETTINGS = {
  id: 'default-settings',
  institute_name: 'MAX Educational Institution',
  tagline: 'Empowering Students With Skills for Tomorrow',
  phone: '063809 27568',
  email: 'contact@maxinstitute.edu.in',
  address: '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  opening_time: '09:00 AM',
  closing_time: '06:00 PM',
  google_rating: 4.9,
  total_google_reviews: 110,
  google_maps_url: 'https://maps.google.com/?q=Azhagiyamandapam+Tamil+Nadu',
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.337774780572!2d77.29177117565349!3d8.269151591765038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04fe68846c4fa3%3A0xe5108b3e34bcf93f!2sAzhagiyamandapam%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin'
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
    answer: 'We are located on the 1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167.',
    category: 'General',
    display_order: 2,
    is_active: true
  },
  {
    id: 'faq-3',
    question: 'How can I enquire or register for a course?',
    answer: 'You can submit the online enquiry form on our website with your contact information, or call us directly at 063809 27568. Our team will reach out to explain batch schedules, curriculum, and admission details.',
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

// Local Storage Helper
function getLocal(key, defaultValue) {
  try {
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
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
}

// Unified Data Service API
export const dataService = {
  // SETTINGS
  async getSettings() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        if (!error && data) {
          setLocal(STORAGE_KEYS.SETTINGS, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase fetch settings failed, falling back to local storage', e);
      }
    }
    return getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  async updateSettings(updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
        const payload = existing?.id ? { id: existing.id, ...updates } : { ...updates };
        const { data, error } = await supabase.from('site_settings').upsert(payload).select().single();
        if (!error && data) {
          setLocal(STORAGE_KEYS.SETTINGS, data);
          return data;
        } else if (error) {
          console.error('Supabase updateSettings error:', error);
        }
      } catch (e) {
        console.warn('Supabase updateSettings failed, saving locally', e);
      }
    }
    const current = getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // COURSES
  async getCourses() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) setLocal(STORAGE_KEYS.COURSES, data);
          return data;
        } else if (error) {
          console.error('Supabase getCourses error:', error);
        }
      } catch (e) {
        console.warn('Supabase courses failed, using fallback', e);
      }
    }
    return getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
  },

  async addCourse(course) {
    const newCourse = {
      ...course,
      id: course.id || `course-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').insert(newCourse).select().single();
        if (!error && data) {
          const list = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
          setLocal(STORAGE_KEYS.COURSES, [...list, data]);
          return data;
        } else if (error) {
          console.error('Supabase addCourse error:', error);
        }
      } catch (e) {
        console.warn('Supabase addCourse failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const updated = [...list, newCourse];
    setLocal(STORAGE_KEYS.COURSES, updated);
    return newCourse;
  },

  async updateCourse(id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const list = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
          const updatedList = list.map(c => (c.id === id ? { ...c, ...data } : c));
          setLocal(STORAGE_KEYS.COURSES, updatedList);
          return data;
        } else if (error) {
          console.error('Supabase updateCourse error:', error);
        }
      } catch (e) {
        console.warn('Supabase updateCourse failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const updated = list.map(c => (c.id === id ? { ...c, ...updates } : c));
    setLocal(STORAGE_KEYS.COURSES, updated);
    return updated.find(c => c.id === id);
  },

  async deleteCourse(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) console.error('Supabase deleteCourse error:', error);
      } catch (e) {
        console.warn('Supabase deleteCourse failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
    const filtered = list.filter(c => c.id !== id);
    setLocal(STORAGE_KEYS.COURSES, filtered);
    return true;
  },

  // FACULTY / INSTRUCTORS
  async getFaculty() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) setLocal(STORAGE_KEYS.FACULTY, data);
          return data;
        } else if (error) {
          console.error('Supabase getFaculty error:', error);
        }
      } catch (e) {
        console.warn('Supabase faculty failed, using fallback', e);
      }
    }
    return getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
  },

  async addFaculty(member) {
    const newMember = {
      ...member,
      id: member.id || `faculty-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faculty').insert(newMember).select().single();
        if (!error && data) {
          const list = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
          setLocal(STORAGE_KEYS.FACULTY, [...list, data]);
          return data;
        } else if (error) {
          console.error('Supabase addFaculty error:', error);
        }
      } catch (e) {
        console.warn('Supabase addFaculty failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const updated = [...list, newMember];
    setLocal(STORAGE_KEYS.FACULTY, updated);
    return newMember;
  },

  async updateFaculty(id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faculty').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const list = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
          const updatedList = list.map(f => (f.id === id ? { ...f, ...data } : f));
          setLocal(STORAGE_KEYS.FACULTY, updatedList);
          return data;
        } else if (error) {
          console.error('Supabase updateFaculty error:', error);
        }
      } catch (e) {
        console.warn('Supabase updateFaculty failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const updated = list.map(f => (f.id === id ? { ...f, ...updates } : f));
    setLocal(STORAGE_KEYS.FACULTY, updated);
    return updated.find(f => f.id === id);
  },

  async deleteFaculty(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('faculty').delete().eq('id', id);
        if (error) console.error('Supabase deleteFaculty error:', error);
      } catch (e) {
        console.warn('Supabase deleteFaculty failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.FACULTY, DEFAULT_FACULTY);
    const filtered = list.filter(f => f.id !== id);
    setLocal(STORAGE_KEYS.FACULTY, filtered);
    return true;
  },

  // GALLERY
  async getGallery(category = 'All') {
    let items = null;
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('gallery').select('*').order('display_order', { ascending: true });
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (!error && data) items = data;
        else if (error) console.error('Supabase getGallery error:', error);
      } catch (e) {
        console.warn('Supabase gallery failed', e);
      }
    }
    if (items === null) {
      items = getLocal(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
      if (category && category !== 'All') {
        items = items.filter(img => img.category.toLowerCase() === category.toLowerCase());
      }
    }
    return items;
  },

  async addGalleryItem(item) {
    const newItem = {
      ...item,
      id: item.id || `gal-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('gallery').insert(newItem).select().single();
        if (!error && data) {
          const list = getLocal(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
          setLocal(STORAGE_KEYS.GALLERY, [data, ...list]);
          return data;
        } else if (error) {
          console.error('Supabase addGalleryItem error:', error);
        }
      } catch (e) {
        console.warn('Supabase addGallery failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const updated = [newItem, ...list];
    setLocal(STORAGE_KEYS.GALLERY, updated);
    return newItem;
  },

  async deleteGalleryItem(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) console.error('Supabase deleteGalleryItem error:', error);
      } catch (e) {
        console.warn('Supabase deleteGallery failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    const filtered = list.filter(g => g.id !== id);
    setLocal(STORAGE_KEYS.GALLERY, filtered);
    return true;
  },

  // REVIEWS
  async getReviews() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          if (data.length > 0) setLocal(STORAGE_KEYS.REVIEWS, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase reviews failed', e);
      }
    }
    return getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
  },

  async addReview(review) {
    const newRev = {
      ...review,
      id: review.id || `rev-${Date.now()}`,
      source: review.source || 'Direct Submission',
      is_featured: review.is_featured ?? true,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').insert(newRev).select().single();
        if (!error && data) {
          const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
          setLocal(STORAGE_KEYS.REVIEWS, [data, ...list]);
          return data;
        }
      } catch (e) {
        console.warn('Supabase addReview failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const updated = [newRev, ...list];
    setLocal(STORAGE_KEYS.REVIEWS, updated);
    return newRev;
  },

  async updateReview(id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateReview failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    const updated = list.map(r => (r.id === id ? { ...r, ...updates } : r));
    setLocal(STORAGE_KEYS.REVIEWS, updated);
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
    return true;
  },

  // ENQUIRIES
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
    const newEnq = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      status: 'New',
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('enquiries').insert(newEnq).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createEnquiry failed, saving locally', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const updated = [newEnq, ...list];
    setLocal(STORAGE_KEYS.ENQUIRIES, updated);
    return newEnq;
  },

  async updateEnquiryStatus(id, status) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('enquiries').update({ status }).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateEnquiryStatus failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.ENQUIRIES, DEFAULT_ENQUIRIES);
    const updated = list.map(e => (e.id === id ? { ...e, status } : e));
    setLocal(STORAGE_KEYS.ENQUIRIES, updated);
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
    return true;
  },

  // FAQ
  async getFAQ() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faq').select('*').order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) setLocal(STORAGE_KEYS.FAQ, data);
          return data;
        }
      } catch (e) {
        console.warn('Supabase FAQ failed', e);
      }
    }
    return getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
  },

  async addFAQ(faq) {
    const newFaq = {
      ...faq,
      id: faq.id || `faq-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faq').insert(newFaq).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase addFAQ failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const updated = [...list, newFaq];
    setLocal(STORAGE_KEYS.FAQ, updated);
    return newFaq;
  },

  async updateFAQ(id, updates) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faq').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateFAQ failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const updated = list.map(f => (f.id === id ? { ...f, ...updates } : f));
    setLocal(STORAGE_KEYS.FAQ, updated);
    return updated.find(f => f.id === id);
  },

  async deleteFAQ(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('faq').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteFAQ failed', e);
      }
    }
    const list = getLocal(STORAGE_KEYS.FAQ, DEFAULT_FAQ);
    const filtered = list.filter(f => f.id !== id);
    setLocal(STORAGE_KEYS.FAQ, filtered);
    return true;
  }
};
