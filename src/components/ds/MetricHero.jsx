import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Nivel 1 de jerarquía: el dato principal de la pantalla.
 * Número grande + unidad + variación. Uno solo por pantalla.
 */
export default function MetricHero({ label, value, unit, delta, deltaUnit = '', improved, caption, className }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  const shown = hasValue ? (typeof value === 'number' ? Math.round(value * 10) / 10 : value) : '—';
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(delta);
  const good = typeof improved === 'boolean' ? improved : delta >= 0;
  const DeltaIcon = !hasDelta || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={cn('min-w-0', className)}>
      <div className="eyebrow">{label}</div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-heading text-[46px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums sm:text-[56px]">
          {shown}
        </span>
        {unit && <span className="font-heading text-lg font-medium text-slate-400">{unit}</span>}
      </div>

      {(hasDelta || caption) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {hasDelta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                delta === 0
                  ? 'bg-muted text-muted-foreground'
                  : good
                    ? 'bg-accent text-primary'
                    : 'bg-warning-soft text-warning'
              )}
            >
              <DeltaIcon className="h-3 w-3" />
              {Math.abs(Math.round(delta * 10) / 10)}
              {deltaUnit}
            </span>
          )}
          {caption && <span className="text-[11px] leading-tight text-muted-foreground">{caption}</span>}
        </div>
      )}
    </div>
  );
}