import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { METRIC_MAP } from '@/lib/rehbaita';

const LIVE = ['symmetry', 'load_distribution', 'stability', 'knee_flexion_angle'];

export default function FinalizarStep({ liveMetrics, durationSec, onBack, onNext }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-sm text-emerald-700">
        <CheckCircle2 className="w-4 h-4" /> Medición registrada · duración {fmt(durationSec)}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {LIVE.map(k => {
          const m = METRIC_MAP[k];
          return (
            <div key={k} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">{m.label}</div>
              <div className="text-2xl font-semibold text-slate-900">
                {liveMetrics[k] != null ? Math.round(liveMetrics[k] * 10) / 10 : '—'}
                {m.unit && <span className="text-sm text-slate-400 ml-1">{m.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center pt-1">
        <button onClick={onBack} className="text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>
        <button onClick={onNext} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white inline-flex items-center gap-1.5">
          Continuar a resultados <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}