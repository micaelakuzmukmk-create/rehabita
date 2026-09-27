import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { METRIC_MAP, qualitative, metricDelta } from '@/lib/rehbaita';

export default function StatCard({ metricKey, value, prev }) {
  const m = METRIC_MAP[metricKey];
  if (!m) return null;
  const pct = m.max ? Math.min(100, ((value || 0) / m.max) * 100) : 0;
  const d = metricDelta(metricKey, value, prev);
  const Icon = d ? (d.delta > 0 ? ArrowUp : d.delta < 0 ? ArrowDown : Minus) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{m.label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-slate-900 tabular-nums">{value == null ? '—' : Math.round(value * 10) / 10}</span>
        {m.unit && <span className="text-sm text-slate-400">{m.unit}</span>}
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: m.color }} />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="text-slate-500">{qualitative(metricKey, value)}</span>
        {d ? (
          <span className={`inline-flex items-center gap-0.5 font-medium ${d.improved ? 'text-emerald-600' : 'text-rose-500'}`}>
            {Icon && <Icon className="w-3 h-3" />} {Math.abs(d.delta)}{m.unit} vs. anterior
          </span>
        ) : (
          <span className="text-slate-400">primera sesión</span>
        )}
      </div>
    </div>
  );
}