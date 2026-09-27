import React, { useState } from 'react';
import { Gauge, Check, Loader2 } from 'lucide-react';
import Nav from './Nav';

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
      <div className="flex items-center gap-2 text-slate-700"><Gauge className="w-4 h-4" /> Calibración del dispositivo</div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {!calibration && !busy && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-3">Coloque el dispositivo en reposo y comience la calibración.</p>
            <button onClick={run} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white">Iniciar calibración</button>
          </div>
        )}
        {busy && (
          <div className="flex items-center justify-center gap-3 text-sm text-slate-600 py-6">
            <Loader2 className="w-5 h-5 animate-spin" /> Calibrando sensores…
          </div>
        )}
        {calibration && (
          <div>
            <div className="grid grid-cols-3 gap-3">
              <Base label="Simetría base" value={calibration.baseline_symmetry} unit="%" />
              <Base label="Estabilidad base" value={calibration.baseline_stability} unit="" />
              <Base label="Carga base" value={calibration.baseline_load} unit="%" />
            </div>
            <div className="text-xs text-emerald-600 mt-3 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Calibración exitosa</div>
          </div>
        )}
      </div>
      <Nav onBack={onBack} onNext={onNext} nextDisabled={!calibration} />
    </div>
  );
}

function Base({ label, value, unit }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}<span className="text-xs text-slate-400 ml-1">{unit}</span></div>
    </div>
  );
}