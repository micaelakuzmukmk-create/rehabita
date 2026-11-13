import React from 'react';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { PHASE_LABELS } from '@/lib/rehbaita';
import Chip from '@/components/ds/Chip';
import { Button } from '@/components/ui/button';

export default function PatientStep({ patient, plan, sessionsCount, onBack, onNext }) {
  if (!patient) return <div className="text-sm text-muted-foreground">Cargando…</div>;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="eyebrow">Paciente</div>
            <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight text-foreground">{patient.full_name}</h2>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{sessionsCount} sesiones previas</div>
          </div>
          <Chip tone="primary">Rodilla {patient.injury_side}</Chip>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Info label="Lesión" value={patient.injury_date ? format(new Date(patient.injury_date), 'dd/MM/yyyy') : '—'} />
          <Info label="Estado" value={patient.status} />
          <Info label="Etapa actual" value={plan ? PHASE_LABELS[plan.current_phase] : '—'} />
          <Info label="Plan activo" value={plan ? plan.title : 'Sin plan'} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>Cancelar</Button>
        )}
        <Button onClick={onNext} className="ml-auto">
          Comenzar <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="micro-label">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}