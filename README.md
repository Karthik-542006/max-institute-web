# MAX Educational Institution — Full-Stack Web Platform

> A modern full-stack web application and administrative management suite for **MAX Educational Institution**, Azhagiyamandapam, Mulagamooddu, Tamil Nadu.

---

## Verified Institution Information

- **Institute Name**: MAX Educational Institution
- **Campus Address**: 1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167
- **Phone**: 063809 27568
- **Operational Hours**: Monday to Saturday, open until 06:00 PM
- **Google Reviews Profile**: Rated **4.9 / 5.0** based on 110+ verified student reviews

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS (Brand palette tokens) |
| **Typography** | Plus Jakarta Sans & Inter |
| **Icons** | Lucide React (pure transparent SVG icons — **zero emojis**) |
| **Backend & DB** | Supabase PostgreSQL + Row Level Security (RLS) |
| **Auth** | Supabase Auth + Protected Admin Routes |
| **Data Layer** | Resilient Dual-Mode (Supabase + local fallback storage) |
| **Deployment** | Vercel / Netlify / Firebase |

---

## Design System

The visual design follows the palette and strict guidelines specified in the build plan:

- **Primary**: `#123B5D`
- **Secondary**: `#1D6A8A`
- **Accent**: `#E5A83B`
- **Background**: `#F7F9FB`
- **Surface**: `#FFFFFF`
- **Text**: `#17212B`
- **Muted**: `#687582`
- **Border**: `#E4E9EE`

**Design Rule**: No random emojis (🎓, 📞, 📍, ⭐) are used. Pure SVG icons from `lucide-react` provide crisp, transparent, and consistent rendering across all resolutions.

---

## Application Structure

### 1. Public Institutional Website
- **Home (`/`)**: Hero section, Why MAX highlights, Featured Courses, 4-step Learning Journey (Learn, Practice, Improve, Grow), Faculty Mentors preview, Campus Gallery, Verified Google Reviews showcase, FAQ accordion, and interactive Admission Enquiry form.
- **About (`/about`)**: Institutional history, 6 core pillars, 4-phase methodology, lab infrastructure, and Azhagiyamandapam location details.
- **Courses (`/courses`)**: Dynamic course catalogue filterable by category (*Computer Courses*, *Typing Courses*, *Technical Courses*), search filter, and course syllabus modal.
- **Faculty (`/faculty`)**: Faculty directory with instructor specializations, qualifications, and experience.
- **Gallery (`/gallery`)**: Masonry photo gallery with category filter (*Institute*, *Classroom*, *Students*, *Activities*, *Events*) and lightbox preview.
- **Reviews (`/reviews`)**: Verified Google student reviews and interactive student review submission form.
- **FAQ (`/faq`)**: Searchable FAQ accordion organized by category.
- **Contact (`/contact`)**: Official address, phone `063809 27568`, interactive enquiry form, and embedded Google Maps.

### 2. Protected Administrative Dashboard
- **Admin Login (`/admin/login`)**: Secure Supabase Auth with convenient 1-click Demo Admin option for instant offline testing.
- **Dashboard Overview (`/admin`)**: Metric counters (Total Courses, Faculty, Gallery Images, New Enquiries), quick action shortcuts, and recent enquiry pipeline.
- **Course Management (`/admin/courses`)**: Add, edit, delete, and toggle active status for courses with Lucide icon selector, duration, and level.
- **Faculty Management (`/admin/faculty`)**: Add, edit, delete, and manage instructor profiles, photos, and credentials.
- **Gallery Management (`/admin/gallery`)**: Upload campus photos, set category tags, and toggle homepage featured status.
- **Review Moderation (`/admin/reviews`)**: Moderate student testimonials and configure star ratings.
- **Enquiry Pipeline (`/admin/enquiries`)**: View student enquiries with status management (`New` → `Contacted` → `In Progress` → `Closed`).
- **FAQ Management (`/admin/faq`)**: Maintain frequently asked questions and answers.
- **Site Settings (`/admin/settings`)**: Live configuration of institute name, phone, address, timings, and map embeds without touching code.

---

## Supabase Database Setup

To link your live Supabase database:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the entire contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**.
4. In Supabase Project Settings > API, copy your **Project URL** and **Anon Public Key**.
5. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Storage Buckets (Optional)
In Supabase Storage, create public buckets named `gallery`, `courses`, and `faculty`.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
# max-institute-web
