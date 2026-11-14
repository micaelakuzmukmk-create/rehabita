import React from 'react';
import { FRONT, FIGURE_COLORS as C } from '@/lib/bodyPaths';

const rot = (angles) => angles.map((a) => `${a} 0 0`).join(';');

function Anim({ values, cfg, type = 'rotate' }) {
  return (
    <animateTransform
      attributeName="transform"
      type={type}
      values={values}
      keyTimes={cfg.keyTimes.join(';')}
      dur={`${cfg.dur}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines={cfg.splines}
    />
  );
}

function Leg({ cfg, x, thigh, knee, foot, stroke, highlight }) {
  return (
    <g transform={`translate(${x},0)`}>
      <g>
        <Anim values={rot(thigh)} cfg={cfg} />
        {highlight && <circle cx="0" cy={FRONT.knee.y} r="13" fill={C.cyan} opacity="0.16" />}
        <path d={FRONT.thigh} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />

        <g transform={`translate(0,${FRONT.knee.y})`}>
          <g>
            <Anim values={rot(knee)} cfg={cfg} />
            <path d={FRONT.kneeLine} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
            {highlight && (
              <>
                <circle cx="0" cy="0" r="9" fill="none" stroke={C.cyan} strokeWidth="1.4" opacity="0.7">
                  <animate attributeName="r" values="8;13;8" dur="2.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.15;0.7" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="4.4" fill={C.cyan} />
              </>
            )}
            <path d={FRONT.shin} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />

            <g transform={`translate(0,${FRONT.knee.ankle})`}>
              <g>
                <Anim values={rot(foot)} cfg={cfg} />
                <path d={FRONT.foot} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Arm({ x, stroke }) {
  return (
    <g transform={`translate(${x},-90)`}>
      <path d={FRONT.upperArm} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
      <g transform="translate(0,42)">
        <path d={FRONT.foreArm} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
        <path d={FRONT.hand} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </g>
  );
}

export default function FrontFigure({ cfg, svgRef, side = 'derecha' }) {
  const mirror = String(side).toLowerCase().startsWith('i');

  return (
    <svg
      ref={svgRef}
      viewBox="-90 -160 180 380"
      className="h-full w-auto"
      role="img"
      aria-label="Figura humana de línea en movimiento, vista frontal"
    >
      <g transform={mirror ? 'scale(-1,1)' : undefined}>
        <line x1="-70" y1="196" x2="70" y2="196" stroke="#D8D6E2" strokeWidth="1.6" strokeDasharray="4 6" />

        <path
          d="M 44 190 A 32 32 0 0 0 40 150"
          fill="none"
          stroke={C.cyanDeep}
          strokeWidth="1.4"
          strokeDasharray="4 5"
          opacity="0.6"
        />

        <g>
          <Anim type="translate" values={cfg.rootX.map((v) => `${v} 0`).join(';')} cfg={cfg} />

          {/* Pierna de apoyo */}
          <Leg cfg={cfg} x={-16} thigh={[0, 0, 0, 0]} knee={[0, 0, 0, 0]} foot={[0, 0, 0, 0]} stroke={C.muted} />

          {/* Torso */}
          <g>
            <Anim values={rot(cfg.torso)} cfg={cfg} />
            <Arm x={-30} stroke={C.ink} />
            <Arm x={30} stroke={C.ink} />
            <path d={FRONT.torso} fill="none" stroke={C.ink} strokeWidth="2.8" strokeLinejoin="round" />
            <path d={FRONT.pelvis} fill="none" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
            <path d={FRONT.neck} fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
            <path d={FRONT.head} fill="none" stroke={C.ink} strokeWidth="2.8" strokeLinejoin="round" />
          </g>

          {/* Pierna trabajada */}
          <g>
            <Anim type="translate" values={cfg.workLift.map((v) => `0 ${v}`).join(';')} cfg={cfg} />
            <Leg
              cfg={cfg}
              x={16}
              thigh={cfg.workThigh}
              knee={cfg.workKnee}
              foot={cfg.workFoot}
              stroke={C.cyanDeep}
              highlight
            />
          </g>
        </g>
      </g>
    </svg>
  );
}