import React from 'react';

const SURFACE = 'hsl(var(--muted))';
const LINE = 'hsl(var(--border))';
const EDGE = 'hsl(var(--foreground) / 0.14)';

/** Escenario del ejercicio: piso, step, banco, camilla, base inestable, slider o máquina. */
export default function Scene({ motion }) {
  const { env = 'ground', frame } = motion;
  const { ground, hip, vb } = frame;
  const width = Number(vb.split(' ')[2]);

  return (
    <g>
      {env === 'mat' && (
        <rect x="8" y={ground - 6} width={width - 16} height="16" rx="8" fill={SURFACE} stroke={LINE} strokeWidth="1.5" />
      )}

      {env === 'step' && (
        <g>
          <rect x="52" y={ground - 40} width="118" height="40" rx="7" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
          <line x1="52" y1={ground - 40} x2="170" y2={ground - 40} stroke={EDGE} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {env === 'box' && (
        <g>
          <rect x="196" y={ground - 70} width="98" height="70" rx="7" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
          <line x1="196" y1={ground - 70} x2="294" y2={ground - 70} stroke={EDGE} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {env === 'pivot' && (
        <path
          d={`M ${hip[0] - 42} ${ground} C ${hip[0] - 34} ${ground - 15} ${hip[0] + 34} ${ground - 15} ${hip[0] + 42} ${ground} Z`}
          fill={SURFACE}
          stroke={EDGE}
          strokeWidth="1.5"
        />
      )}

      {env === 'slider' && (
        <ellipse cx={hip[0] + 58} cy={ground - 6} rx="30" ry="8" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
      )}

      {env === 'machine' && (
        <g>
          {/* Respaldo y asiento */}
          <rect x="24" y="104" width="17" height="92" rx="7" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
          <rect x="18" y={hip[1] + 8} width="112" height="16" rx="7" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
          {/* Riel y plataforma */}
          <line x1="120" y1={hip[1] + 40} x2="268" y2={hip[1] + 40} stroke={LINE} strokeWidth="3" strokeLinecap="round" />
          <rect x="262" y={hip[1] - 36} width="13" height="108" rx="5" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
        </g>
      )}

      {env !== 'mat' && (
        <line x1="6" y1={ground} x2={width - 6} y2={ground} stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      )}

      <ellipse cx={hip[0]} cy={ground - 1} rx="46" ry="5" fill="hsl(var(--foreground) / 0.06)" />
    </g>
  );
}