import React from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-secondary text-primary border-secondary',
  cyan: 'bg-accent text-accent-foreground border-accent',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
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