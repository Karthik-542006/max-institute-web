import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Phone, 
  Clock, 
  MapPin, 
  Menu, 
  X, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Button from './Button';

export default function Navbar({ settings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ];

  const phone = settings?.phone || '063809 27568';
  const hours = settings?.closing_time ? `Open until ${settings.closing_time}` : 'Open until 6:00 PM';

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Bar for institutional contact */}
      <div className="bg-brand-primary text-slate-200 text-xs py-2 px-4 border-b border-brand-primary/20 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>Azhagiyamandapam, Mulagamooddu, Tamil Nadu</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>{hours}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <a 
              href={`tel:${phone.replace(/\s+/g, '')}`} 
              className="flex items-center gap-1.5 text-white font-medium hover:text-brand-accent transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>{phone}</span>
            </a>
            <span className="text-slate-500">|</span>
            <Link 
              to="/admin/login" 
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`w-full transition-all duration-300 ${
        scrolled 
          ? 'glass-nav shadow-md py-3' 
          : 'bg-white border-b border-brand-border py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm group-hover:bg-brand-secondary transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold tracking-tight text-brand-primary leading-none group-hover:text-brand-secondary transition-colors">
                MAX
              </div>
              <div className="text-[11px] font-semibold text-brand-muted tracking-wider uppercase mt-0.5">
                Educational Institution
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors relative ${
                    isActive
                      ? 'text-brand-primary bg-blue-50/70 font-bold'
                      : 'text-brand-text/80 hover:text-brand-primary hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/contact">
              <Button
                variant="accent"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="shadow-sm hover:shadow"
              >
                Enquire Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/contact" className="sm:hidden">
              <Button variant="accent" size="sm" className="text-xs px-2.5 py-1.5">
                Enquire
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-primary hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden border-t border-brand-border bg-white px-4 pt-3 pb-6 shadow-xl animate-fade-in">
            <div className="flex flex-col space-y-1 mb-5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-brand-primary'
                        : 'text-brand-text hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`} />
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-brand-border/60 flex flex-col gap-3">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-50 text-brand-primary text-sm font-bold border border-blue-100"
              >
                <Phone className="w-4 h-4 text-brand-accent" />
                <span>Call {phone}</span>
              </a>
              <Link to="/admin/login" className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-brand-muted hover:text-brand-primary">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
                <span>Admin Management Portal</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
