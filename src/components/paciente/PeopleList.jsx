import React from 'react';
import { Check, Clock, UserPlus } from 'lucide-react';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { elapsedSince } from '@/lib/format';
import Chip from '@/components/ds/Chip';
import { Button } from '@/components/ui/button';

export default function PeopleList({ people, plansByPatient, friendIds, pendingIds, onConnect }) {
  if (people.length === 0) {
    return <div className="text-sm text-muted-foreground">Todavía no hay otros pacientes en rehabilitación.</div>;
  }

  return (
    <div className="space-y-2.5">
      {people.map((person) => {
        const plan = plansByPatient[person.id];
        const since = elapsedSince(person.injury_date);
        const isFriend = friendIds.has(person.id);
        const isPending = pendingIds.has(person.id);

        return (
          <div key={person.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-semibold text-muted-foreground">
                {(person.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{person.full_name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {PHASE_LABELS[plan?.current_phase] || 'En rehabilitación'}
                  {since ? ` · hace ${since} desde la lesión` : ''}
                </div>
              </div>
            </div>

            {isFriend ? (
              <Chip tone="success" className="shrink-0"><Check className="h-3 w-3" /> Amigos</Chip>
            ) : isPending ? (
              <Chip tone="warning" className="shrink-0"><Clock className="h-3 w-3" /> Pendiente</Chip>
            ) : (
              <Button size="sm" onClick={() => onConnect(person)} className="shrink-0">
                <UserPlus className="h-3.5 w-3.5" /> Conectar
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}