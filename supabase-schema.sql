-- ==============================================================================
-- MAX Educational Institution — Complete Supabase PostgreSQL Schema & Seed Data
-- Location: Azhagiyamandapam, Mulagamooddu, Tamil Nadu
-- Phone: 063809 27568
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_name TEXT NOT NULL DEFAULT 'MAX Educational Institution',
  tagline TEXT NOT NULL DEFAULT 'Empowering Students With Skills for Tomorrow',
  phone TEXT NOT NULL DEFAULT '+91 99654 68185',
  phone2 TEXT DEFAULT '+91 63809 27568',
  email TEXT DEFAULT 'contact@maxinstitute.edu.in',
  address TEXT NOT NULL DEFAULT '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  opening_time TEXT NOT NULL DEFAULT '09:00 AM',
  closing_time TEXT NOT NULL DEFAULT '06:00 PM',
  google_rating NUMERIC(2,1) DEFAULT 4.9,
  total_google_reviews INTEGER DEFAULT 110,
  google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6',
  google_maps_embed TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin',
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'Computer Courses', 'Typing Courses', 'Technical Courses'
  duration TEXT NOT NULL DEFAULT 'Flexible',
  level TEXT NOT NULL DEFAULT 'Beginner to Advanced',
  icon TEXT NOT NULL DEFAULT 'Monitor',
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. FACULTY TABLE
CREATE TABLE IF NOT EXISTS public.faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience TEXT NOT NULL,
  photo_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
  file_url TEXT NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  storage_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  category TEXT NOT NULL DEFAULT 'Institute', -- 'Institute', 'Classroom', 'Students', 'Activities', 'Events'
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  uploaded_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  source TEXT DEFAULT 'Google Review',
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Closed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. FAQ TABLE
CREATE TABLE IF NOT EXISTS public.faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PROFILES (ADMINS) TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ANNOUNCEMENTS / POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Admission Notice',
  content TEXT NOT NULL,
  image_url TEXT,
  action_label TEXT DEFAULT 'Enquire Now',
  action_link TEXT DEFAULT '/contact',
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling public read and write access for anonymous & authenticated users
-- ==============================================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present
DROP POLICY IF EXISTS "Public full access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public full access to courses" ON public.courses;
DROP POLICY IF EXISTS "Public full access to faculty" ON public.faculty;
DROP POLICY IF EXISTS "Public full access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public full access to enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public full access to faq" ON public.faq;
DROP POLICY IF EXISTS "Public full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public full access to posts" ON public.posts;

