import React, { useEffect, useRef, useState } from 'react';
import { Square } from 'lucide-react';
import { METRIC_MAP } from '@/lib/rehbaita';
import { Button } from '@/components/ui/button';

const LIVE = ['symmetry', 'load_distribution', 'stability', 'knee_flexion_angle'];
const SECONDARY = ['load_distribution', 'stability', 'knee_flexion_angle'];

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

  const symmetryPct = Math.min(100, (vals.symmetry / METRIC_MAP.symmetry.max) * 100);

  return (
    <div className="space-y-5">
      {/* Estado de la medición */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-cyan opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-cyan" />
          </span>
          Medición en tiempo real
        </div>
        <div className="font-mono text-sm text-muted-foreground tabular-nums">{fmt(secs)}</div>
      </div>

      {/* Nivel 1: ejercicio actual */}
      <div>
        <div className="eyebrow">Ejercicio actual</div>
        <div className="mt-1 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground">
          {exerciseNames.join(' · ') || 'Sin ejercicios seleccionados'}
        </div>
      </div>

      {/* Nivel 2: indicador principal en vivo */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="micro-label">Simetría en vivo</span>
          <span className="text-[11px] text-muted-foreground">{qualitativeVals(vals.symmetry)}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-heading text-[52px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">
            {Math.round(vals.symmetry * 10) / 10}
          </span>
          <span className="font-heading text-lg font-medium text-slate-400">%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-cyan transition-all duration-700 ease-out"
            style={{ width: `${symmetryPct}%` }}
          />
        </div>
      </div>

      {/* Nivel 3: indicadores complementarios */}
      <div className="grid grid-cols-3 gap-4">
        {SECONDARY.map((k) => {
          const m = METRIC_MAP[k];
          return (
            <div key={k}>
              <div className="micro-label">{m.label}</div>
              <div className="mt-1 flex items-baseline gap-0.5">
                <span className="font-heading text-lg font-semibold leading-none text-foreground tabular-nums">
                  {Math.round(vals[k] * 10) / 10}
                </span>
                {m.unit && <span className="text-[11px] font-medium text-slate-400">{m.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Control único de la sesión */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button variant="ghost" size="sm" onClick={onBack}>Atrás</Button>
        <Button onClick={() => onFinal(ref.current, secs)}>
          <Square className="h-4 w-4" /> Finalizar medición
        </Button>
      </div>
    </div>
  );
}

function qualitativeVals(v) {
  if (v >= 90) return 'Muy alta';
  if (v >= 80) return 'Alta';
  if (v >= 70) return 'Moderada';
  return 'A mejorar';
}

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function fmt(s) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}