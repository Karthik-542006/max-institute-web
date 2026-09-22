import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Monitor, 
  Users, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  HeartHandshake
} from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';

export default function About({ settings }) {
  const pillars = [
    {
      title: 'Experienced Faculty',
      desc: 'Our instructors bring years of dedicated teaching experience in computer applications and state-certified typing methodologies, offering patient guidance to students at every stage.',
      icon: Users
    },
    {
      title: 'Structured Learning',
      desc: 'Curriculum designed with step-by-step progressions, moving from keyboarding ergonomics and computer basics to advanced document processing and office administration.',
      icon: Layers
    },
    {
      title: 'Practical Training',
      desc: 'We emphasize lab-first education where each enrolled student is assigned an individual workstation for maximum screen time and uninterrupted practice.',
      icon: Monitor
    },
    {
      title: 'Student Support',
      desc: 'From doubt clearance to personalized speed improvement mentoring, our instructors provide individual attention tailored to each learner’s pace.',
      icon: HeartHandshake
    },
    {
      title: 'Career Orientation',
      desc: 'All programs are aligned with industry requirements for clerical, data management, and technical office roles, as well as competitive government typing certifications.',
      icon: Award
    },
    {
      title: 'Supportive Environment',
      desc: 'A calm, focused, and disciplined academic setting that fosters concentration, confidence, and mutual respect among peers and faculty.',
      icon: ShieldCheck
    }
  ];

  const methodology = [
    {
      number: '01',
      title: 'Learn the Concept',
      desc: 'Master fundamental principles through instructor-led live demonstrations and comprehensive course notes.'
    },
    {
      number: '02',
      title: 'Hands-on Practice',
      desc: 'Apply what you learn immediately on dedicated computer terminals with supervised practical exercises.'
    },
    {
      number: '03',
      title: 'Feedback & Improvement',
      desc: 'Regular evaluation of typing speed, accuracy metrics, and software assignments to identify and correct weak areas.'
    },
    {
      number: '04',
      title: 'Confidence & Growth',
      desc: 'Achieve proven proficiency, official course certification, and job-ready skills for your academic and career goals.'
    }
  ];

  return (
    <div className="flex flex-col py-12">
      {/* Page Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-brand-accent" />
            <span>About MAX</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            About MAX Educational Institution
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            A trusted centre for computer education, touch typing mastery, and practical technical coaching in Azhagiyamandapam, Tamil Nadu.
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-brand-border">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80"
                  alt="Students learning at MAX Educational Institution"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                Our Commitment
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
                Practical Education Designed for Real-World Competence
              </h2>
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
                Established with the goal of providing high-quality, accessible computer literacy and typing coaching, MAX Educational Institution stands as a reputable beacon of skills development in Azhagiyamandapam.
              </p>
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
                We believe true digital literacy comes through rigorous hands-on practice. Rather than passive lectures, every session at MAX immerses students in practical workflows, ensuring each learner acquires muscle memory in typing and concrete troubleshooting capabilities in software.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-4 text-xs font-bold text-brand-primary">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-bg border border-brand-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Individual Workstations
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-bg border border-brand-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Flexible Batch Schedules
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-bg border border-brand-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Certified Instructors
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-bg border border-brand-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Exam-Focused Coaching
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Pillars */}
          <SectionTitle
            badge="Core Strengths"
            title="The Six Pillars of MAX"
            subtitle="The foundational values ensuring student excellence and trustworthy training."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-2xl bg-brand-bg/60 border border-brand-border hover:border-brand-secondary/40 hover:bg-white hover:shadow-premium transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center mb-5 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-primary mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Methodology: Learn, Practice, Improve, Grow */}
          <div className="bg-brand-primary text-white rounded-3xl p-8 sm:p-12">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                Systematic Methodology
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Our Structured 4-Phase Learning Framework
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {methodology.map((m, idx) => (
                <div key={idx} className="bg-white/10 p-6 rounded-2xl border border-white/10">
                  <div className="text-3xl font-mono font-bold text-brand-accent mb-3">
                    {m.number}
                  </div>
                  <h4 className="text-base font-bold mb-2">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Campus Location & Visit Callout */}
      <section className="py-16 bg-brand-bg border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-brand-primary mb-3">
            Visit Our Center in Azhagiyamandapam
          </h3>
          <p className="text-sm text-brand-muted mb-8 leading-relaxed max-w-xl mx-auto">
            Conveniently located on the 1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam. Open until 6:00 PM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Plan a Visit or Send Enquiry
              </Button>
            </Link>
            <a href={`tel:${(settings?.phone || '063809 27568').replace(/\s+/g, '')}`}>
              <Button variant="outline" size="md">
                Call {settings?.phone || '063809 27568'}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
