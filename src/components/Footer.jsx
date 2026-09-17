import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function Footer({ settings }) {
  const phone = settings?.phone || '063809 27568';
  const email = settings?.email || 'contact@maxinstitute.edu.in';
  const address = settings?.address || '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Near Nagercoil Bus Stop, Junction, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167';
  const closingTime = settings?.closing_time || '06:00 PM';
  const rating = settings?.google_rating || 4.9;
  const reviewCount = settings?.total_google_reviews || 110;

  return (
    <footer className="bg-brand-primary text-slate-300 pt-16 pb-12 border-t border-brand-primary/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-4 group inline-flex">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner group-hover:bg-brand-secondary transition-colors">
                <GraduationCap className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white tracking-tight leading-none">
                  MAX
                </div>
                <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                  Educational Institution
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Empowering students with structured knowledge, hands-on computer practice, touch typing mastery, and career-focused learning.
            </p>

            {/* Google Rating Badge */}
            <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-brand-accent text-brand-accent" />
                <span className="text-sm font-bold text-white">{rating}</span>
              </div>
              <span className="text-xs text-slate-400">
                Google Rating based on {reviewCount}+ verified reviews
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About MAX</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">All Courses</Link>
              </li>
              <li>
                <Link to="/faculty" className="hover:text-white transition-colors">Faculty Team</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">Photo Gallery</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white transition-colors">Student Reviews</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Programs */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Key Programs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-accent shrink-0" />
                  <span>Basic Computer Training</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-accent shrink-0" />
                  <span>MS Office Suite Mastery</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-accent shrink-0" />
                  <span>English Touch Typing (Jr / Sr)</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-accent shrink-0" />
                  <span>Tamil Touch Typing (Jr / Sr)</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-accent shrink-0" />
                  <span>Speed Development Lab</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-accent shrink-0" />
                  <span>Technical Fundamentals</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Details */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact Institution
            </h4>
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white font-medium">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-accent shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-accent shrink-0" />
                <span>Open until {closingTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MAX Educational Institution. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-white transition-colors">
              Admission Enquiries
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/admin/login" className="hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
