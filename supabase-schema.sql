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
  phone TEXT NOT NULL DEFAULT '063809 27568',
  email TEXT DEFAULT 'contact@maxinstitute.edu.in',
  address TEXT NOT NULL DEFAULT '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  opening_time TEXT NOT NULL DEFAULT '09:00 AM',
  closing_time TEXT NOT NULL DEFAULT '06:00 PM',
  google_rating NUMERIC(2,1) DEFAULT 4.9,
  total_google_reviews INTEGER DEFAULT 110,
  google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Azhagiyamandapam+Tamil+Nadu',
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
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Institute', -- 'Institute', 'Classroom', 'Students', 'Activities', 'Events'
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Site Settings Policies: Anyone can view, only authenticated users can update
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update site settings" ON public.site_settings FOR ALL TO authenticated USING (true);

-- 2. Courses Policies: Public can read active courses; authenticated users have full access
CREATE POLICY "Public can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins have full access to courses" ON public.courses FOR ALL TO authenticated USING (true);

-- 3. Faculty Policies: Public can view active faculty; authenticated users have full access
CREATE POLICY "Public can view active faculty" ON public.faculty FOR SELECT USING (is_active = true);
CREATE POLICY "Admins have full access to faculty" ON public.faculty FOR ALL TO authenticated USING (true);

-- 4. Gallery Policies: Public can view gallery; authenticated users have full access
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admins have full access to gallery" ON public.gallery FOR ALL TO authenticated USING (true);

-- 5. Reviews Policies: Public can view reviews; public can submit; authenticated users have full access
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full access to reviews" ON public.reviews FOR ALL TO authenticated USING (true);

-- 6. Enquiries Policies: Anyone can submit an enquiry; only authenticated users can read/modify
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view enquiries" ON public.enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Only admins can delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (true);

-- 7. FAQ Policies: Public can view active FAQ; authenticated users have full access
CREATE POLICY "Public can view active faq" ON public.faq FOR SELECT USING (is_active = true);
CREATE POLICY "Admins have full access to faq" ON public.faq FOR ALL TO authenticated USING (true);

-- 8. Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION
-- ==============================================================================
-- Note: Create buckets named 'gallery', 'courses', 'faculty' in Supabase Storage UI
-- or run storage policy definitions:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('faculty', 'faculty', true) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- VERIFIED SEED DATA
-- ==============================================================================

-- Site Settings Seed
INSERT INTO public.site_settings (institute_name, tagline, phone, email, address, opening_time, closing_time, google_rating, total_google_reviews)
VALUES (
  'MAX Educational Institution',
  'Empowering Students With Skills for Tomorrow',
  '063809 27568',
  'contact@maxinstitute.edu.in',
  '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  '09:00 AM',
  '06:00 PM',
  4.9,
  110
) ON CONFLICT DO NOTHING;

-- Courses Seed
INSERT INTO public.courses (title, slug, short_description, description, category, duration, level, icon, display_order)
VALUES
  ('Basic Computer Training', 'basic-computer-training', 'Foundational computer literacy covering OS basics, file management, internet operations, and email communication.', 'Designed for beginners to build confidence with computers from the ground up.', 'Computer Courses', '1 - 2 Months', 'Beginner', 'Monitor', 1),
  ('MS Office Suite Mastery', 'ms-office-suite', 'Comprehensive training in Word, Excel, PowerPoint, and Outlook for business and academic documentation.', 'Master word processing, complex spreadsheet calculations, presentation design, and administrative tools.', 'Computer Courses', '2 Months', 'Beginner to Intermediate', 'BookOpen', 2),
  ('Computer Applications (DCA)', 'computer-applications-dca', 'Diploma program covering desktop applications, operating systems, database basics, and digital office management.', 'A complete professional program designed to qualify students for high-demand office and clerical jobs.', 'Computer Courses', '3 - 6 Months', 'Intermediate', 'GraduationCap', 3),
  ('Programming Fundamentals', 'programming-fundamentals', 'Introduction to programming concepts, logic building, algorithmic problem solving, and modern coding practices.', 'Learn core logic structures, variables, control flow, loops, and introductory coding principles.', 'Computer Courses', '3 Months', 'Intermediate', 'Keyboard', 4),
  ('English Typing (Junior & Senior)', 'english-typing', 'Structured touch typing techniques designed to build precision, rhythm, and industry-standard word-per-minute speed.', 'Systematic keyboarding drills, finger positioning, speed calculation, and certification preparation.', 'Typing Courses', '3 - 6 Months', 'All Levels', 'Keyboard', 5),
  ('Tamil Typing (Junior & Senior)', 'tamil-typing', 'Specialized Tamil typewriter & computer keyboard layout training with speed acceleration techniques.', 'Master Tamil font typing layouts (Bamini / Tamil 99) with speed drills and government exam preparation.', 'Typing Courses', '3 - 6 Months', 'All Levels', 'Keyboard', 6),
  ('Speed Development Lab', 'speed-development', 'Targeted speed and accuracy development sessions for competitive examination and typist test aspirants.', 'Rigorous timed tests, error-correction analysis, and individual speed mentoring.', 'Typing Courses', '1 - 2 Months', 'Advanced', 'Award', 7),
  ('Technical Fundamentals', 'technical-fundamentals', 'Hands-on training in computer hardware components, software installation, troubleshooting, and networking basics.', 'Practical laboratory work covering PC assembly, system troubleshooting, drivers, and safe maintenance.', 'Technical Courses', '2 - 3 Months', 'Intermediate', 'Settings', 8),
  ('Practical Office Computing', 'practical-office-computing', 'Real-world workplace workflow training covering billing software, accounting spreadsheets, and documentation.', 'Bridge the gap between theoretical knowledge and corporate job requirements.', 'Technical Courses', '2 Months', 'All Levels', 'Users', 9)
