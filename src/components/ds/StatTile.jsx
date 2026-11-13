import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dato clínico principal: número grande + unidad + variación respecto a la sesión anterior.
 * La variación positiva se expresa en cian (evolución), la negativa en ámbar (advertencia).
 */
export default function StatTile({
  label,
  value,
  unit,
  hint,
  delta,
  deltaUnit = '',
  improved,
  progress,
  className,
}) {
  const hasValue = value !== null && value !== undefined && value !== '';
  const shown = hasValue ? (typeof value === 'number' ? Math.round(value * 10) / 10 : value) : '—';
  const showDelta = delta !== null && delta !== undefined && !Number.isNaN(delta);
  const good = typeof improved === 'boolean' ? improved : delta >= 0;
  const DeltaIcon = !showDelta || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand-soft blur-2xl"
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <span className="micro-label">{label}</span>
          {showDelta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                delta === 0
                  ? 'bg-muted text-muted-foreground'
                  : good
                    ? 'bg-accent text-primary'
                    : 'bg-amber-50 text-amber-700'
              )}
            >
              <DeltaIcon className="h-3 w-3" />
              {Math.abs(delta)}
              {deltaUnit}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="metric-value">{shown}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>

        {typeof progress === 'number' && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          {hint && <span className="text-[11px] leading-tight text-muted-foreground">{hint}</span>}
          {showDelta && <span className="text-[10px] text-muted-foreground">vs. anterior</span>}
        </div>
      </div>
    </div>
  );
}