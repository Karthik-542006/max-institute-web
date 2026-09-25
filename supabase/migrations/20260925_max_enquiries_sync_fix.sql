-- ==============================================================================
-- MAX Educational Institution — Enquiries Persistence, Synchronization & Security Fix
-- File: supabase/migrations/20260925_max_enquiries_sync_fix.sql
-- ==============================================================================

-- 1. Ensure UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE OR REPAIR ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course_name TEXT,
  subject TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure all columns exist on pre-existing enquiries table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='subject') THEN
    ALTER TABLE public.enquiries ADD COLUMN subject TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='admin_notes') THEN
    ALTER TABLE public.enquiries ADD COLUMN admin_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='updated_at') THEN
    ALTER TABLE public.enquiries ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='notes') THEN
    ALTER TABLE public.enquiries ADD COLUMN notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='course_name') THEN
    ALTER TABLE public.enquiries ADD COLUMN course_name TEXT;
  END IF;
END $$;

-- 4. Sync subject <-> course_name and notes <-> admin_notes for existing rows
UPDATE public.enquiries SET subject = course_name WHERE subject IS NULL AND course_name IS NOT NULL;
UPDATE public.enquiries SET course_name = subject WHERE course_name IS NULL AND subject IS NOT NULL;
UPDATE public.enquiries SET admin_notes = notes WHERE admin_notes IS NULL AND notes IS NOT NULL;
UPDATE public.enquiries SET notes = admin_notes WHERE notes IS NULL AND admin_notes IS NOT NULL;

-- 5. RELAX & MODERNIZE STATUS CHECK CONSTRAINT
-- Allows all standard institutional workflow statuses (case-insensitive):
-- 'new', 'read', 'contacted', 'in progress', 'resolved', 'closed', 'archived'
DO $$
BEGIN
  ALTER TABLE public.enquiries DROP CONSTRAINT IF EXISTS enquiries_status_check;
  ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_status_check 
    CHECK (lower(status) IN ('new', 'read', 'contacted', 'in progress', 'resolved', 'closed', 'archived'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 6. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_enquiry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_enquiry_updated_at ON public.enquiries;
CREATE TRIGGER trigger_set_enquiry_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_enquiry_updated_at();

-- 7. HIGH-PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.enquiries(phone);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Drop previous policies cleanly
DROP POLICY IF EXISTS "Public full access to enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin select enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin delete enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow public insert" ON public.enquiries;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.enquiries;
DROP POLICY IF EXISTS "Admin portal management access" ON public.enquiries;

-- Policy 1: Any public visitor can INSERT an enquiry (via Contact page or Homepage form)
CREATE POLICY "Public insert enquiries" ON public.enquiries 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

-- Policy 2: Allow authenticated administrators to read all enquiries
CREATE POLICY "Admin select enquiries" ON public.enquiries 
  FOR SELECT TO authenticated 
  USING (true);

-- Policy 3: Allow authenticated administrators to update enquiries (status, admin notes)
CREATE POLICY "Admin update enquiries" ON public.enquiries 
  FOR UPDATE TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Policy 4: Allow authenticated administrators to delete enquiries
CREATE POLICY "Admin delete enquiries" ON public.enquiries 
  FOR DELETE TO authenticated 
  USING (true);

-- Policy 5: Portal management access
CREATE POLICY "Admin portal management access" ON public.enquiries
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 9. REALTIME PUBLICATION
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'enquiries') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
