import React from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Phone, Building2, Compass } from 'lucide-react';
import Button from './Button';

export const EXACT_MAP_URL = 'https://maps.app.goo.gl/Sa1JdFdKU7XJJmdd6';
export const MAP_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=MAX+Educational+Institution+Azhagiyamandapam&destination_place_id=ChIJUZSAhbx5BDsRrLQd2TGZ5sE';
export const DEFAULT_MAP_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1974.1999671895421!2d77.29470315707398!3d8.262930013284187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f9bc8580f251%3A0xc1e69931d91db4ac!2sMAX%20Educational%20Institution!5e0!3m2!1sen!2sin!4v1790232706966!5m2!1sen!2sin';

export default function GoogleMapSection({ settings, className = '' }) {
  const mapUrl = settings?.google_maps_url || EXACT_MAP_URL;
  const embedUrl = settings?.google_maps_embed || DEFAULT_MAP_EMBED;
  const address = settings?.address || '1st Floor, Trivandrum–Nagercoil Highway, Opposite Mosque, Azhagiyamandapam, Mulagamooddu, Tamil Nadu – 629167';
  const phone = settings?.phone || '+91 99654 68185';
  const openingTime = settings?.opening_time || '09:00 AM';
  const closingTime = settings?.closing_time || '06:00 PM';

  const handleOpenMap = (e) => {
    e.preventDefault();
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGetDirections = (e) => {
    e.preventDefault();
    // On mobile devices, this triggers the native Google Maps app when installed
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    if (isMobile) {
      window.location.href = mapUrl;
    } else {
      window.open(MAP_DIRECTIONS_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className={`py-16 bg-white ${className}`} id="location-map">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-3">
            <Compass className="w-3.5 h-3.5 text-brand-accent" />
            <span>Campus Location</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-primary tracking-tight mb-3">
            Visit MAX Educational Institution
          </h2>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            Easily accessible on the Trivandrum–Nagercoil National Highway at Azhagiyamandapam, opposite the mosque.
          </p>
        </div>

        {/* Two-Column Grid: Location Card + Embedded Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Official Location Card */}
          <div className="lg:col-span-5 bg-brand-bg rounded-3xl p-6 sm:p-8 border border-brand-border shadow-soft flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-primary leading-tight">
                    MAX Educational Institution
                  </h3>
                  <p className="text-xs font-semibold text-brand-secondary mt-0.5">
                    Azhagiyamandapam / Mulagamooddu
                  </p>
                  <p className="text-xs text-brand-muted font-medium">
                    Tamil Nadu – 629167
                  </p>
                </div>
              </div>

              {/* Address Box */}
              <div className="p-4 rounded-2xl bg-white border border-brand-border space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-brand-primary block mb-0.5">Physical Address:</span>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      {address}
                    </p>
                    <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      ★ Landmark: Opposite Mosque
                    </span>
                  </div>
                </div>
              </div>

              {/* Hours & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-brand-border flex items-center gap-3">
                  <Clock className="w-4 h-4 text-brand-secondary shrink-0" />
                  <div>
                    <span className="text-[11px] text-brand-muted font-semibold block">Office Hours</span>
                    <span className="font-bold text-brand-primary">{openingTime} – {closingTime}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-brand-border flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                  <div>
                    <span className="text-[11px] text-brand-muted font-semibold block">Contact Number</span>
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-bold text-brand-primary hover:text-brand-secondary transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons: OPEN IN GOOGLE MAPS & GET DIRECTIONS */}
            <div className="pt-6 mt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleOpenMap}
                id="btn-open-google-maps"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform" />
                <span>Open in Google Maps</span>
              </button>

              <button
                type="button"
                onClick={handleGetDirections}
                id="btn-get-directions"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-secondary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-brand-accent group-hover:rotate-45 transition-transform" />
                <span>Get Directions</span>
              </button>
            </div>

          </div>

          {/* Right Column: Embedded Google Map with Click-to-Open Overlay */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-brand-border shadow-soft relative group min-h-[360px] sm:min-h-[420px] bg-slate-100">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '360px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MAX Educational Institution Google Maps Location"
              className="w-full h-full"
            />

            {/* Floating Quick Action Overlay */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/95 hover:bg-white text-brand-primary px-4 py-2 rounded-xl text-xs font-bold shadow-lg border border-brand-border flex items-center gap-2 transition-all hover:scale-105"
              >
                <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
                <span>View on Map</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
