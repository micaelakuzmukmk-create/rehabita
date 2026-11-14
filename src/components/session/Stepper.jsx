import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Progresión discreta: solo el paso actual se destaca.
 */
export default function Stepper({ labels, current }) {
  const total = labels.length;

  return (
    <div className="mb-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="eyebrow">
          Paso {String(current + 1).padStart(2, '0')} de {String(total).padStart(2, '0')}
        </span>
        <span className="text-[13px] font-semibold text-primary">{labels[current]}</span>
      </div>

      <div className="flex items-center overflow-x-auto pb-1">
        {labels.map((label, i) => {
          const done = i < current;
          const active = i === current;

          return (
            <React.Fragment key={label}>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : done
                        ? 'bg-secondary text-primary'
                        : 'bg-muted text-slate-400'
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'hidden whitespace-nowrap text-[11px] sm:block',
                    active ? 'font-semibold text-foreground' : done ? 'text-muted-foreground' : 'text-slate-400'
                  )}
                >
                  {label}
                </span>
              </div>

              {i < total - 1 && (
                <span className={cn('mx-2 min-w-4 flex-1 border-t', done ? 'border-brand-lavender' : 'border-border')} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}