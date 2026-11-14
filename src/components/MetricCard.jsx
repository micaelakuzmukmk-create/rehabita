import React from 'react';
import { METRIC_MAP, qualitative } from '@/lib/rehbaita';

export default function MetricCard({ metricKey, value, delta }) {
  const m = METRIC_MAP[metricKey];
  if (!m) return null;
  const q = qualitative(metricKey, value);
  const isGood = m.higherBetter ? (delta == null ? null : delta >= 0) : (delta == null ? null : delta <= 0);
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="text-[10px] leading-tight text-muted-foreground">{m.label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="font-heading text-xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {value == null ? '—' : Math.round(value * 10) / 10}
        </span>
        {m.unit && <span className="text-[10px] font-medium text-muted-foreground">{m.unit}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{q}</span>
        {delta != null && (
          <span className={`text-[10px] font-medium ${isGood ? 'text-primary' : 'text-warning'}`}>
            {delta > 0 ? '+' : ''}{Math.round(delta * 10) / 10}
          </span>
        )}
      </div>
    </div>
  );
}