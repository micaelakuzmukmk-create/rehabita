import React from 'react';
import { Play, Loader2, ArrowLeft } from 'lucide-react';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { Button } from '@/components/ui/button';

export default function StartStep({ patient, phase, exerciseNames, device, calibration, starting, onStart, onBack }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-foreground">Revisá el resumen y habilitá la sesión para iniciar la medición en tiempo real.</div>
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <Row label="Paciente" value={patient.full_name} />
        <Row label="Etapa" value={PHASE_LABELS[phase]} />
        <Row label="Ejercicios" value={`${exerciseNames.length} · ${exerciseNames.join(', ') || '—'}`} />
        <Row label="Dispositivo" value={device?.name || '—'} />
        {calibration && (
          <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
            <Mini label="Simetría base" value={`${calibration.baseline_symmetry}%`} />
            <Mini label="Estabilidad base" value={calibration.baseline_stability} />
            <Mini label="Carga base" value={`${calibration.baseline_load}%`} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button onClick={onStart} disabled={starting}>
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {starting ? 'Iniciando…' : 'Iniciar sesión'}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-muted p-2.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-heading text-sm font-semibold text-foreground tabular-nums">{value}</div>
    </div>
  );
}