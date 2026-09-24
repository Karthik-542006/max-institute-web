import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Compass, 
  Building2 
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import Toast, { useToast } from '../components/Toast';

export default function Contact({ settings }) {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    course_name: location.state?.selectedCourse || '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    async function load() {
      const data = await dataService.getCourses();
      if (Array.isArray(data)) {
        setCourses(data.filter(c => c && c.is_active));
      } else {
        setCourses([]);
      }
    }
    load();
  }, []);

  // Update selected course if coming from course card
  useEffect(() => {
    if (location.state?.selectedCourse) {
      setForm(prev => ({
        ...prev,
        course_name: location.state.selectedCourse,
        message: `I would like to enquire about ${location.state.selectedCourse} batches and fee details.`
      }));
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showToast('Please enter your full name and phone number.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await dataService.createEnquiry(form);
      showToast('Your enquiry has been successfully submitted! Our team will contact you shortly.', 'success');
      setForm({
        name: '',
        phone: '',
        email: '',
        course_name: '',
        message: ''
      });
    } catch (err) {
      showToast('Failed to submit enquiry. Please try calling us directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const [liveSettings, setLiveSettings] = useState(settings);

  useEffect(() => {
    setLiveSettings(settings);
  }, [settings]);

  useEffect(() => {
    async function loadSettings() {
      const data = await dataService.getSettings();
      setLiveSettings(data);
    }
    loadSettings();
    const unsubscribe = dataService.subscribeToSettings(() => {
      loadSettings();
    });
    return () => unsubscribe();
  }, []);

  const activeSettings = liveSettings || settings;
  const phone = activeSettings?.phone || '+91 99654 68185';
  const phone2 = activeSettings?.phone2 || '+91 63809 27568';
  const email = activeSettings?.email || 'contact@maxinstitute.edu.in';
  const address = activeSettings?.address || '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167';
  const openingTime = activeSettings?.opening_time || '09:00 AM';
  const closingTime = activeSettings?.closing_time || '06:00 PM';
  const mapEmbedUrl = activeSettings?.google_maps_embed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin';
  const mapDirectUrl = activeSettings?.google_maps_url || 'https://maps.app.goo.gl/Py3cme7zBE4aBK777';

  return (
    <div className="py-12 flex flex-col">
      {/* Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <Compass className="w-3.5 h-3.5 text-brand-accent" />
            <span>Admissions & Location</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            Connect With MAX Educational Institution
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Visit our center in Azhagiyamandapam or send us an enquiry to explore batch timings, course fees, and admission details.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Col: Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-primary mb-2">
                  Campus Address & Hours
                </h2>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Located right on the Trivandrum–Nagercoil National Highway for convenient bus and local transit access.
                </p>
              </div>

              {/* Verified Location Card */}
              <div className="p-6 rounded-2xl bg-brand-bg/70 border border-brand-border space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-secondary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-primary">MAX Educational Institution</h3>
                    <p className="text-xs sm:text-sm text-brand-muted mt-1 leading-relaxed">
                      {address}
                    </p>
                    <div className="mt-2 text-[11px] font-semibold text-brand-secondary inline-block">
                      Landmark: Opposite Mosque
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-3 border-t border-brand-border/60">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-accent flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-primary">Direct Call / WhatsApp</h4>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="block text-sm font-extrabold text-brand-secondary hover:underline"
                    >
                      {phone}
                    </a>
                    <a
                      href={`tel:${phone2.replace(/\s+/g, '')}`}
                      className="block text-sm font-extrabold text-brand-secondary hover:underline mt-0.5"
                    >
                      {phone2}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-brand-border/60">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-secondary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-primary">Daily Working Hours</h4>
                    <p className="text-xs sm:text-sm text-brand-muted">
                      Monday to Saturday • {openingTime} – {closingTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-brand-border/60">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-primary">Email Inquiries</h4>
                    <a href={`mailto:${email}`} className="text-xs sm:text-sm text-brand-muted hover:text-brand-primary">
                      {email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Note */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-brand-secondary leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                <span>Walk-in visitors are warmly welcomed during operational hours to meet our faculty and explore computer workstations in person.</span>
              </div>
            </div>

            {/* Right Col: Interactive Enquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-premium">
                <h3 className="text-2xl font-extrabold text-brand-primary mb-2">
                  Official Admission Enquiry Form
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted mb-8 leading-relaxed">
                  Please complete the form below. An admission counselor will contact you regarding batch schedules, eligibility, and fees.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="e.g. arun@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                        Select Course of Interest
                      </label>
                      <select
                        value={form.course_name}
                        onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="">Choose a Program</option>
                        {(courses || []).map(c => (
                          <option key={c.id || c.title} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                      Message / Specific Requirements
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Mention your preferred batch timing (morning/evening) or any specific questions..."
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
                    className="w-full sm:w-auto px-8 shadow-md"
                  >
                    Submit Enquiry
                  </Button>
                </form>
              </div>
            </div>

          </div>

          {/* Embedded Google Map */}
          <div className="mt-16 pt-12 border-t border-brand-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-brand-primary">Location Map</h3>
                <p className="text-xs sm:text-sm text-brand-muted">Azhagiyamandapam, Mulagamooddu, Tamil Nadu</p>
              </div>
              <a
                href={mapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-secondary hover:text-brand-primary transition-colors group"
              >
                <span>Open in Google Maps</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            
            <a
              href={mapDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-3xl overflow-hidden border border-brand-border shadow-soft h-80 sm:h-96 w-full bg-gray-100 relative group cursor-pointer"
              title="Click to open MAX Educational Institution in Google Maps"
            >
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: 'none' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MAX Educational Institution Location"
              />
              {/* Click-to-open overlay */}
              <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-all duration-200 flex items-end justify-end p-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-brand-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-brand-border">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>Open MAX Institute in Google Maps</span>
                </div>
              </div>
            </a>
          </div>

        </div>
      </section>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
