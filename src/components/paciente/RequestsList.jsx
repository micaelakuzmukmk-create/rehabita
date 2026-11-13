import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import Chip from '@/components/ds/Chip';
import { Button } from '@/components/ui/button';

export default function RequestsList({ incoming, outgoing, patientById, onRespond }) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="section-title mb-3">Solicitudes recibidas</h3>
        {incoming.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tenés solicitudes pendientes.</div>
        ) : (
          <div className="space-y-2.5">
            {incoming.map((friendship) => {
              const person = patientById[friendship.requester_patient_id];
              return (
                <div key={friendship.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-semibold text-primary">
                      {(person?.full_name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{person?.full_name || 'Paciente'}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">Quiere conectar con vos</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="sm" onClick={() => onRespond(friendship, 'aceptada')}>
                      <Check className="h-3.5 w-3.5" /> Aceptar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRespond(friendship, 'rechazada')}>
                      <X className="h-3.5 w-3.5" /> Rechazar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="section-title mb-3">Solicitudes enviadas</h3>
        {outgoing.length === 0 ? (
          <div className="text-sm text-muted-foreground">No enviaste solicitudes pendientes.</div>
        ) : (
          <div className="space-y-2.5">
            {outgoing.map((friendship) => {
              const person = patientById[friendship.addressee_patient_id];
              return (
                <div key={friendship.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{person?.full_name || 'Paciente'}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Esperando respuesta</div>
                  </div>
                  <Chip tone="warning"><Clock className="h-3 w-3" /> Pendiente</Chip>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}