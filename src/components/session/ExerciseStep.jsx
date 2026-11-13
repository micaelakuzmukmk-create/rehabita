import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import Nav from './Nav';

const PHASE_CATEGORIES = {
  proteccion: ['movilidad', 'estiramiento'],
  movilidad: ['movilidad', 'estiramiento'],
  fuerza: ['fuerza'],
  propiocepcion: ['propiocepcion'],
  retorno_deportivo: ['potencia', 'retorno_deportivo'],
};

export default function ExerciseStep({ exercises, selected, toggle, phase, onBack, onNext }) {
  const suggested = PHASE_CATEGORIES[phase] || [];
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-foreground">Seleccioná los ejercicios de la sesión</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {selected.length} seleccionados · los sugeridos corresponden a la etapa
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {exercises.map(ex => {
          const on = selected.includes(ex.id);
          const isSuggested = suggested.includes(ex.category);
          return (
            <button
              key={ex.id}
              onClick={() => toggle(ex.id)}
              className={`rounded-xl border p-3.5 text-left transition-colors ${
                on ? 'border-brand-lavender bg-brand-soft' : 'border-border bg-card hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${on ? 'text-primary' : 'text-foreground'}`}>{ex.name}</span>
                {on ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                ) : isSuggested ? (
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
                ) : null}
              </div>
              <div className="mt-1 text-[11px] capitalize text-muted-foreground">{ex.category} · {ex.difficulty}</div>
            </button>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} nextDisabled={selected.length === 0} />
    </div>
  );
}