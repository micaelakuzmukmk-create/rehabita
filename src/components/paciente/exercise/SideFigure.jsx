import React from 'react';
import { SIDE, FIGURE_COLORS as C } from '@/lib/bodyPaths';

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

function Leg({ cfg, thigh, knee, foot, stroke, highlight }) {
  return (
    <g>
      <Anim values={rot(thigh)} cfg={cfg} />
      {highlight && <circle cx="0" cy={SIDE.knee.y} r="13" fill={C.cyan} opacity="0.16" />}
      <path d={SIDE.thigh} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />

      <g transform={`translate(0,${SIDE.knee.y})`}>
        <g>
          <Anim values={rot(knee)} cfg={cfg} />
          <path d={SIDE.kneeLine} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          {highlight && (
            <>
              <circle cx="0" cy="0" r="9" fill="none" stroke={C.cyan} strokeWidth="1.4" opacity="0.7">
                <animate attributeName="r" values="8;13;8" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.15;0.7" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="4.4" fill={C.cyan} />
            </>
          )}
          <path d={SIDE.shin} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />

          <g transform={`translate(0,${SIDE.knee.ankle})`}>
            <g>
              <Anim values={rot(foot)} cfg={cfg} />
              <path d={SIDE.foot} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Arm({ cfg, upper, fore, stroke }) {
  return (
    <g>
      <Anim values={rot(upper)} cfg={cfg} />
      <path d={SIDE.upperArm} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <g transform="translate(0,32)">
        <g>
          <Anim values={rot(fore)} cfg={cfg} />
          <path d={SIDE.foreArm} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
          <path d={SIDE.hand} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

export default function SideFigure({ cfg, svgRef }) {
  const trajectory = cfg.trajectory;

  return (
    <svg
      ref={svgRef}
      viewBox="-118 -170 225 410"
      className="h-full w-auto"
      role="img"
      aria-label="Figura humana de línea en movimiento, vista lateral"
    >
      <line x1="-70" y1="196" x2="86" y2="196" stroke="#D8D6E2" strokeWidth="1.6" strokeDasharray="4 6" />

      {trajectory && (
        <g>
          <path
            d={trajectory}
            fill="none"
            stroke={C.cyanDeep}
            strokeWidth="1.4"
            strokeDasharray="4 5"
            opacity="0.65"
            markerEnd="url(#rh-arrow)"
          />
        </g>
      )}

      <defs>
        <marker id="rh-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.cyanDeep} />
        </marker>
      </defs>

      <g>
        <Anim type="translate" values={cfg.rootY.map((v) => `0 ${v}`).join(';')} cfg={cfg} />

        {/* Pierna de apoyo / lejana */}
        <Leg cfg={cfg} thigh={cfg.farThigh} knee={cfg.farKnee} foot={cfg.farFoot} stroke={C.muted} />

        {/* Torso, pelvis y cabeza */}
        <g>
          <Anim values={rot(cfg.torso)} cfg={cfg} />

          <g transform="translate(2,-84)">
            <Arm cfg={cfg} upper={cfg.upperArm} fore={cfg.foreArm} stroke={C.muted} />
          </g>

          <path d={SIDE.torso} fill="none" stroke={C.ink} strokeWidth="2.8" strokeLinejoin="round" />
          <path d={SIDE.pelvis} fill="none" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
          <path d={SIDE.neck} fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d={SIDE.head} fill="none" stroke={C.ink} strokeWidth="2.8" strokeLinejoin="round" />

          <g transform="translate(12,-86)">
            <Arm cfg={cfg} upper={cfg.upperArm} fore={cfg.foreArm} stroke={C.ink} />
          </g>
        </g>

        {/* Pierna trabajada (lesionada) */}
        <Leg
          cfg={cfg}
          thigh={cfg.nearThigh}
          knee={cfg.nearKnee}
          foot={cfg.nearFoot}
          stroke={C.cyanDeep}
          highlight
        />
      </g>
    </svg>
  );
}