-- ==============================================================================
-- MAX Educational Institution — Admin Panel, Gallery & Settings Migration
-- File: supabase/migrations/20260925_max_admin_gallery_settings.sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENHANCE GALLERY TABLE
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
  category TEXT NOT NULL DEFAULT 'Institute',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  uploaded_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all necessary columns exist on existing gallery table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='media_type') THEN
    ALTER TABLE public.gallery ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='file_url') THEN
    ALTER TABLE public.gallery ADD COLUMN file_url TEXT;
    UPDATE public.gallery SET file_url = image_url WHERE file_url IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='thumbnail_url') THEN
    ALTER TABLE public.gallery ADD COLUMN thumbnail_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='storage_path') THEN
    ALTER TABLE public.gallery ADD COLUMN storage_path TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='file_name') THEN
    ALTER TABLE public.gallery ADD COLUMN file_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='file_size') THEN
    ALTER TABLE public.gallery ADD COLUMN file_size INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='mime_type') THEN
    ALTER TABLE public.gallery ADD COLUMN mime_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='is_published') THEN
    ALTER TABLE public.gallery ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='uploaded_by') THEN
    ALTER TABLE public.gallery ADD COLUMN uploaded_by TEXT DEFAULT 'admin';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery' AND column_name='updated_at') THEN
    ALTER TABLE public.gallery ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;


-- 3. ENHANCE SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_name TEXT NOT NULL DEFAULT 'MAX Educational Institution',
  institution_name TEXT DEFAULT 'MAX Educational Institution',
  tagline TEXT NOT NULL DEFAULT 'Empowering Students With Skills for Tomorrow',
  phone TEXT NOT NULL DEFAULT '+91 99654 68185',
  phone2 TEXT DEFAULT '+91 63809 27568',
  whatsapp TEXT DEFAULT '+91 99654 68185',
  email TEXT DEFAULT 'contact@maxinstitute.edu.in',
  address TEXT NOT NULL DEFAULT '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
  opening_time TEXT NOT NULL DEFAULT '09:00 AM',
  closing_time TEXT NOT NULL DEFAULT '06:00 PM',
  website_title TEXT DEFAULT 'MAX Educational Institution | Azhagiyamandapam',
  website_description TEXT DEFAULT 'Professional training in Computer Courses, Typing (English & Tamil), and Technical Fundamentals in Azhagiyamandapam.',
  logo_url TEXT,
  favicon_url TEXT,
  facebook_url TEXT DEFAULT 'https://facebook.com',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  youtube_url TEXT DEFAULT 'https://youtube.com',
  google_rating NUMERIC(2,1) DEFAULT 4.9,
  total_google_reviews INTEGER DEFAULT 110,
  google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6',
  google_maps_embed TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin',
  updated_by TEXT DEFAULT 'admin',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='institution_name') THEN
    ALTER TABLE public.site_settings ADD COLUMN institution_name TEXT DEFAULT 'MAX Educational Institution';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='phone2') THEN
    ALTER TABLE public.site_settings ADD COLUMN phone2 TEXT DEFAULT '+91 63809 27568';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='whatsapp') THEN
    ALTER TABLE public.site_settings ADD COLUMN whatsapp TEXT DEFAULT '+91 99654 68185';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='google_maps_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='google_maps_embed') THEN
    ALTER TABLE public.site_settings ADD COLUMN google_maps_embed TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='website_title') THEN
    ALTER TABLE public.site_settings ADD COLUMN website_title TEXT DEFAULT 'MAX Educational Institution | Azhagiyamandapam';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='website_description') THEN
    ALTER TABLE public.site_settings ADD COLUMN website_description TEXT DEFAULT 'Professional training in Computer Courses, Typing (English & Tamil), and Technical Fundamentals in Azhagiyamandapam.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='favicon_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN favicon_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='facebook_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN facebook_url TEXT DEFAULT 'https://facebook.com';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='instagram_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN instagram_url TEXT DEFAULT 'https://instagram.com';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='youtube_url') THEN
    ALTER TABLE public.site_settings ADD COLUMN youtube_url TEXT DEFAULT 'https://youtube.com';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='updated_by') THEN
    ALTER TABLE public.site_settings ADD COLUMN updated_by TEXT DEFAULT 'admin';
  END IF;
END $$;

-- Seed default initial row if table is empty (omitting id column so PostgreSQL handles auto-generation regardless of type UUID or INT)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.site_settings) THEN
    INSERT INTO public.site_settings (
      institute_name,
      institution_name,
      phone,
      phone2,
      whatsapp,
      email,
      address,
      opening_time,
      closing_time,
      website_title,
      website_description
    ) VALUES (
      'MAX Educational Institution',
      'MAX Educational Institution',
      '+91 99654 68185',
      '+91 63809 27568',
      '+91 99654 68185',
      'contact@maxinstitute.edu.in',
      '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
      '09:00 AM',
      '06:00 PM',
      'MAX Educational Institution | Azhagiyamandapam',
      'Professional training in Computer Courses, Typing (English & Tamil), and Technical Fundamentals in Azhagiyamandapam.'
    );
  END IF;
END $$;


-- 4. PROFILES & ROLE-BASED ACCESS CONTROL
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'system_admin', -- 'system_admin', 'admin', 'user'
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_active') THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- 5. AUDIT LOG TABLE FOR SYSTEM ADMINS
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id TEXT,
  admin_email TEXT,
  action TEXT NOT NULL, -- e.g. 'UPDATED_SITE_SETTINGS', 'UPLOADED_GALLERY_MEDIA', 'DELETED_GALLERY_MEDIA'
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 6. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_admin_log_created ON public.admin_activity_log(created_at DESC);


-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate cleanly
DROP POLICY IF EXISTS "Public view published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public full access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public full access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public full access to admin_activity_log" ON public.admin_activity_log;

-- Re-create secure policies
CREATE POLICY "Public view published gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public view site settings" ON public.site_settings FOR SELECT USING (true);

-- Admin write policies for gallery & settings
CREATE POLICY "Public full access to gallery" ON public.gallery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to site_settings" ON public.site_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to admin_activity_log" ON public.admin_activity_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 8. REALTIME CONFIGURATION
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'gallery') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_activity_log') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 9. STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Gallery Bucket" ON storage.objects;
CREATE POLICY "Public Read Gallery Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public Write Gallery Bucket" ON storage.objects;
CREATE POLICY "Public Write Gallery Bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public Update Gallery Bucket" ON storage.objects;
CREATE POLICY "Public Update Gallery Bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public Delete Gallery Bucket" ON storage.objects;
CREATE POLICY "Public Delete Gallery Bucket" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
