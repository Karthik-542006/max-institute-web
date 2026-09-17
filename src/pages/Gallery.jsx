import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Tag, Eye, Filter } from 'lucide-react';
import { dataService } from '../lib/dataService';
import SectionTitle from '../components/SectionTitle';
import GalleryCard from '../components/GalleryCard';
import Modal from '../components/Modal';

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await dataService.getGallery(activeCategory);
      setGallery(data);
    }
    load();
  }, [activeCategory]);

  const categories = ['All', 'Institute', 'Classroom', 'Students', 'Activities', 'Events'];

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
            Take a visual tour of MAX Educational Institution, our workstation labs, typing facilities, and student learning moments.
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
          {gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gallery.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onOpen={(img) => setSelectedImage(img)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-bg rounded-3xl border border-dashed border-brand-border">
              <Filter className="w-10 h-10 text-brand-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-brand-primary mb-1">No images found in this category</h3>
              <p className="text-xs text-brand-muted">Select another category to view campus photos.</p>
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      <Modal
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.title || 'Institute Gallery'}
        maxWidth="max-w-3xl"
      >
        {selectedImage && (
          <div>
            <div className="rounded-xl overflow-hidden bg-black/5 mb-4 max-h-[65vh] flex items-center justify-center">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-brand-primary">{selectedImage.title}</h4>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-brand-secondary border border-blue-100">
                {selectedImage.category}
              </span>
            </div>
            {selectedImage.description && (
              <p className="text-xs sm:text-sm text-brand-muted mt-2 leading-relaxed">
                {selectedImage.description}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
