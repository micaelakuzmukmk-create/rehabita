import React, { useEffect, useRef, useState } from 'react';
import { Square, Radio } from 'lucide-react';
import { METRIC_MAP } from '@/lib/rehbaita';

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
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Medición en tiempo real
        </div>
        <div className="text-sm font-mono text-slate-600 tabular-nums">{fmt(secs)}</div>
      </div>
      <div className="text-xs text-slate-500">Ejercicios: {exerciseNames.join(', ') || '—'}</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {LIVE.map(k => <LiveCard key={k} k={k} value={vals[k]} />)}
      </div>
      <div className="flex justify-between items-center pt-1">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">Atrás</button>
        <button onClick={() => onFinal(ref.current, secs)} className="text-sm px-5 py-2.5 rounded-lg bg-slate-900 text-white inline-flex items-center gap-1.5">
          <Square className="w-4 h-4" /> Finalizar medición
        </button>
      </div>
    </div>
  );
}

function LiveCard({ k, value }) {
  const m = METRIC_MAP[k];
  const pct = Math.min(100, (value / m.max) * 100);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{m.label}</span>
        <Radio className="w-3.5 h-3.5 text-emerald-500" />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-slate-900 tabular-nums">{Math.round(value * 10) / 10}</span>
        {m.unit && <span className="text-sm text-slate-400">{m.unit}</span>}
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: m.color }} />
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