import React from 'react';
import { Sparkles, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { METRIC_MAP, metricDelta } from '@/lib/rehbaita';
import { Button } from '@/components/ui/button';

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
        <div className="text-sm text-foreground">Indicadores registrados durante el ejercicio</div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {LIVE.map(k => <Mini key={k} k={k} value={liveMetrics[k]} />)}
        </div>
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-foreground">
            Resto de indicadores <span className="text-[11px] text-muted-foreground">· comparado con la sesión anterior</span>
          </div>
          <Button variant="outline" size="sm" onClick={simulate}>
            <Sparkles className="h-4 w-4 text-brand-blue" /> Simular
          </Button>
        </div>
        <div className="space-y-2">
          {REST.map(k => {
            const m = METRIC_MAP[k];
            const v = resultMetrics[k];
            const prev = prevMetrics ? prevMetrics[k] : null;
            const d = metricDelta(k, v !== '' && v != null ? Number(v) : null, prev);
            return (
              <div key={k} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex-1">
                  <label className="micro-label">{m.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={v}
                    onChange={e => setResultMetrics(s => ({ ...s, [k]: e.target.value }))}
                    className="input mt-1 py-1.5"
                  />
                </div>
                <Compare delta={d} prev={prev} unit={m.unit} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button onClick={onNext}>
          Continuar a comentario <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Mini({ k, value }) {
  const m = METRIC_MAP[k];
  return (
    <div className="rounded-xl bg-muted p-2.5">
      <div className="text-[10px] text-muted-foreground">{m.label}</div>
      <div className="mt-0.5 font-heading text-sm font-semibold text-foreground tabular-nums">
        {value != null ? Math.round(value * 10) / 10 : '—'}
        {m.unit && <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{m.unit}</span>}
      </div>
    </div>
  );
}

function Compare({ delta, prev, unit }) {
  if (!delta || prev == null) {
    return <div className="w-24 shrink-0 text-right text-[11px] text-muted-foreground">Sin previa</div>;
  }
  const Icon = delta.delta > 0 ? TrendingUp : delta.delta < 0 ? TrendingDown : Minus;
  return (
    <div className={`w-24 shrink-0 text-right ${delta.improved ? 'text-primary' : 'text-warning'}`}>
      <div className="flex items-center justify-end gap-1 text-[11px] font-medium">
        <Icon className="h-3.5 w-3.5" /> {delta.delta > 0 ? '+' : ''}{delta.delta} {unit}
      </div>
      <div className="text-[10px] text-muted-foreground">prev: {Math.round(prev * 10) / 10}</div>
    </div>
  );
}