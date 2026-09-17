import React from 'react';
import { Award, BookOpen, User, CheckCircle2 } from 'lucide-react';

export default function FacultyCard({ faculty, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Photo & Badge */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-brand-bg border-2 border-brand-border shrink-0 shadow-sm relative group-hover:border-brand-secondary transition-colors">
            {faculty.photo_url ? (
              <img
                src={faculty.photo_url}
                alt={faculty.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-brand-secondary">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-brand-secondary border border-blue-100 mb-1.5">
              <Award className="w-3 h-3 text-brand-accent" />
              <span>{faculty.experience}</span>
            </div>
            <h3 className="text-lg font-bold text-brand-primary leading-tight">
              {faculty.name}
            </h3>
            <p className="text-xs font-medium text-brand-muted mt-0.5">
              {faculty.designation}
            </p>
          </div>
        </div>

        {/* Specialization */}
        <div className="p-3 bg-brand-bg/80 rounded-xl border border-brand-border/60 mb-4">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-brand-text">Area of Focus</p>
              <p className="text-xs text-brand-muted mt-0.5 leading-snug">{faculty.specialization}</p>
            </div>
          </div>
        </div>

        {/* Bio description */}
        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-3 mb-4">
          {faculty.description}
        </p>
      </div>

      <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between text-xs text-brand-secondary">
        <span className="flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Verified Faculty Member
        </span>
        {onSelect && (
          <button
            onClick={() => onSelect(faculty)}
            className="font-semibold text-brand-primary hover:text-brand-secondary underline underline-offset-2"
          >
            Read More
          </button>
        )}
      </div>
    </div>
  );
}
