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
        <div className="text-sm text-slate-700">Seleccioná la etapa de rehabilitación de esta sesión</div>
        {current && <div className="text-xs text-slate-500 mt-1">Etapa actual del plan: <span className="font-medium text-slate-700">{current}</span></div>}
      </div>
      <div className="space-y-2">
        {PHASES.map(p => {
          const on = phase === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={`w-full text-left rounded-xl border p-4 transition ${on ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{p.label}</span>
                {on && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs text-slate-500 mt-1">{p.desc}</div>
            </button>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} />
    </div>
  );
}