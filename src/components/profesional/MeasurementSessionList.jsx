import React from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { SESSION_STATUS_LABELS, formatDuration } from '@/lib/measurements';
import Chip from '@/components/ds/Chip';

const STATUS_TONES = {
  activa: 'success',
  finalizada: 'neutral',
  interrumpida: 'danger',
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
    return <div className="text-sm text-muted-foreground">Este paciente todavía no tiene mediciones registradas.</div>;
  }

  return (
    <ul className="max-h-96 divide-y divide-border overflow-y-auto">
      {sessions.map((s) => {
        const active = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
                active ? 'bg-brand-soft' : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <CalendarClock className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="min-w-0">
                    <div className={`truncate text-[13px] font-medium ${active ? 'text-primary' : 'text-foreground'}`}>
                      {fmtDate(s.started_at)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Duración {formatDuration(s.started_at, s.ended_at)} · {s.sample_count ?? 0} muestras
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {s.simulated !== false && <Chip tone="warning">Simulado</Chip>}
                  <Chip tone={STATUS_TONES[s.status] || 'neutral'}>
                    {SESSION_STATUS_LABELS[s.status] || s.status}
                  </Chip>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}