import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import Chip from '@/components/ds/Chip';
import EmptyState from '@/components/ds/EmptyState';
import { format, parseISO } from 'date-fns';

const STATUS_TONE = {
  completada: 'success',
  en_progreso: 'cyan',
  calibrando: 'cyan',
  programada: 'neutral',
  cancelada: 'danger',
};

const STATUS_LABEL = {
  completada: 'Completada',
  en_progreso: 'En progreso',
  calibrando: 'Calibrando',
  programada: 'Programada',
  cancelada: 'Cancelada',
};

export default function RecentSessions({ sessions = [], nameById = {} }) {
  if (sessions.length === 0) {
    return <EmptyState title="Sin sesiones" description="Todavía no hay sesiones registradas." />;
  }

  return (
    <ul className="divide-y divide-border">
      {sessions.map((session) => (
        <li key={session.id}>
          <Link
            to={`/kinesiologo/sesion/${session.id}`}
            className="group flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-secondary group-hover:text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-foreground">
                  {nameById[session.patient_id] || 'Paciente'}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {format(parseISO(session.date), "dd/MM/yyyy · HH:mm")}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Chip tone={STATUS_TONE[session.status] || 'neutral'}>
                {STATUS_LABEL[session.status] || session.status}
              </Chip>
              <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}