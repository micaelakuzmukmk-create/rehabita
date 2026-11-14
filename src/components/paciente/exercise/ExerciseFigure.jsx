import React, { useEffect, useMemo, useRef } from 'react';
import SideFigure from './SideFigure';
import FrontFigure from './FrontFigure';
import { MOTIONS } from '@/lib/exerciseMotion';

/**
 * Figura humana de línea con movimiento real (SVG animado).
 * `playing` pausa/reanuda la línea de tiempo; `restartKey` reinicia el ciclo;
 * `speed` escala la duración del ciclo (0.5x / 1x).
 */
export default function ExerciseFigure({ motion = 'squat', side = 'derecha', playing = true, restartKey = 0, speed = 1 }) {
  const base = MOTIONS[motion] || MOTIONS.squat;
  const cfg = useMemo(() => ({ ...base, dur: base.dur / speed }), [base, speed]);
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== 'function') return;
    if (playing) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [playing, restartKey, motion, speed]);

  const figureKey = `${restartKey}-${speed}`;

  return (
    <div className="flex h-full w-full items-center justify-center">
      {cfg.view === 'frontal' ? (
        <FrontFigure key={figureKey} cfg={cfg} svgRef={svgRef} side={side} />
      ) : (
        <SideFigure key={figureKey} cfg={cfg} svgRef={svgRef} />
      )}
    </div>
  );
}