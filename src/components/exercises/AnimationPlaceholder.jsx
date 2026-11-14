import React from 'react';
import { Film } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnimationPlaceholder({ compact = false, className }) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-1.5 bg-area-soft/40 px-2 text-center',
        className
      )}
    >
      {!compact && <Film className="h-4 w-4 shrink-0 text-area-ink/45" />}
      <span
        className={cn(
          'font-medium leading-tight text-muted-foreground',
          compact ? 'text-[9px]' : 'text-[11px]'
        )}
      >
        Demostración en desarrollo
      </span>
    </div>
  );
}