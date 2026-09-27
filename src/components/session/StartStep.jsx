import React from 'react';
import { Play, Loader2, ArrowLeft } from 'lucide-react';
import { PHASE_LABELS } from '@/lib/rehbaita';

export default function StartStep({ patient, phase, exerciseNames, device, calibration, starting, onStart, onBack }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-700">Revisá el resumen y habilitá la sesión para iniciar la medición en tiempo real.</div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <Row label="Paciente" value={patient.full_name} />
        <Row label="Etapa" value={PHASE_LABELS[phase]} />
        <Row label="Ejercicios" value={`${exerciseNames.length} · ${exerciseNames.join(', ') || '—'}`} />
        <Row label="Dispositivo" value={device?.name || '—'} />
        {calibration && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
            <Mini label="Simetría base" value={`${calibration.baseline_symmetry}%`} />
            <Mini label="Estabilidad base" value={calibration.baseline_stability} />
            <Mini label="Carga base" value={`${calibration.baseline_load}%`} />
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pt-1">
        <button onClick={onBack} className="text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>
        <button onClick={onStart} disabled={starting} className="text-sm px-5 py-2.5 rounded-lg bg-emerald-600 text-white disabled:opacity-40 inline-flex items-center gap-1.5">
          {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {starting ? 'Iniciando…' : 'Iniciar sesión'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value}</span>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}