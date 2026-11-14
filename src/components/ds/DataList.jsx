import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Niveles 2 y 3: información de apoyo y datos complementarios.
 * Etiqueta en gris, valor en semibold: agrupa varios datos sin una tarjeta por dato.
 */
export default function DataList({ rows = [], className, dense = false }) {
  return (
    <dl className={cn('divide-y divide-border', className)}>
      {rows.map(({ label, value, hint, delta, deltaUnit = '', improved, tone }) => {
        const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(delta);
        const good = typeof improved === 'boolean' ? improved : delta >= 0;
        const DeltaIcon = !hasDelta || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

        return (
          <div key={label} className={cn('flex items-center justify-between gap-4', dense ? 'py-2' : 'py-3')}>
            <div className="min-w-0">
              <dt className="text-[13px] leading-tight text-muted-foreground">{label}</dt>
              {hint && <div className="mt-0.5 text-[11px] leading-tight text-slate-400">{hint}</div>}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {hasDelta && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
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
              <dd
                className={cn(
                  'font-heading text-[15px] font-semibold tabular-nums',
                  tone === 'muted' ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {value || '—'}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}