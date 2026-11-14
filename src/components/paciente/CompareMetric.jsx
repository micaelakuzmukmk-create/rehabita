import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { METRIC_MAP } from '@/lib/rehbaita';
import MiniSpark from '@/components/paciente/MiniSpark';

const fmt = (v) => (v == null ? '—' : Math.round(Number(v) * 10) / 10);

function Bar({ label, value, max, unit, tone }) {
  const width = value == null ? 0 : Math.max(3, Math.min(100, (Number(value) / (max || 100)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-heading text-[13px] font-semibold tabular-nums text-foreground">
          {fmt(value)}<span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{value == null ? '' : unit}</span>
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function CompareMetric({ metricKey, a, b, labelA = 'Sesión anterior', labelB = 'Última sesión', sparkData }) {
  const m = METRIC_MAP[metricKey];
  if (!m) return null;

  const delta = a == null || b == null ? null : Math.round((Number(b) - Number(a)) * 10) / 10;
  const improved = delta == null ? null : m.higherBetter ? delta >= 0 : delta <= 0;
  const Icon = delta == null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="font-heading text-[13px] font-semibold text-foreground">{m.label}</span>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
            delta == null || delta === 0
              ? 'bg-muted text-muted-foreground'
              : improved
                ? 'bg-area-soft text-area-ink'
                : 'bg-warning-soft text-warning'
          }`}
        >
          <Icon className="h-3 w-3" />
          {delta == null ? 'Sin datos' : `${delta > 0 ? '+' : ''}${delta}${m.unit}`}
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        <Bar label={labelA} value={a} max={m.max} unit={m.unit} tone="bg-slate-300" />
        <Bar label={labelB} value={b} max={m.max} unit={m.unit} tone="bg-area-accent" />
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className="mt-2 border-t border-border pt-1">
          <MiniSpark data={sparkData} dataKey={metricKey} color={m.color} height={32} />
        </div>
      )}
    </div>
  );
}