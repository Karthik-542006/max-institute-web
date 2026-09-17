import React from 'react';
import { Quote, CheckCircle } from 'lucide-react';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between relative group">
      <div>
        {/* Card Header: Rating & Source badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <StarRating rating={review.rating || 5} size={15} />
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {review.source || 'Verified Student'}
          </span>
        </div>

        {/* Quote icon & text */}
        <div className="relative mb-6">
          <Quote className="w-8 h-8 text-blue-100 absolute -top-3 -left-2 -z-0 opacity-60" />
          <p className="relative z-10 text-sm sm:text-base text-brand-text leading-relaxed font-normal italic">
            "{review.review}"
          </p>
        </div>
      </div>

      {/* Student info */}
      <div className="pt-4 border-t border-brand-border/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-sm shrink-0 border border-brand-primary/20">
          {review.student_name ? review.student_name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-primary leading-tight">
            {review.student_name}
          </h4>
          <p className="text-xs text-brand-muted mt-0.5">
            Verified Student Review
          </p>
        </div>
      </div>
    </div>
  );
}
