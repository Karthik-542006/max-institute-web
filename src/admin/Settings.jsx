import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  Share2, 
  Image as ImageIcon,
  Star,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Navigation
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Toast, { useToast } from '../components/Toast';

export default function Settings() {
  const [form, setForm] = useState({
    institution_name: 'MAX Educational Institution',
    tagline: 'Empowering Students With Skills for Tomorrow',
    phone: '+91 99654 68185',
    phone2: '+91 63809 27568',
    whatsapp: '+91 63809 27568',
    email: 'contact@maxinstitute.edu.in',
    address: '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    website_title: 'MAX Educational Institution | Azhagiyamandapam',
    website_description: 'Professional training in Computer Courses, Typing (English & Tamil), and Technical Fundamentals in Azhagiyamandapam.',
    logo_url: '',
    favicon_url: '',
    facebook_url: 'https://facebook.com',
    instagram_url: 'https://instagram.com',
    youtube_url: 'https://youtube.com',
    google_rating: 4.9,
    total_google_reviews: 110,
    google_maps_url: 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6',
    google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin'
  });

  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [conflictWarning, setConflictWarning] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const isDirty = initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);

  // Network online/offline listener (Requirement 29)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Unsaved changes warning before leaving page (Requirement 28)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Leave without saving?';
        return 'You have unsaved changes. Leave without saving?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const loadSettingsData = async () => {
    const data = await dataService.getSettings();
    if (data) {
      // Ensure canonical Google Maps link
      if (!data.google_maps_url || data.google_maps_url.includes('Py3cme7zBE4aBK777') || data.google_maps_url.includes('maps.google.com/?q=')) {
        data.google_maps_url = 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6';
      }
      setForm(prev => ({ ...prev, ...data }));
      setInitialForm({ ...data });
      setConflictWarning(null);
    }
  };

  useEffect(() => {
    loadSettingsData();

    // Listen to real-time changes by other administrators (Requirements 3 & 18)
    const unsubscribe = dataService.subscribeToSettings((updated) => {
      if (updated && updated.updated_by !== 'me') {
        // If the user hasn't made uncommitted changes, auto-update
        if (!isDirty) {
          setForm(prev => ({ ...prev, ...updated }));
          setInitialForm({ ...updated });
        } else {
          // Another admin edited concurrently
          setConflictWarning('Notice: Another administrator has updated the settings in the database. Please review before saving.');
        }
      }
    });

    return () => unsubscribe();
  }, [isDirty]);

  // Form Submission with Save Experience & Conflict Protection (Requirements 18, 27)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      showToast("You're offline. Your changes have not been saved.", 'error');
      return;
    }

    if (!form.institution_name?.trim()) {
      showToast('Institution name is required.', 'error');
      return;
    }

    if (!form.phone?.trim()) {
      showToast('Primary contact phone is required.', 'error');
      return;
    }

    setLoading(true);

    try {
      // Pass expected timestamp to prevent silent overwrite of concurrent edits
      const updated = await dataService.updateSettings(form, initialForm?.updated_at);
      setForm(prev => ({ ...prev, ...updated }));
      setInitialForm({ ...updated });
      setConflictWarning(null);
      showToast('Site settings updated live across all connected devices!', 'success');
    } catch (err) {
      console.error('Save settings error:', err);
      if (err.message && err.message.includes('updated by another administrator')) {
        setConflictWarning(err.message);
        showToast(err.message, 'error');
      } else {
        showToast('Unable to save changes. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-brand-accent" />
            <span>Master Site & Institutional Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Database is the single source of truth. Changes synchronize live to all admins and public visitors in real-time.
          </p>
        </div>

        {isDirty && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Unsaved Changes</span>
          </div>
        )}
      </div>

      {/* Offline Warning Banner (Requirement 29) */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs sm:text-sm">
          <WifiOff className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <span className="font-bold block">You're currently offline.</span>
            <span>Your changes have not been saved. Please restore your internet connection before submitting.</span>
          </div>
        </div>
      )}

      {/* Concurrent Conflict Warning Banner (Requirement 18) */}
      {conflictWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4 text-amber-900 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
          <button
            type="button"
            onClick={loadSettingsData}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Load Server Version
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Institution Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
              <Globe className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide">
                1. Institutional Identity & SEO
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.institution_name || form.institute_name || ''}
                  onChange={(e) => setForm({ ...form, institution_name: e.target.value, institute_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={form.tagline || ''}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Website Title (SEO)
                </label>
                <input
                  type="text"
                  value={form.website_title || ''}
                  onChange={(e) => setForm({ ...form, website_title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Website Description (SEO)
                </label>
                <input
                  type="text"
                  value={form.website_description || ''}
                  onChange={(e) => setForm({ ...form, website_description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-brand-border">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
              <Phone className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide">
                2. Official Contact Information (Single Source of Truth)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Primary Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  value={form.whatsapp || form.phone2 || ''}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value, phone2: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                Full Physical Campus Address
              </label>
              <textarea
                rows={2}
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>
          </div>

          {/* Section 3: Operating Hours & Ratings */}
          <div className="space-y-4 pt-4 border-t border-brand-border">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
              <Clock className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide">
                3. Operating Hours & Google Ratings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={form.opening_time || ''}
                  onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={form.closing_time || ''}
                  onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                  placeholder="06:00 PM"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Google Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.google_rating ?? 4.9}
                  onChange={(e) => setForm({ ...form, google_rating: parseFloat(e.target.value) || 4.9 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Total Reviews Count
                </label>
                <input
                  type="number"
                  value={form.total_google_reviews ?? 110}
                  onChange={(e) => setForm({ ...form, total_google_reviews: parseInt(e.target.value) || 110 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Google Maps & Social Links (Requirements 1 & 25) */}
          <div className="space-y-4 pt-4 border-t border-brand-border">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
              <Navigation className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wide">
                4. Google Maps Location & Social Media
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Exact Google Maps Location URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={form.google_maps_url || ''}
                  onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
                  placeholder="https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="text-[11px] text-brand-muted mt-1">
                  This exact link is used for all "Location", "View on Map", and "Get Directions" buttons across the entire website.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Google Maps Embed URL
                </label>
                <input
                  type="text"
                  value={form.google_maps_embed || ''}
                  onChange={(e) => setForm({ ...form, google_maps_embed: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={form.facebook_url || ''}
                  onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={form.instagram_url || ''}
                  onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={form.youtube_url || ''}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-border flex items-center justify-between">
            <p className="text-xs text-brand-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All updates broadcast instantly via Supabase Realtime</span>
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading || !isOnline}
              icon={Save}
              iconPosition="right"
              className="px-8 shadow-md"
            >
              {loading ? 'Saving to Database...' : 'Save Site Settings'}
            </Button>
          </div>
        </form>
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
