import React, { useState } from 'react';
import { Gauge, Check, Loader2 } from 'lucide-react';
import Nav from './Nav';
import { Button } from '@/components/ui/button';

export default function CalibrationStep({ calibration, setCalibration, onBack, onNext }) {
  const [busy, setBusy] = useState(false);

  function run() {
    setBusy(true);
    setTimeout(() => {
      setCalibration({
        baseline_symmetry: Math.round((60 + Math.random() * 15) * 10) / 10,
        baseline_stability: Math.round((55 + Math.random() * 15) * 10) / 10,
        baseline_load: Math.round((58 + Math.random() * 12) * 10) / 10,
        status: 'exitosa',
      });
      setBusy(false);
    }, 1400);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Gauge className="h-4 w-4 text-primary" /> Calibración del dispositivo
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        {!calibration && !busy && (
          <div className="py-6 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Coloque el dispositivo en reposo y comience la calibración.</p>
            <Button onClick={run}>Iniciar calibración</Button>
          </div>
        )}
        {busy && (
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Calibrando sensores…
          </div>
        )}
        {calibration && (
          <div>
            <div className="grid grid-cols-3 gap-2.5">
              <Base label="Simetría base" value={calibration.baseline_symmetry} unit="%" />
              <Base label="Estabilidad base" value={calibration.baseline_stability} unit="" />
              <Base label="Carga base" value={calibration.baseline_load} unit="%" />
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" /> Calibración exitosa
            </div>
          </div>
        )}
      </div>
      <Nav onBack={onBack} onNext={onNext} nextDisabled={!calibration} />
    </div>
  );
}

function Base({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="micro-label">{label}</div>
      <div className="mt-1 font-heading text-lg font-semibold text-foreground tabular-nums">
        {value}<span className="ml-0.5 text-[11px] font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}