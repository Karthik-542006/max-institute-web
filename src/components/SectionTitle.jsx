import React from 'react';

export default function SectionTitle({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
  badgeVariant = 'primary'
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl mb-12 sm:mb-16 ${alignClass} ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 text-brand-secondary border border-blue-100 mb-3.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
          {badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-primary tracking-tight leading-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
