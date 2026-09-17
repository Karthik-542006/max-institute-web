import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 5,
  maxStars = 5,
  size = 18,
  className = '',
  onChange = null
}) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isClickable = Boolean(onChange);

        return (
          <button
            key={index}
            type={isClickable ? 'button' : undefined}
            onClick={isClickable ? () => onChange(starValue) : undefined}
            disabled={!isClickable}
            className={`p-0 bg-transparent border-0 inline-flex items-center justify-center transition-transform ${
              isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
            aria-label={`${starValue} star`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                isFilled
                  ? 'fill-brand-accent text-brand-accent'
                  : 'fill-transparent text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
