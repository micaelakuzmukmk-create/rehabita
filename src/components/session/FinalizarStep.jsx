import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { METRIC_MAP } from '@/lib/rehbaita';
import { Button } from '@/components/ui/button';

const LIVE = ['symmetry', 'load_distribution', 'stability', 'knee_flexion_angle'];

export default function FinalizarStep({ liveMetrics, durationSec, onBack, onNext }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-[13px] text-success">
        <CheckCircle2 className="h-4 w-4" /> Medición registrada · duración {fmt(durationSec)}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {LIVE.map(k => {
          const m = METRIC_MAP[k];
          return (
            <div key={k} className="rounded-xl border border-border bg-card p-4">
              <div className="micro-label">{m.label}</div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="font-heading text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {liveMetrics[k] != null ? Math.round(liveMetrics[k] * 10) / 10 : '—'}
                </span>
                {m.unit && <span className="metric-unit">{m.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button onClick={onNext}>
          Continuar a resultados <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}