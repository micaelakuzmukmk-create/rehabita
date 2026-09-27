import React from 'react';
import { Sparkles, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { METRIC_MAP, metricDelta } from '@/lib/rehbaita';

const LIVE = ['symmetry', 'load_distribution', 'stability', 'knee_flexion_angle'];
const REST = ['reaction_time', 'movement_control', 'strength', 'pain_perceived', 'confidence_perceived'];

export default function ResultsStep({ liveMetrics, prevMetrics, resultMetrics, setResultMetrics, onBack, onNext }) {
  function simulate() {
    setResultMetrics({
      reaction_time: Math.round(380 + Math.random() * 220),
      movement_control: Math.round((40 + Math.random() * 50) * 10) / 10,
      strength: Math.round((40 + Math.random() * 50) * 10) / 10,
      pain_perceived: Math.round(Math.random() * 5 * 10) / 10,
      confidence_perceived: Math.round((45 + Math.random() * 45) * 10) / 10,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm text-slate-700">Indicadores registrados durante el ejercicio</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {LIVE.map(k => <Mini key={k} k={k} value={liveMetrics[k]} />)}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-700">Resto de indicadores <span className="text-xs text-slate-400">· comparado con la sesión anterior</span></div>
          <button onClick={simulate} className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500" /> Simular
          </button>
        </div>
        <div className="space-y-2">
          {REST.map(k => {
            const m = METRIC_MAP[k];
            const v = resultMetrics[k];
            const prev = prevMetrics ? prevMetrics[k] : null;
            const d = metricDelta(k, v !== '' && v != null ? Number(v) : null, prev);
            return (
              <div key={k} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">{m.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={v}
                    onChange={e => setResultMetrics(s => ({ ...s, [k]: e.target.value }))}
                    className="w-full mt-0.5 text-sm rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <Compare delta={d} prev={prev} unit={m.unit} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between items-center pt-1">
        <button onClick={onBack} className="text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>
        <button onClick={onNext} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white inline-flex items-center gap-1.5">
          Continuar a comentario <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Mini({ k, value }) {
  const m = METRIC_MAP[k];
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <div className="text-xs text-slate-500">{m.label}</div>
      <div className="text-sm font-semibold text-slate-900">
        {value != null ? Math.round(value * 10) / 10 : '—'}
        {m.unit && <span className="text-xs text-slate-400 ml-1">{m.unit}</span>}
      </div>
    </div>
  );
}

function Compare({ delta, prev, unit }) {
  if (!delta || prev == null) {
    return <div className="w-28 text-right text-xs text-slate-400">Sin previa</div>;
  }
  const Icon = delta.delta > 0 ? TrendingUp : delta.delta < 0 ? TrendingDown : Minus;
  return (
    <div className={`w-28 text-right ${delta.improved ? 'text-emerald-600' : 'text-rose-600'}`}>
      <div className="text-xs flex items-center justify-end gap-1">
        <Icon className="w-3.5 h-3.5" /> {delta.delta > 0 ? '+' : ''}{delta.delta} {unit}
      </div>
      <div className="text-xs text-slate-400">prev: {Math.round(prev * 10) / 10}</div>
    </div>
  );
}