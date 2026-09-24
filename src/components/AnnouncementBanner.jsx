import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, X } from 'lucide-react';
import { dataService } from '../lib/dataService';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const loadAnnouncements = async () => {
    const list = await dataService.getPublicAnnouncements();
    setAnnouncements(list);
  };

  useEffect(() => {
    loadAnnouncements();

    // Check periodically every 15 seconds to update scheduled time boundaries automatically
    const timer = setInterval(loadAnnouncements, 15000);

    const handleUpdate = () => loadAnnouncements();
    window.addEventListener('max_posts_updated', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('max_posts_updated', handleUpdate);
    };
  }, []);

  if (dismissed || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex % announcements.length];

  return (
    <div className="bg-gradient-to-r from-brand-primary via-blue-900 to-indigo-950 text-white text-xs sm:text-sm py-2.5 px-4 shadow-md relative z-50 border-b border-brand-accent/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 bg-brand-accent text-brand-primary text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs">
            <Megaphone className="w-3 h-3 text-brand-primary" />
            <span>{current.category || 'Announcement'}</span>
          </span>

          <div className="truncate flex items-center gap-2">
            <span className="font-extrabold text-amber-300 truncate">{current.title}</span>
            <span className="hidden md:inline text-slate-200 font-medium truncate opacity-90">
              — {current.content}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current.action_label && (
            <Link
              to={current.action_link || '/contact'}
              className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-brand-primary font-extrabold text-xs px-3 py-1 rounded-xl transition-all shadow-xs group"
            >
              <span>{current.action_label}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {announcements.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="text-slate-300 hover:text-white text-xs font-bold underline px-1"
              title="Next announcement"
            >
              Next ({currentIndex + 1}/{announcements.length})
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
