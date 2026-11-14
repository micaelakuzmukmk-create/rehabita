import React from 'react';
import { FRONT, FIGURE_COLORS as C } from '@/lib/bodyPaths';

/**
 * Esquema corporal estático (figura de línea, vista frontal) con la rodilla
 * del lado lesionado destacada. Sin datos clínicos: solo ubica la zona.
 */
export default function BodyFigure({ side = 'derecha', className, showLabel = true }) {
  const isLeft = String(side).toLowerCase().startsWith('i');
  const kneeX = isLeft ? -16 : 16;

  return (
    <div className={`flex flex-col items-center ${className || ''}`}>
      <svg
        viewBox="-58 -160 116 380"
        className="h-full w-auto"
        role="img"
        aria-label={`Esquema corporal · rodilla ${side}`}
      >
        <line x1="-42" y1="196" x2="42" y2="196" stroke="#D8D6E2" strokeWidth="1.6" strokeDasharray="4 6" />

        {/* Piernas */}
        {[-16, 16].map((x) => (
          <g key={x} transform={`translate(${x},0)`}>
            <path d={FRONT.thigh} fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
            <g transform={`translate(0,${FRONT.knee.y})`}>
              <path d={FRONT.kneeLine} fill="none" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
              <path d={FRONT.shin} fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
              <g transform={`translate(0,${FRONT.knee.ankle})`}>
                <path d={FRONT.foot} fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
              </g>
            </g>
          </g>
        ))}

        {/* Torso y brazos */}
        <g transform="translate(-30,-90)">
          <path d={FRONT.upperArm} fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinejoin="round" />
          <g transform="translate(0,42)">
            <path d={FRONT.foreArm} fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinejoin="round" />
          </g>
        </g>
        <g transform="translate(30,-90)">
          <path d={FRONT.upperArm} fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinejoin="round" />
          <g transform="translate(0,42)">
            <path d={FRONT.foreArm} fill="none" stroke={C.muted} strokeWidth="2.2" strokeLinejoin="round" />
          </g>
        </g>

        <path d={FRONT.torso} fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
        <path d={FRONT.pelvis} fill="none" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
        <path d={FRONT.neck} fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
        <path d={FRONT.head} fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />

        {/* Rodilla destacada */}
        <circle cx={kneeX} cy={FRONT.knee.y} r="14" fill={C.cyan} opacity="0.2" />
        <circle
          cx={kneeX}
          cy={FRONT.knee.y}
          r="20"
          fill="none"
          stroke={C.cyan}
          strokeWidth="1.2"
          opacity="0.55"
          strokeDasharray="3 4"
        />
        <circle cx={kneeX} cy={FRONT.knee.y} r="5" fill={C.cyan} />
      </svg>

      {showLabel && (
        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Rodilla {side}</div>
      )}
    </div>
  );
}