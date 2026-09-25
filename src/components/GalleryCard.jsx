import React from 'react';
import { Eye, Tag, Video as VideoIcon, Image as ImageIcon, Play } from 'lucide-react';

export default function GalleryCard({ item, onOpen }) {
  const isVideo = item?.media_type === 'video' || (item?.file_url && item.file_url.match(/\.(mp4|webm|mov)(\?|$)/i));
  const mediaUrl = item?.file_url || item?.image_url;

  return (
    <div
      onClick={() => onOpen && onOpen(item)}
      className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-soft hover:shadow-premium transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Media container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/90">
        {isVideo ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            preload="metadata"
            muted
          />
        ) : (
          <img
            src={mediaUrl}
            alt={item?.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Video Play Badge overlay */}
        {isVideo && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 text-brand-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-brand-primary fill-brand-primary ml-0.5" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="p-3 rounded-full bg-white/90 text-brand-primary shadow-md transform scale-90 group-hover:scale-100 transition-transform">
            <Eye className="w-5 h-5" />
          </span>
        </div>

        {/* Category & Type tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-brand-primary shadow-sm backdrop-blur-sm">
            {isVideo ? <VideoIcon className="w-3 h-3 text-blue-600" /> : <Tag className="w-3 h-3 text-brand-secondary" />}
            {item?.category || 'Institute'}
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h4 className="text-sm font-bold text-brand-primary group-hover:text-brand-secondary transition-colors line-clamp-1">
          {item?.title}
        </h4>
        {item?.description && (
          <p className="text-xs text-brand-muted mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
