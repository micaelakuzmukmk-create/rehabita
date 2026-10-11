import React from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { SESSION_STATUS_LABELS, formatDuration } from '@/lib/measurements';

const STATUS_STYLES = {
  activa: 'bg-emerald-50 text-emerald-700',
  finalizada: 'bg-slate-100 text-slate-600',
  interrumpida: 'bg-rose-50 text-rose-700',
};

function fmtDate(value) {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm');
  } catch {
    return value;
  }
}

export default function MeasurementSessionList({ sessions, selectedId, onSelect }) {
  if (sessions.length === 0) {
    return <div className="text-sm text-slate-400">Este paciente todavía no tiene mediciones registradas.</div>;
  }

  return (
    <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
      {sessions.map((s) => {
        const active = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition ${active ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{fmtDate(s.started_at)}</div>
                    <div className="text-[11px] text-slate-500">
                      Duración {formatDuration(s.started_at, s.ended_at)} · {s.sample_count ?? 0} muestras
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.simulated !== false && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Simulado
                    </span>
                  )}
                  <span className={`text-[11px] px-2 py-1 rounded-full ${STATUS_STYLES[s.status] || 'bg-slate-100 text-slate-600'}`}>
                    {SESSION_STATUS_LABELS[s.status] || s.status}
                  </span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}