import React from 'react';
import { Check } from 'lucide-react';
import Nav from './Nav';

const PHASES = [
  { key: 'proteccion', label: 'Protección', desc: 'Control del dolor e inflamación, protección articular.' },
  { key: 'movilidad', label: 'Movilidad', desc: 'Recuperar rango de movimiento de la rodilla.' },
  { key: 'fuerza', label: 'Fuerza', desc: 'Fortalecimiento muscular progresivo.' },
  { key: 'propiocepcion', label: 'Propiocepción', desc: 'Equilibrio, estabilidad y control neuromuscular.' },
  { key: 'retorno_deportivo', label: 'Retorno deportivo', desc: 'Potencia, agilidad y vuelta a la actividad.' },
];

export default function PhaseStep({ phase, setPhase, plan, onBack, onNext }) {
  const current = plan ? PHASES.find(p => p.key === plan.current_phase)?.label : null;
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-foreground">Seleccioná la etapa de rehabilitación de esta sesión</div>
        {current && <div className="mt-1 text-[11px] text-muted-foreground">Etapa actual del plan: <span className="font-medium text-primary">{current}</span></div>}
      </div>
      <div className="space-y-2">
        {PHASES.map(p => {
          const on = phase === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                on ? 'border-brand-lavender bg-brand-soft' : 'border-border bg-card hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm font-medium ${on ? 'text-primary' : 'text-foreground'}`}>{p.label}</span>
                {on && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{p.desc}</div>
            </button>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} />
    </div>
  );
}