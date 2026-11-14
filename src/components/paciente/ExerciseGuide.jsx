import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import ExerciseFigure from './exercise/ExerciseFigure';
import FigureGenderToggle from './FigureGenderToggle';
import Chip from '@/components/ds/Chip';
import { Button } from '@/components/ui/button';
import { motionKeyFor, MOTIONS } from '@/lib/exerciseMotions';
import useFigureGender from '@/hooks/useFigureGender';

const DIFFICULTY = { baja: 'Baja', media: 'Media', alta: 'Alta' };

export default function ExerciseGuide({ exercise, side = 'derecha', onClose }) {
  const [playing, setPlaying] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const [speed, setSpeed] = useState(1);
  const { gender, setGender } = useFigureGender();

  useEffect(() => {
    if (!exercise) return undefined;
    setPlaying(true);
    setSpeed(1);
    setRestartKey((k) => k + 1);
  }, [exercise]);

  useEffect(() => {
    if (!exercise) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exercise, onClose]);

  if (!exercise) return null;

  const motionKey = motionKeyFor(exercise);
  const cfg = MOTIONS[motionKey] || MOTIONS.sentadilla;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 backdrop-blur-sm sm:items-center sm:p-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative z-10 max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card shadow-xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
          <div className="min-w-0">
            <div className="eyebrow">Guía visual del ejercicio</div>
            <h2 className="mt-1.5 font-heading text-[22px] font-semibold leading-tight tracking-tight text-foreground">
              {exercise.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {exercise.category && <Chip tone="cyan" className="capitalize">{exercise.category}</Chip>}
              {exercise.target_muscle && <Chip tone="primary">{exercise.target_muscle}</Chip>}
              {exercise.difficulty && <Chip tone="neutral">Dificultad {DIFFICULTY[exercise.difficulty] || exercise.difficulty}</Chip>}
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

        {/* Animación */}
        <div className="relative mt-4 bg-gradient-to-b from-white to-area-soft/60 px-3 py-4">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-area-ink shadow-sm">
              {cfg.label}
            </span>
          </div>
          <div className="absolute right-4 top-4 z-10">
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm">
              Pierna {side} · zona monitorizada
            </span>
          </div>

          <div className="h-[292px] w-full sm:h-[330px]">
            <ExerciseFigure
              motion={motionKey}
              playing={playing}
              restartKey={restartKey}
              speed={speed}
              gender={gender}
            />
          </div>
          <div className="relative mt-1 text-center text-[11px] font-medium text-muted-foreground">
            {cfg.caption}
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3 sm:px-6">
          <Button size="sm" variant={playing ? 'outline' : 'default'} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? 'Pausar' : 'Reproducir'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setRestartKey((k) => k + 1); setPlaying(true); }}>
            <RotateCcw className="h-3.5 w-3.5" /> Repetir
          </Button>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:inline">
              Ver como
            </span>
            <FigureGenderToggle gender={gender} onChange={setGender} />
            <div className="flex items-center gap-0.5 rounded-full border border-border p-0.5">
              {[1, 0.5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    speed === s ? 'bg-area-soft text-area-ink' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="eyebrow">Secuencia del movimiento</div>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {cfg.steps.map((step, i) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-area-soft text-[10px] font-semibold text-area-ink">
                  {i + 1}
                </span>
                <span className="text-[12px] leading-relaxed text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>

          {exercise.instructions && (
            <div className="mt-4 rounded-xl border border-border bg-muted/60 p-3.5">
              <div className="eyebrow">Indicación de tu kinesiólogo</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground">{exercise.instructions}</p>
            </div>
          )}

          {exercise.description && !exercise.instructions && (
            <p className="mt-4 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
              {exercise.description}
            </p>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            La animación es una demostración visual del movimiento. Seguí las indicaciones de tu kinesiólogo.
          </p>
        </div>
      </div>
    </div>
  );
}