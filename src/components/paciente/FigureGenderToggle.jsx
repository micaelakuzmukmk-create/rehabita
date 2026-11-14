import React from 'react';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'mujer', label: 'Mujer' },
  { value: 'hombre', label: 'Hombre' },
];

/** Selector simple de variante corporal para las animaciones. */
export default function FigureGenderToggle({ gender, onChange, className }) {
  return (
    <div
      role="group"
      aria-label="Preferencia de visualización corporal"
      className={cn('inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5', className)}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
          aria-pressed={gender === option.value}
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
            gender === option.value
              ? 'bg-area-soft text-area-ink'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}