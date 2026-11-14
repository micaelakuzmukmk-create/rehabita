import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ds/EmptyState';
import { format, parseISO } from 'date-fns';

export default function FollowUpList({ items = [] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sin pacientes pendientes"
        description="Todos los pacientes activos tienen una sesión reciente registrada."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map(({ patient, sessionCount, lastSession }) => (
        <li
          key={patient.id}
          className="flex flex-col gap-2.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="min-w-0">
            <div className="truncate font-heading text-[15px] font-semibold tracking-tight text-foreground">
              {patient.full_name}
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Sesión {sessionCount} · Rodilla {patient.injury_side}
              {lastSession
                ? ` · última ${format(parseISO(lastSession.date), 'dd/MM/yyyy')}`
                : ' · sin sesiones registradas'}
            </div>
          </div>

          <Link to={`/kinesiologo/paciente/${patient.id}`} className="shrink-0">
            <Button variant="outline" size="sm">
              Ver paciente <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </li>
      ))}
    </ul>
  );
}