import React from 'react';
import { Play } from 'lucide-react';
import Chip from '@/components/ds/Chip';

const DIFFICULTY_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta' };

export default function ExerciseCard({ exercise, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(exercise)}
      className="group relative flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-area-accent/60 sm:p-5"
    >
      <span aria-hidden="true" className="absolute left-0 top-5 h-8 w-[3px] rounded-r-full bg-area-accent" />

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
        {exercise.difficulty && (
          <Chip tone="neutral" className="shrink-0 bg-muted">
            {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
          </Chip>
        )}
      </div>

      {exercise.description && (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{exercise.description}</p>
      )}

      <span className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium text-area-ink">
        <Play className="h-3.5 w-3.5" /> Ver ejercicio
      </span>
    </button>
  );
}