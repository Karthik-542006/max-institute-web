import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video as VideoIcon, Tag, Eye, Filter } from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import GalleryCard from '../components/GalleryCard';
import Modal from '../components/Modal';

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [visibleCount, setVisibleCount] = useState(18);

  useEffect(() => {
    loadGallery();

    const unsubscribe = dataService.subscribeToGallery(() => {
      loadGallery();
    });
    return () => unsubscribe();
  }, [activeCategory]);

  async function loadGallery() {
    const data = await dataService.getGallery(activeCategory);
    // Filter only published items for public view
    const publishedOnly = data.filter(item => item.is_published !== false);
    setGallery(publishedOnly);
    setVisibleCount(18);
  }

  const categories = ['All', 'Institute', 'Classroom', 'Students', 'Activities', 'Events'];
  const paginatedGallery = gallery.slice(0, visibleCount);

  return (
    <div className="py-12 flex flex-col">
      {/* Header */}
      <section className="bg-brand-bg py-16 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-4">
            <ImageIcon className="w-3.5 h-3.5 text-brand-accent" />
            <span>Visual Tour</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-primary tracking-tight mb-4">
            Campus Life & Facilities
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Take a visual tour of MAX Educational Institution, our workstation labs, typing facilities, campus activities, and video highlights.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-brand-bg text-brand-muted hover:text-brand-primary hover:bg-gray-100 border border-brand-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {paginatedGallery.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paginatedGallery.map((item) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    onOpen={(media) => setSelectedMedia(media)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < gallery.length && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 36)}
                    className="px-8 py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-xs sm:text-sm hover:bg-brand-primary/90 transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <span>Load More Media ({gallery.length - visibleCount} remaining)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-bg rounded-3xl border border-dashed border-brand-border">
              <Filter className="w-10 h-10 text-brand-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-brand-primary mb-1">No published media found in this category</h3>
              <p className="text-xs text-brand-muted">Select another category to view campus photos and videos.</p>
            </div>
          )}

        </div>
      </section>

      {/* Lightbox / Media Viewer Modal */}
      <Modal
        isOpen={Boolean(selectedMedia)}
        onClose={() => setSelectedMedia(null)}
        title={selectedMedia?.title || 'Campus Gallery'}
        maxWidth="max-w-3xl"
      >
        {selectedMedia && (
          <div>
            <div className="rounded-xl overflow-hidden bg-black/90 mb-4 max-h-[65vh] flex items-center justify-center">
              {selectedMedia.media_type === 'video' || (selectedMedia.file_url && selectedMedia.file_url.match(/\.(mp4|webm|mov)(\?|$)/i)) ? (
                <video
                  src={selectedMedia.file_url || selectedMedia.image_url}
                  controls
                  autoPlay
                  className="w-full max-h-[65vh] object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.file_url || selectedMedia.image_url}
                  alt={selectedMedia.title}
                  className="w-full max-h-[65vh] object-contain"
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-brand-primary">{selectedMedia.title}</h4>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-brand-secondary border border-blue-100 flex items-center gap-1">
                {selectedMedia.media_type === 'video' ? <VideoIcon className="w-3.5 h-3.5 text-blue-600" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
                {selectedMedia.category}
              </span>
            </div>
            {selectedMedia.description && (
              <p className="text-xs sm:text-sm text-brand-muted mt-2 leading-relaxed">
                {selectedMedia.description}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
