import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Esquema corporal técnico (no anatómico): ubica la rodilla trabajada
 * y el lado lesionado sin depender de imágenes externas.
 */
export default function BodyFigure({ side = 'derecha', className, animated = true, showLabel = true }) {
  const isLeft = String(side).toLowerCase().startsWith('i');
  const affectedKnee = isLeft ? { x: 76, y: 148 } : { x: 44, y: 148 };
  const healthyLeg = isLeft ? 'M60 96 L 44 148 L 40 202' : 'M60 96 L 76 148 L 80 202';
  const affectedLeg = isLeft ? 'M60 96 L 76 148 L 80 202' : 'M60 96 L 44 148 L 40 202';

  return (
    <svg
      viewBox="0 0 120 224"
      className={cn('h-full w-auto', className)}
      role="img"
      aria-label={`Esquema corporal · rodilla ${side}`}
    >
      {/* Referencia de piso */}
      <line x1="18" y1="206" x2="102" y2="206" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="3 4" />

      {/* Cabeza, tronco y brazos */}
      <g fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round">
        <circle cx="60" cy="26" r="11" />
        <path d="M60 38 V 96" />
        <path d="M60 56 L 34 84" />
        <path d="M60 56 L 86 84" />
      </g>

      {/* Pierna sana */}
      <path
        d={healthyLeg}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeOpacity="0.45"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Pierna afectada */}
      <path d={affectedLeg} fill="none" stroke="hsl(var(--area-ink))" strokeWidth="7" strokeLinecap="round" />

      {/* Rodilla trabajada */}
      <circle cx={affectedKnee.x} cy={affectedKnee.y} r="15" fill="hsl(var(--area-accent) / 0.16)">
        {animated && <animate attributeName="r" values="13;17;13" dur="3s" repeatCount="indefinite" />}
      </circle>
      <circle cx={affectedKnee.x} cy={affectedKnee.y} r="6.5" fill="hsl(var(--area-accent))" />
      <circle cx={affectedKnee.x} cy={affectedKnee.y} r="11" fill="none" stroke="hsl(var(--area-accent) / 0.55)" strokeWidth="1.5" />

      {showLabel && (
        <text
          x="60"
          y="220"
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Rodilla {side}
        </text>
      )}
    </svg>
  );
}