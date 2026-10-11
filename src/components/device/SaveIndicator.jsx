import React from 'react';
import { AlertCircle, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const STATES = {
  idle: {
    label: 'Sin datos nuevos',
    icon: Clock3,
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  saving: {
    label: 'Guardando…',
    icon: Loader2,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  saved: {
    label: 'Guardado correcto',
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  error: {
    label: 'Error al guardar',
    icon: AlertCircle,
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export default function SaveIndicator({ status, savedCount, lastSavedAt, errorMessage }) {
  const s = STATES[status] || STATES.idle;
  const Icon = s.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-medium text-slate-700 mb-3">Guardado de datos</div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${s.badge}`}>
          <Icon className={`w-3.5 h-3.5 ${status === 'saving' ? 'animate-spin' : ''}`} />
          {s.label}
        </span>
        {status === 'error' && errorMessage && (
          <span className="text-xs text-rose-600">{errorMessage}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Registros guardados</div>
          <div className="text-xl font-semibold text-slate-900">{savedCount}</div>
          <div className="text-[11px] text-slate-400">en esta sesión</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Último registro</div>
          <div className="text-sm font-medium text-slate-900 mt-1">
            {lastSavedAt ? format(lastSavedAt, 'HH:mm:ss') : '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {lastSavedAt ? format(lastSavedAt, 'dd/MM/yyyy') : 'sin registros'}
          </div>
        </div>
      </div>
    </div>
  );
}