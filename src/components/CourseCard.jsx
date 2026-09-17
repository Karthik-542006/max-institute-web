import React from 'react';
import { 
  Monitor, 
  Keyboard, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Settings, 
  Users, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Button from './Button';

export const ICON_MAP = {
  Monitor,
  Keyboard,
  BookOpen,
  GraduationCap,
  Award,
  Settings,
  Users
};

export default function CourseCard({ course, onSelect, onEnquire }) {
  const IconComponent = ICON_MAP[course.icon] || Monitor;

  const categoryColors = {
    'Computer Courses': 'bg-blue-50 text-brand-primary border-blue-100',
    'Typing Courses': 'bg-amber-50 text-amber-800 border-amber-100',
    'Technical Courses': 'bg-emerald-50 text-emerald-800 border-emerald-100'
  };

  return (
    <div className="group bg-white rounded-2xl border border-brand-border hover:border-brand-secondary/40 p-6 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Subtle top indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Card Header: Icon & Category */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50/80 border border-blue-100/80 text-brand-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
            <IconComponent className="w-6 h-6 transition-colors" />
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[course.category] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
            {course.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors mb-2.5">
          {course.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-brand-muted leading-relaxed mb-6 line-clamp-3">
          {course.short_description}
        </p>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div>
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-brand-border/60 mb-5 text-xs text-brand-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
            <span className="truncate">{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Award className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span className="truncate font-medium text-brand-text">{course.level}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onSelect && onSelect(course)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => onEnquire && onEnquire(course)}
          >
            Enquire
          </Button>
        </div>
      </div>
    </div>
  );
}
