import React, { useEffect, useRef, useState } from 'react';
import { Square } from 'lucide-react';
import { METRIC_MAP } from '@/lib/rehbaita';
import { Button } from '@/components/ui/button';

const LIVE = ['symmetry', 'load_distribution', 'stability', 'knee_flexion_angle'];

export default function LiveMeasureStep({ calibration, exerciseNames, onFinal, onBack }) {
  const [vals, setVals] = useState(() => ({
    symmetry: calibration?.baseline_symmetry ?? 70,
    load_distribution: calibration?.baseline_load ?? 65,
    stability: calibration?.baseline_stability ?? 60,
    knee_flexion_angle: 100,
  }));
  const [secs, setSecs] = useState(0);
  const ref = useRef(vals);
  ref.current = vals;

  useEffect(() => {
    const tick = setInterval(() => {
      setVals(v => ({
        symmetry: clamp(v.symmetry + rand(-1.5, 1.6), 50, 99),
        load_distribution: clamp(v.load_distribution + rand(-1.5, 1.6), 50, 98),
        stability: clamp(v.stability + rand(-1.5, 1.8), 45, 95),
        knee_flexion_angle: clamp(v.knee_flexion_angle + rand(-2, 2.5), 85, 130),
      }));
      setSecs(s => s + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-cyan opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-cyan" />
          </span>
          Medición en tiempo real
        </div>
        <div className="font-mono text-sm text-muted-foreground tabular-nums">{fmt(secs)}</div>
      </div>
      <div className="text-[11px] text-muted-foreground">Ejercicios: {exerciseNames.join(', ') || '—'}</div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {LIVE.map(k => <LiveCard key={k} k={k} value={vals[k]} />)}
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>Atrás</Button>
        <Button onClick={() => onFinal(ref.current, secs)}>
          <Square className="h-4 w-4" /> Finalizar medición
        </Button>
      </div>
    </div>
  );
}

function LiveCard({ k, value }) {
  const m = METRIC_MAP[k];
  const pct = Math.min(100, (value / m.max) * 100);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="micro-label">{m.label}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="metric-value">{Math.round(value * 10) / 10}</span>
        {m.unit && <span className="metric-unit">{m.unit}</span>}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: m.color }}
        />
      </div>
    </div>
  );
}

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function fmt(s) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}