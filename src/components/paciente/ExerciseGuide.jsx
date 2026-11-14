import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import Chip from '@/components/ds/Chip';

const VARIANT_BY_CATEGORY = {
  fuerza: 'squat',
  potencia: 'squat',
  propiocepcion: 'balance',
  retorno_deportivo: 'balance',
  movilidad: 'swing',
  estiramiento: 'swing',
};

const MOVEMENT = {
  squat: { rotate: [0, 24, 0], y: [0, 5, 0] },
  balance: { rotate: [-3, 6, -3], y: [0, 2, 0] },
  swing: { rotate: [-16, 28, -16], y: 0 },
};

const GENERIC_STEPS = ['Posición inicial', 'Realizar el movimiento', 'Posición final'];

const DIFFICULTY_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta' };

function ExerciseFigure({ variant }) {
  const movement = MOVEMENT[variant] || MOVEMENT.squat;

  return (
    <svg viewBox="0 0 160 230" className="h-[230px] w-auto" role="img" aria-label="Demostración visual del ejercicio">
      <defs>
        <marker id="exercise-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--area-ink))" />
        </marker>
      </defs>

      <line x1="30" y1="210" x2="130" y2="210" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="3 4" />

      {/* Cuerpo estable */}
      <g fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.5" strokeWidth="7" strokeLinecap="round">
        <circle cx="70" cy="34" r="12" />
        <path d="M70 46 V 110" />
        <path d="M70 66 L 46 96" />
        <path d="M70 66 L 94 96" />
        <path d="M70 110 L 58 162 L 54 208" />
      </g>

      {/* Pierna en movimiento */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'top center' }}
        animate={movement}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M70 110 L 78 160 L 82 208"
          fill="none"
          stroke="hsl(var(--area-ink))"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="78" cy="160" r="13" fill="hsl(var(--area-accent) / 0.18)" />
        <circle cx="78" cy="160" r="6" fill="hsl(var(--area-accent))" />
      </motion.g>

      {/* Trayectoria del movimiento */}
      <path
        d="M108 172 A 46 46 0 0 1 108 122"
        fill="none"
        stroke="hsl(var(--area-ink) / 0.45)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        markerEnd="url(#exercise-arrow)"
      />
    </svg>
  );
}

export default function ExerciseGuide({ exercise, onClose }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!exercise) return undefined;
    setStep(0);
    const timer = setInterval(() => setStep((s) => (s + 1) % GENERIC_STEPS.length), 1600);
    return () => clearInterval(timer);
  }, [exercise]);

  useEffect(() => {
    if (!exercise) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exercise, onClose]);

  if (!exercise) return null;

  const variant = VARIANT_BY_CATEGORY[exercise.category] || 'squat';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow">Guía de ejecución</div>
            <h2 className="mt-1.5 truncate font-heading text-xl font-semibold tracking-tight text-foreground">
              {exercise.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {exercise.category && <Chip tone="cyan" className="capitalize">{exercise.category}</Chip>}
              {exercise.difficulty && <Chip tone="neutral">Dificultad {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}</Chip>}
              {exercise.target_muscle && <Chip tone="primary">{exercise.target_muscle}</Chip>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar guía"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex justify-center rounded-2xl bg-area-soft/60 py-4">
          <ExerciseFigure variant={variant} />
        </div>

        <ol className="mt-5 space-y-2">
          {GENERIC_STEPS.map((label, index) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                  index === step ? 'bg-area-accent text-slate-900' : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>
              <span className={`text-[13px] ${index === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </li>
          ))}
        </ol>

        {(exercise.instructions || exercise.description) && (
          <p className="mt-4 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
            {exercise.instructions || exercise.description}
          </p>
        )}
      </div>
    </div>
  );
}