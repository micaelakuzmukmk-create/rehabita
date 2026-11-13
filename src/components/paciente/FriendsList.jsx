import React from 'react';
import { MessageCircle } from 'lucide-react';
import EmptyState from '@/components/ds/EmptyState';

export default function FriendsList({ friends, onOpen }) {
  if (friends.length === 0) {
    return (
      <EmptyState
        title="Todavía no tenés amigos en rehabilitación"
        description="Enviá una solicitud desde la pestaña Compañeros para acompañarse en el proceso."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {friends.map(({ friendship, patient }) => (
        <button
          key={friendship.id}
          onClick={() => onOpen(friendship.id)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-lavender"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-semibold text-primary">
              {(patient.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{patient.full_name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">En rehabilitación</div>
            </div>
          </div>
          <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}