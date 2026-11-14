import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

function Delta({ delta, unit = '', improved }) {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return null;
  const good = typeof improved === 'boolean' ? improved : delta >= 0;
  const Icon = delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
        delta === 0 ? 'bg-muted text-muted-foreground' : good ? 'bg-area-soft text-area-ink' : 'bg-warning-soft text-warning'
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(Math.round(delta * 10) / 10)}
      {unit}
    </span>
  );
}

/**
 * Indicadores con dos escalas: un dato protagonista y el resto en segundo plano.
 * La jerarquía viene del tamaño y del espacio, no del color.
 */
export default function PatientVitals({ primary, secondary = [] }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-surface">
      <div className="grid divide-y divide-border sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] sm:divide-x sm:divide-y-0">
        <div className="p-5 sm:p-6">
          <div className="eyebrow">{primary.label}</div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="font-heading text-[44px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums sm:text-[52px]">
              {primary.value ?? '—'}
            </span>
            {primary.unit && <span className="font-heading text-base font-medium text-muted-foreground">{primary.unit}</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Delta delta={primary.delta} unit={primary.deltaUnit} improved={primary.improved} />
            {primary.hint && <span className="text-[11px] leading-tight text-muted-foreground">{primary.hint}</span>}
          </div>
        </div>

        {secondary.length > 0 && (
          <div className="grid grid-cols-2">
            {secondary.map((item) => (
              <div key={item.label} className="border-b border-r border-border p-4 last:border-b-0 sm:p-5">
                <div className="micro-label">{item.label}</div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-heading text-[24px] font-semibold leading-none tracking-[-0.02em] text-foreground tabular-nums">
                    {item.value ?? '—'}
                  </span>
                  {item.unit && <span className="text-[11px] font-medium text-muted-foreground">{item.unit}</span>}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Delta delta={item.delta} unit={item.deltaUnit} improved={item.improved} />
                  {item.hint && <span className="text-[10px] text-muted-foreground">{item.hint}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}