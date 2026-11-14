import React from 'react';
import { Play } from 'lucide-react';
import Chip from '@/components/ds/Chip';
import ExerciseFigure from '@/components/paciente/exercise/ExerciseFigure';
import { motionKeyFor } from '@/lib/exerciseMotions';
import useFigureGender from '@/hooks/useFigureGender';

const DIFFICULTY = { baja: 'Baja', media: 'Media', alta: 'Alta' };
const STATUS_TONE = { pendiente: 'neutral', en_progreso: 'cyan', completado: 'primary', completada: 'primary' };

export default function ExerciseCard({ exercise, onOpen }) {
  const { gender } = useFigureGender();
  const meta = [
    exercise.series ? `${exercise.series} series` : null,
    exercise.repetitions ? `${exercise.repetitions} rep.` : null,
    exercise.duration_seconds ? `${exercise.duration_seconds} seg` : null,
    exercise.frequency || null,
  ].filter(Boolean);

  const progress = typeof exercise.progress === 'number' ? Math.max(0, Math.min(100, exercise.progress)) : null;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(exercise)}
      className="group relative flex w-full gap-3.5 overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-area-accent/60 sm:p-5"
    >
      <span aria-hidden="true" className="absolute left-0 top-4 h-9 w-[3px] rounded-r-full bg-area-accent" />

      {/* Miniatura animada: la misma representación que verá al abrir la guía */}
      <div className="h-[78px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-area-soft/50">
        <ExerciseFigure motion={motionKeyFor(exercise)} gender={gender} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-[15px] font-semibold leading-tight tracking-tight text-foreground">
              {exercise.name}
            </h3>
            <div className="mt-1.5 text-[11px] capitalize text-muted-foreground">
              {exercise.category}
              {exercise.target_muscle ? ` · ${exercise.target_muscle}` : ''}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {exercise.difficulty && (
              <Chip tone="neutral" className="bg-muted">{DIFFICULTY[exercise.difficulty] || exercise.difficulty}</Chip>
            )}
            {exercise.status && (
              <Chip tone={STATUS_TONE[exercise.status] || 'neutral'} dot className="capitalize">{exercise.status}</Chip>
            )}
          </div>
        </div>

        {meta.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-foreground">
            {meta.map((m) => <span key={m}>{m}</span>)}
          </div>
        )}

        {progress != null && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-area-accent" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">{Math.round(progress)}% del objetivo</div>
          </div>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[12px] font-medium text-area-ink">
          <Play className="h-3.5 w-3.5" /> Ver ejercicio
        </span>
      </div>
    </button>
  );
}