ON CONFLICT (slug) DO NOTHING;

-- Faculty Seed
INSERT INTO public.faculty (name, designation, specialization, experience, description, display_order)
VALUES
  ('Senior Faculty & Instructor', 'Lead Technical Instructor', 'Computer Applications & Office Systems', '8+ Years', 'Dedicated instructor with extensive experience in practical computer coaching and corporate office tools training.', 1),
  ('Typing & Keyboarding Specialist', 'Head of Typing Division', 'English & Tamil Touch Typing (Jr / Sr)', '10+ Years', 'Expert in government typing syllabus, precision finger positioning, and high-speed certification preparation.', 2),
  ('Systems & Technical Mentor', 'Technical Hardware & Software Guide', 'Hardware Troubleshooting & Basic Networking', '6+ Years', 'Guides students through hands-on technical labs, PC maintenance, and operating system configurations.', 3)
ON CONFLICT DO NOTHING;

-- Reviews Seed (Verified Google Reviews)
INSERT INTO public.reviews (student_name, review, rating, source, is_featured)
VALUES
  ('Keerthana Keerthi', 'Excellent institution with highly experienced and supportive faculty. It provides a structured learning environment with knowledgeable teachers.', 5, 'Google Review', true),
  ('Jenisha', 'Excellent institution. The Institute provides a structured learning environment with knowledgeable teachers.', 5, 'Google Review', true),
  ('Haneesha Haneesha', 'Very good teaching staffs and Institute management also very good.', 5, 'Google Review', true),
  ('Karthik T.S.', 'Good teachings and well trained staffs.', 5, 'Google Review', true),
  ('S. Anand', 'One of the best coaching centres in Azhagiyamandapam. Flexible batch timings and individual focus.', 5, 'Google Review', true)
ON CONFLICT DO NOTHING;

-- FAQ Seed
INSERT INTO public.faq (question, answer, category, display_order)
VALUES
  ('What courses are available at MAX Educational Institution?', 'MAX offers comprehensive Computer Courses (Basic Computer, MS Office, DCA, Programming), Typing Courses (English and Tamil Typing, Speed Development), and Technical Fundamentals. You can view full curriculum details on our Courses page.', 'Courses', 1),
  ('Where is MAX Educational Institution located?', 'MAX is located on the 1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167.', 'General', 2),
  ('How can I enquire or apply for a course?', 'You can fill out the online enquiry form on our website or call us directly at 063809 27568 during operational hours (open until 6:00 PM).', 'Admissions', 3),
  ('Can I visit the institute before enrolling?', 'Yes, visitors and prospective students are welcome to visit our facility during working hours to meet our faculty, explore our computer labs, and discuss batch schedules.', 'General', 4),
  ('Are batch timings flexible for students and working professionals?', 'Yes, MAX provides flexible morning, afternoon, and evening batches to comfortably accommodate school/college students as well as working individuals.', 'Courses', 5)
ON CONFLICT DO NOTHING;

-- Initial Gallery Seed
INSERT INTO public.gallery (title, description, image_url, category, display_order, is_featured)
VALUES
  ('Computer Training Lab', 'Equipped workstation setups for hands-on computer practice and individual attention.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', 'Classroom', 1, true),
  ('Typing & Keyboarding Department', 'Dedicated typing lab for English and Tamil typing speed development.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 'Institute', 2, true),
  ('Practical Guidance Session', 'Faculty providing one-on-one mentorship during practical exercises.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80', 'Students', 3, true),
  ('Structured Learning Environment', 'Peaceful, focused classroom setting designed for optimal concentration.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', 'Classroom', 4, true),
  ('Student Certification & Recognition', 'Recognizing student achievements in typing and computer proficiency.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', 'Events', 5, true),
  ('Campus & Main Entrance', 'Located conveniently at Azhagiyamandapam junction on the Trivandrum–Nagercoil Highway.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', 'Institute', 6, true)
ON CONFLICT DO NOTHING;
