import React from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-secondary text-primary border-secondary',
  cyan: 'bg-accent text-accent-foreground border-accent',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function Chip({ tone = 'neutral', className, children, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none',
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}