import React from 'react';
import { Eye, Tag } from 'lucide-react';

export default function GalleryCard({ item, onOpen }) {
  return (
    <div
      onClick={() => onOpen && onOpen(item)}
      className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-soft hover:shadow-premium transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="p-3 rounded-full bg-white/90 text-brand-primary shadow-md transform scale-90 group-hover:scale-100 transition-transform">
            <Eye className="w-5 h-5" />
          </span>
        </div>

        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-brand-primary shadow-sm backdrop-blur-sm">
            <Tag className="w-3 h-3 text-brand-secondary" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h4 className="text-sm font-bold text-brand-primary group-hover:text-brand-secondary transition-colors line-clamp-1">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-xs text-brand-muted mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
