import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2, Phone, MapPin, Clock } from 'lucide-react';
import { dataService } from '../lib/dataService';
import Button from '../components/Button';
import Toast, { useToast } from '../components/Toast';

export default function Settings() {
  const [form, setForm] = useState({
    institute_name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    opening_time: '',
    closing_time: '',
    google_rating: 4.9,
    total_google_reviews: 110,
    google_maps_url: '',
    google_maps_embed: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    async function load() {
      const data = await dataService.getSettings();
      setForm(data);
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dataService.updateSettings(form);
      showToast('Institution settings updated successfully!', 'success');
      // Trigger update event so Navbar/Footer reload fresh settings
      window.dispatchEvent(new Event('max_settings_updated'));
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
            Site & Institutional Settings
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Update institutional name, phone number, address, timings, and map embeds live across the entire website
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                Institute Name
              </label>
              <input
                type="text"
                required
                value={form.institute_name}
                onChange={(e) => setForm({ ...form, institute_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                Institutional Tagline
              </label>
              <input
                type="text"
                required
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                Official Phone Number
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
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
              rows={3}
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                Opening Time
              </label>
              <input
                type="text"
                value={form.opening_time}
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
                value={form.closing_time}
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
                value={form.google_rating}
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
                value={form.total_google_reviews}
                onChange={(e) => setForm({ ...form, total_google_reviews: parseInt(e.target.value) || 110 })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
              Google Maps Embed URL
            </label>
            <input
              type="text"
              value={form.google_maps_embed}
              onChange={(e) => setForm({ ...form, google_maps_embed: e.target.value })}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="pt-4 border-t border-brand-border flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={Save}
              iconPosition="right"
              className="px-8 shadow-md"
            >
              Save Site Settings
            </Button>
          </div>
        </form>
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