-- Create open policies for seamless public viewing and administration across anon and authenticated roles
CREATE POLICY "Public full access to site_settings" ON public.site_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to faculty" ON public.faculty FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to gallery" ON public.gallery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to reviews" ON public.reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to enquiries" ON public.enquiries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to faq" ON public.faq FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to posts" ON public.posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Enable Realtime Broadcasting for Enquiries & Announcements across all admin devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- Creates public buckets for uploaded images (Gallery, Courses, Faculty, Reviews)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('faculty', 'faculty', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Objects Policies for public reading and uploading
DROP POLICY IF EXISTS "Public Read Storage Objects" ON storage.objects;
CREATE POLICY "Public Read Storage Objects" ON storage.objects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Storage Objects" ON storage.objects;
CREATE POLICY "Public Insert Storage Objects" ON storage.objects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Storage Objects" ON storage.objects;
CREATE POLICY "Public Update Storage Objects" ON storage.objects FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Storage Objects" ON storage.objects;
CREATE POLICY "Public Delete Storage Objects" ON storage.objects FOR DELETE USING (true);

-- ==============================================================================
-- SEED DATA
-- Populate initial courses, faculty/instructors, gallery photos, and settings
-- ==============================================================================

-- Site Settings Seed
INSERT INTO public.site_settings (institute_name, tagline, phone, email, address, opening_time, closing_time, google_rating, total_google_reviews)
VALUES (
  'MAX Educational Institution',
  'Empowering Students With Skills for Tomorrow',
  '+91 99654 68185',
  'contact@maxinstitute.edu.in',
  '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  '09:00 AM',
  '06:00 PM',
  4.9,
  110
) ON CONFLICT DO NOTHING;

-- Courses Seed
INSERT INTO public.courses (title, slug, short_description, description, category, duration, level, icon, image_url, display_order)
VALUES
  ('Basic Computer Training', 'basic-computer-training', 'Foundational computer literacy covering OS navigation, file management, internet operations, and email communication.', 'Designed specifically for beginners, school students, and adult learners to build absolute confidence in using desktop computers, managing digital documents, and navigating modern web tools.', 'Computer Courses', '1 - 2 Months', 'Beginner', 'Monitor', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80', 1),
  ('MS Office Suite Mastery', 'ms-office-suite', 'Comprehensive practical training in Microsoft Word, Excel spreadsheets, PowerPoint presentations, and Outlook.', 'Master essential workplace productivity tools. Includes advanced spreadsheet formulas, data filtering, report formatting, high-impact business presentation design, and administrative correspondence.', 'Computer Courses', '2 Months', 'Beginner to Intermediate', 'BookOpen', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80', 2),
  ('Computer Applications (DCA)', 'computer-applications-dca', 'Diploma in Computer Applications covering desktop computing, database fundamentals, and digital office management.', 'A career-oriented diploma program preparing candidates for clerical, administrative, and data entry job roles in private and government sectors.', 'Computer Courses', '3 - 6 Months', 'Intermediate', 'GraduationCap', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80', 3),
  ('Programming Fundamentals', 'programming-fundamentals', 'Introduction to algorithmic problem solving, logic building, data structures, and foundational coding syntax.', 'Develop structured computational thinking. Learn variables, conditionals, loops, functions, and debugging principles applicable across modern software languages.', 'Computer Courses', '3 Months', 'Intermediate', 'Keyboard', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80', 4),
  ('English Typing (Junior & Senior)', 'english-typing', 'Structured touch typing techniques designed to build precision, rhythm, and industry-standard word-per-minute speed.', 'Systematic keyboarding drills focusing on home-row discipline, blind touch typing, error elimination, and rigorous speed test simulations for official examinations.', 'Typing Courses', '3 - 6 Months', 'All Levels', 'Keyboard', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 5),
  ('Tamil Typing (Junior & Senior)', 'tamil-typing', 'Specialized Tamil typewriter and computer keyboard layout training with speed acceleration techniques.', 'Master regional language keyboard layouts (Bamini / Tamil 99) with dedicated instructors, structured passage drills, and focused speed tests.', 'Typing Courses', '3 - 6 Months', 'All Levels', 'Keyboard', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', 6),
  ('Speed Development Lab', 'speed-development', 'Targeted speed and accuracy development sessions for competitive examination and typist test aspirants.', 'High-intensity timed drills, analytical error breakdown, and custom rhythm enhancement for candidates preparing for government typing exams.', 'Typing Courses', '1 - 2 Months', 'Advanced', 'Award', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80', 7),
  ('Technical Fundamentals', 'technical-fundamentals', 'Hands-on practical training in hardware components, operating system installation, troubleshooting, and networking.', 'Understand PC architecture, RAM/storage installation, peripheral connectivity, driver management, antivirus setups, and basic local area networking.', 'Technical Courses', '2 - 3 Months', 'Intermediate', 'Settings', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 8),
  ('Practical Office Computing', 'practical-office-computing', 'Real-world workplace workflow training covering billing software, accounting spreadsheets, and official documentation.', 'Simulated corporate office scenarios providing hands-on experience with daily data entry, invoice generation, customer correspondence, and digital filing.', 'Technical Courses', '2 Months', 'All Levels', 'Users', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', 9)
ON CONFLICT (slug) DO NOTHING;

-- Faculty Seed
INSERT INTO public.faculty (name, designation, specialization, experience, photo_url, description, display_order)
VALUES
  ('S. Rajeswari', 'Senior Technical Instructor', 'Computer Applications & Office Systems', '8+ Years', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80', 'Dedicated instructor with deep expertise in coaching beginners and students through structured, step-by-step practical computing exercises.', 1),
  ('M. Selvakumar', 'Head of Typing Division', 'English & Tamil Touch Typing (Jr / Sr)', '10+ Years', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80', 'Specialist in touch typing mechanics, keyboard ergonomics, and speed-building strategies for state board typing examinations.', 2),
  ('A. Ananthi', 'Hardware & Systems Mentor', 'Hardware Troubleshooting & Basic Networking', '6+ Years', 'https://images.unsplash.com/photo-1580894732488-828faaa086dc?w=600&auto=format&fit=crop&q=80', 'Hands-on mentor guiding students through real hardware assembly, diagnostic routines, software configurations, and PC maintenance.', 3)
ON CONFLICT DO NOTHING;

-- Reviews Seed
INSERT INTO public.reviews (student_name, review, rating, source, is_featured)
VALUES
  ('Keerthana Keerthi', 'Excellent institution with highly experienced and supportive faculty. It provides a structured learning environment with knowledgeable teachers.', 5, 'Google Review', true),
  ('Jenisha', 'Excellent institution. The Institute provides a structured learning environment with knowledgeable teachers.', 5, 'Google Review', true),
  ('Haneesha Haneesha', 'Very good teaching staffs and Institute management also very good.', 5, 'Google Review', true),
  ('Karthik T.S.', 'Good teachings and well trained staffs.', 5, 'Google Review', true),
  ('S. Anand', 'One of the best coaching centres in Azhagiyamandapam. Flexible batch timings and individual focus on computer practicals.', 5, 'Google Review', true)
ON CONFLICT DO NOTHING;

-- FAQ Seed
INSERT INTO public.faq (question, answer, category, display_order)
VALUES
  ('What courses are available at MAX Educational Institution?', 'MAX offers professional computer education including Basic Computer Training, MS Office Mastery, Diploma in Computer Applications (DCA), Programming Fundamentals, English & Tamil Touch Typing (Junior & Senior), Speed Development, and Technical Fundamentals.', 'Courses', 1),
  ('Where is MAX Educational Institution located?', 'We are located on the 1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167.', 'General', 2),
  ('How can I enquire or register for a course?', 'You can submit the online enquiry form on our website with your contact information, or call us directly at +91 99654 68185. Our team will reach out to explain batch schedules, curriculum, and admission details.', 'Admissions', 3),
  ('Can I visit the institute and see the labs before enrolling?', 'Absolutely. Prospective students and parents are warmly invited to visit our center between 09:00 AM and 06:00 PM Monday through Saturday to see our computer lab, interact with the instructors, and test typing equipment.', 'General', 4),
  ('Are class timings flexible for college students and working professionals?', 'Yes! We offer morning, afternoon, and evening batches with flexible timing options to suit the daily schedules of school pupils, college students, and working individuals.', 'Courses', 5)
ON CONFLICT DO NOTHING;

-- Initial Gallery Seed
INSERT INTO public.gallery (title, description, image_url, category, display_order, is_featured)
VALUES
  ('Main Computer Practice Lab', 'Modern workstations providing individual computer access for every enrolled student.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', 'Classroom', 1, true),
  ('Dedicated Typing Section', 'Focused keyboarding workstations designed for English and Tamil typing practice.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 'Institute', 2, true),
  ('One-on-One Instructor Guidance', 'Experienced faculty resolving student questions during practical software training.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80', 'Students', 3, true),
  ('Focused Classroom Atmosphere', 'Disciplined and encouraging environment for learning and career preparation.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', 'Classroom', 4, true),
  ('Student Achievement & Certification', 'Celebrating course completions and typing speed milestones achieved by our students.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', 'Events', 5, true),
  ('Institute Facility at Azhagiyamandapam', 'Conveniently situated on 1st Floor, Trivandrum–Nagercoil Highway.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', 'Institute', 6, true)
ON CONFLICT DO NOTHING;
