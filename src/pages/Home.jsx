import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Monitor, 
  Users, 
  Award, 
  Clock, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Send,
  Phone,
  MapPin,
  Sparkles,
  Layers,
  TrendingUp
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import CourseCard from '../components/CourseCard';
import FacultyCard from '../components/FacultyCard';
import ReviewCard from '../components/ReviewCard';
import GalleryCard from '../components/GalleryCard';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';

export default function Home({ settings }) {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [faq, setFaq] = useState([]);
  
  // Interactive States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(null);
  
  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    course_name: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    async function loadData() {
      const [coursesData, facultyData, reviewsData, galleryData, faqData] = await Promise.all([
        dataService.getCourses(),
        dataService.getFaculty(),
        dataService.getReviews(),
        dataService.getGallery(),
        dataService.getFAQ()
      ]);
      setCourses(coursesData.filter(c => c.is_active));
      setFaculty(facultyData.filter(f => f.is_active));
      setReviews(reviewsData.filter(r => r.is_featured));
      const featuredGallery = galleryData.filter(g => g.is_featured);
      setGallery(featuredGallery.length > 0 ? featuredGallery : galleryData);
      setFaq(faqData.filter(q => q.is_active));
    }
    loadData();
  }, []);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.phone) {
      showToast('Please provide your name and phone number.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await dataService.createEnquiry(enquiryForm);
      showToast('Thank you! Your enquiry has been received. Our team will contact you shortly.', 'success');
      setEnquiryForm({
        name: '',
        phone: '',
        email: '',
        course_name: '',
        message: ''
      });
    } catch (err) {
      showToast('Failed to submit enquiry. Please call us directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnquireCourse = (course) => {
    setEnquiryForm(prev => ({
      ...prev,
      course_name: course.title,
      message: `I would like to enquire about ${course.title} batch timings and fees.`
    }));
    // Scroll to contact form
    const el = document.getElementById('enquiry-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const whyChoosePoints = [
    {
      title: 'Experienced Faculty',
      desc: 'Expert mentors dedicated to individual student attention and rigorous practical skill building.',
      icon: Users
    },
    {
      title: 'Structured Learning',
      desc: 'Step-by-step curriculum starting from foundational concepts to advanced workplace applications.',
      icon: Layers
    },
    {
      title: 'Practical Training',
      desc: 'Dedicated computer workstations and typing equipment ensuring 100% hands-on laboratory time.',
      icon: Monitor
    },
    {
      title: 'Student Support',
      desc: 'Patient, personalized doubt clearance, flexible batch schedules, and exam preparation.',
      icon: BookOpen
    },
    {
      title: 'Career Orientation',
      desc: 'Curriculum structured specifically to meet the expectations of private firms and government examinations.',
      icon: TrendingUp
    },
    {
      title: 'Supportive Environment',
      desc: 'Peaceful, disciplined, and welcoming institution atmosphere encouraging consistent academic growth.',
      icon: Award
    }
  ];

  const learningSteps = [
    {
      step: '01',
      title: 'Learn',
      desc: 'Understand foundational concepts with clear demonstrations and guided theory from senior faculty.'
    },
    {
      step: '02',
      title: 'Practice',
      desc: 'Work directly on individual computer terminals, typing exercises, and software applications.'
    },
    {
      step: '03',
      title: 'Improve',
      desc: 'Receive immediate instructor feedback to eliminate errors, refine speed, and enhance accuracy.'
    },
    {
      step: '04',
      title: 'Grow',
      desc: 'Acquire verified proficiency, practical confidence, and recognized certification for your future.'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-brand-bg pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-brand-border/60">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#123b5d0a_1px,transparent_1px),linear-gradient(to_bottom,#123b5d0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-brand-primary border border-blue-200/60 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
                <GraduationCap className="w-4 h-4 text-brand-secondary" />
                <span>MAX Educational Institution • Azhagiyamandapam</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-primary tracking-tight leading-[1.12] mb-6">
                Empowering Students With <span className="text-brand-secondary">Skills for Tomorrow</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-brand-muted leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                MAX Educational Institution provides structured learning, hands-on computer training, precision touch typing (English & Tamil), and career-focused coaching in a supportive environment.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-10">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full sm:w-auto px-7"
                  >
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-7"
                  >
                    Contact MAX
                  </Button>
                </Link>
              </div>

              {/* Verified Google Rating Highlight */}
              <div className="inline-flex items-center gap-3.5 py-2.5 px-4 rounded-xl bg-white border border-brand-border shadow-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-accent text-brand-accent" />
                  ))}
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <div className="text-xs text-brand-text font-semibold">
                  <span className="font-bold text-brand-primary">4.9 / 5.0</span> on Google Reviews{' '}
                  <span className="text-brand-muted font-normal">({settings?.total_google_reviews || 110}+ verified reviews)</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-slate-100 relative">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80"
                    alt="Computer Education at MAX"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
                      Hands-On Learning
                    </p>
                    <p className="text-sm font-bold">
                      Individual Computer Terminals & Dedicated Typing Labs
                    </p>
                  </div>
                </div>

                {/* Floating Info Card 1: Experienced Faculty */}
                <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white p-4 rounded-2xl shadow-xl border border-brand-border/80 flex items-center gap-3.5 max-w-[220px] animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-secondary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-primary">Experienced Faculty</h4>
                    <p className="text-[11px] text-brand-muted">Individual Mentorship</p>
                  </div>
                </div>

                {/* Floating Info Card 2: Practical Training */}
                <div className="absolute -top-6 -right-4 sm:-right-6 bg-white p-4 rounded-2xl shadow-xl border border-brand-border/80 flex items-center gap-3.5 max-w-[220px] animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-accent flex items-center justify-center shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-primary">Practical Training</h4>
                    <p className="text-[11px] text-brand-muted">Lab-First Approach</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE MAX */}
      <section className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Why Choose Us"
            title="Why Students Choose MAX"
            subtitle="We provide a structured learning ecosystem built on discipline, hands-on practice, and supportive guidance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChoosePoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-7 rounded-2xl bg-brand-bg/50 border border-brand-border/80 hover:border-brand-secondary/40 hover:bg-white hover:shadow-premium transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 flex items-center justify-center mb-5 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-primary mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. COURSES SECTION */}
      <section className="py-20 bg-brand-bg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                Curriculum Programs
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-primary tracking-tight">
                Featured Courses
              </h2>
            </div>
            <Link to="/courses" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-secondary hover:text-brand-primary transition-colors">
              <span>View All Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.slice(0, 6).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={(c) => setSelectedCourse(c)}
                onEnquire={handleEnquireCourse}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button variant="outline" size="md" icon={ArrowRight} iconPosition="right">
                Explore Complete Course Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. LEARNING PROCESS SECTION */}
      <section className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Our Approach"
            title="A Systematic 4-Step Learning Journey"
            subtitle="How we guide every student from fundamental concepts to certified practical mastery."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {learningSteps.map((step, idx) => (
              <div key={idx} className="relative bg-brand-bg rounded-2xl p-6 border border-brand-border">
                <div className="text-4xl font-extrabold text-brand-secondary/20 mb-3 font-mono">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-brand-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FACULTY PREVIEW */}
      <section className="py-20 bg-brand-bg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                Faculty Mentors
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-primary tracking-tight">
                Learn from Experienced Instructors
              </h2>
            </div>
            <Link to="/faculty" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-secondary hover:text-brand-primary transition-colors">
              <span>Meet Full Faculty</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faculty.slice(0, 3).map((item) => (
              <FacultyCard key={item.id} faculty={item} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. GALLERY PREVIEW */}
      <section className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                Institute Life
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-primary tracking-tight">
                Our Learning Spaces & Activities
              </h2>
            </div>
            <Link to="/gallery" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-secondary hover:text-brand-primary transition-colors">
              <span>View Complete Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.slice(0, 3).map((item) => (
              <GalleryCard key={item.id} item={item} onOpen={(img) => setSelectedImage(img)} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. STUDENT REVIEWS */}
      <section className="py-20 bg-brand-bg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Verified Testimonials"
            title="What Our Students Say"
            subtitle="Authentic Google reviews from students who completed computer and typing training at MAX."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/reviews">
              <Button variant="outline" size="md" icon={ArrowRight} iconPosition="right">
                Read All Student Reviews & Submit Feedback
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="py-20 bg-white border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Clear Answers"
            title="Frequently Asked Questions"
            subtitle="Common questions regarding our computer courses, typing training, and admissions."
          />

          <div className="space-y-4">
            {faq.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-brand-border bg-brand-bg/40 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-brand-primary hover:text-brand-secondary transition-colors focus:outline-none"
                  >
                    <span className="text-base sm:text-lg">{item.question}</span>
                    <span className="w-7 h-7 rounded-full bg-white border border-brand-border flex items-center justify-center shrink-0 text-brand-primary font-bold">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-brand-muted leading-relaxed border-t border-brand-border/40 animate-fade-in">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm font-semibold text-brand-secondary hover:text-brand-primary inline-flex items-center gap-1.5">
              <span>Have more questions? View full FAQ page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. CONTACT & ENQUIRY SECTION */}
      <section id="enquiry-section" className="py-20 bg-gradient-to-b from-brand-bg to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Contact Info */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                Admissions & Enquiries
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-primary tracking-tight mb-4">
                Start Your Learning Journey
              </h2>
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-8">
                Have questions regarding batch timings, course syllabus, or admission details? Send us an enquiry or visit our institution directly.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-brand-border shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary mb-1">Campus Location</h4>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      {settings?.address || '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-brand-border shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary mb-0.5">Phone Number</h4>
                    <a
                      href={`tel:${(settings?.phone || '063809 27568').replace(/\s+/g, '')}`}
                      className="text-sm font-bold text-brand-secondary hover:underline"
                    >
                      {settings?.phone || '063809 27568'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-brand-border shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary mb-0.5">Working Hours</h4>
                    <p className="text-xs sm:text-sm text-brand-muted">
                      Monday to Saturday • Open until {settings?.closing_time || '06:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Enquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-premium">
                <h3 className="text-xl font-bold text-brand-primary mb-2">
                  Send an Online Enquiry
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted mb-6">
                  Fill out the form below. We will reply promptly with course schedules and fees.
                </p>

                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={enquiryForm.name}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                        placeholder="e.g. Arun Kumar"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        placeholder="e.g. 098765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        placeholder="e.g. arun@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                        Interested Program
                      </label>
                      <select
                        value={enquiryForm.course_name}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, course_name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="">Select a Course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                      Message / Question
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="Ask about batch timings, fees, or certifications..."
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submitting}
                    icon={Send}
                    iconPosition="right"
                    className="w-full sm:w-auto px-8"
                  >
                    Submit Enquiry
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Course Details Modal */}
      <Modal
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title || 'Course Details'}
      >
        {selectedCourse && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-brand-primary border border-blue-100">
                {selectedCourse.category}
              </span>
              <span className="text-xs font-medium text-brand-muted">
                Duration: {selectedCourse.duration}
              </span>
              <span className="text-xs font-medium text-brand-accent">
                Level: {selectedCourse.level}
              </span>
            </div>

            <p className="text-sm text-brand-text leading-relaxed">
              {selectedCourse.description || selectedCourse.short_description}
            </p>

            <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-2">
                What You Will Achieve
              </h4>
              <ul className="text-xs text-brand-muted space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Hands-on practical training on dedicated computers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Individual guidance from experienced instructors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Exam simulation and course completion certificate
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const c = selectedCourse;
                  setSelectedCourse(null);
                  handleEnquireCourse(c);
                }}
              >
                Enquire for this Course
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Gallery Lightbox Modal */}
      <Modal
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.title || 'Institute Gallery'}
        maxWidth="max-w-3xl"
      >
        {selectedImage && (
          <div>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full max-h-[65vh] object-contain rounded-xl bg-black/5 mb-4"
            />
            <p className="text-sm text-brand-text">{selectedImage.description}</p>
          </div>
        )}
      </Modal>

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
