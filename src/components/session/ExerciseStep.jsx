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
        <div className="text-sm text-slate-700">Seleccioná los ejercicios de la sesión</div>
        <div className="text-xs text-slate-500 mt-1">{selected.length} seleccionados · los sugeridos corresponden a la etapa</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {exercises.map(ex => {
          const on = selected.includes(ex.id);
          const isSuggested = suggested.includes(ex.category);
          return (
            <button
              key={ex.id}
              onClick={() => toggle(ex.id)}
              className={`text-left rounded-xl border p-3 transition ${on ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-slate-900">{ex.name}</span>
                {on ? <Check className="w-4 h-4 text-emerald-600" /> : isSuggested && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 capitalize">{ex.category} · {ex.difficulty}</div>
            </button>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} nextDisabled={selected.length === 0} />
    </div>
  );
}