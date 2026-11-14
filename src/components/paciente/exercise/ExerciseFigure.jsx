import React, { useEffect, useId, useRef } from 'react';
import SilhouetteSide from './SilhouetteSide';
import SilhouetteFront from './SilhouetteFront';
import Scene from './Scene';
import { MOTIONS } from '@/lib/exerciseMotions';

/**
 * Escena animada del ejercicio: silueta con volumen + escenario propio
 * (step, banda, banco, camilla, base, máquina) según el nombre del ejercicio.
 * La variante corporal (mujer / hombre) se elige por preferencia del paciente.
 */
export default function ExerciseFigure({
  motion = 'sentadilla',
  playing = true,
  restartKey = 0,
  speed = 1,
  gender = 'hombre',
}) {
  const cfg = MOTIONS[motion] || MOTIONS.sentadilla;
  const dur = cfg.dur / speed;
  const svgRef = useRef(null);
  const uid = useId().replace(/[:]/g, '');

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== 'function') return;
    if (playing) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [playing, restartKey, motion, speed, gender]);

  const work = cfg.view === 'front' && cfg.work === 'near' ? 'left' : cfg.work;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        key={`${restartKey}-${speed}-${gender}`}
        ref={svgRef}
        viewBox={cfg.frame.vb}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Animación del ejercicio: ${cfg.caption}`}
      >
        <defs>
          <marker id={`arrow-${uid}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--brand-cyan) / 0.8)" />
          </marker>
        </defs>

        <Scene motion={cfg} />

        {cfg.arc && (
          <path
            d={cfg.arc}
            fill="none"
            stroke="hsl(var(--brand-cyan) / 0.75)"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
            markerEnd={`url(#arrow-${uid})`}
          />
        )}

        {cfg.view === 'front' ? (
          <SilhouetteFront
            poses={cfg.poses}
            dur={dur}
            keyTimes={cfg.keyTimes}
            splines={cfg.splines}
            work={work}
            env={cfg.env}
            hip={cfg.frame.hip}
            gender={gender}
          />
        ) : (
          <SilhouetteSide
            poses={cfg.poses}
            dur={dur}
            keyTimes={cfg.keyTimes}
            splines={cfg.splines}
            work={work}
            hip={cfg.frame.hip}
            gender={gender}
            pad={!!cfg.pad}
          />
        )}
      </svg>
    </div>
  );
}