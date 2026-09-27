import React from 'react';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { PHASE_LABELS } from '@/lib/rehbaita';

export default function PatientStep({ patient, plan, sessionsCount, onBack, onNext }) {
  if (!patient) return <div className="text-sm text-slate-400">Cargando…</div>;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{patient.full_name}</h2>
            <div className="text-sm text-slate-500 mt-0.5">{sessionsCount} sesiones previas</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-600 capitalize">Rodilla {patient.injury_side}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <Info label="Lesión" value={patient.injury_date ? format(new Date(patient.injury_date), 'dd/MM/yyyy') : '—'} />
          <Info label="Estado" value={patient.status} />
          <Info label="Etapa actual" value={plan ? PHASE_LABELS[plan.current_phase] : '—'} />
          <Info label="Plan activo" value={plan ? plan.title : 'Sin plan'} />
        </div>
      </div>
      <div className="flex justify-between items-center pt-1">
        {onBack && (
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">Cancelar</button>
        )}
        <button onClick={onNext} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white inline-flex items-center gap-1.5 ml-auto">
          Comenzar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-white border border-slate-100 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm text-slate-900 mt-0.5 capitalize">{value}</div>
    </div>
  );
}