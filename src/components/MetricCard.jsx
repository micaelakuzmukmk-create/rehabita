import React from 'react';
import { METRIC_MAP, qualitative } from '@/lib/rehbaita';

export default function MetricCard({ metricKey, value, delta }) {
  const m = METRIC_MAP[metricKey];
  if (!m) return null;
  const q = qualitative(metricKey, value);
  const isGood = m.higherBetter ? (delta == null ? null : delta >= 0) : (delta == null ? null : delta <= 0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{m.label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-slate-900">{value == null ? '—' : Math.round(value * 10) / 10}</span>
        {m.unit && <span className="text-xs text-slate-400">{m.unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{q}</span>
        {delta != null && (
          <span className={`text-xs ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
            {delta > 0 ? '+' : ''}{Math.round(delta * 10) / 10} {m.unit}
          </span>
        )}
      </div>
    </div>
  );
}