import React from 'react';
import Anim from './Anim';
import { figureFor, INK, FOOT_FRONT, rad } from '@/lib/silhouette';

const grab = (poses, key, fallback = 0) => poses.map((p) => p[key] ?? fallback);

function Leg({ fig, poses, dur, keyTimes, splines, fill, side, ring = false }) {
  const d = fig.dim;
  const hip = grab(poses, side === 'L' ? 'hipL' : 'hipR', side === 'L' ? 5 : -5);
  const knee = grab(poses, side === 'L' ? 'kneeL' : 'kneeR', 0);

  return (
    <g transform={`translate(${side === 'L' ? fig.hipX : -fig.hipX} 0)`}>
      <g>
        <Anim values={hip} dur={dur} keyTimes={keyTimes} splines={splines} />
        <path d={fig.thighFront} fill={fill} />
        <g transform={`translate(0 ${d.thigh})`}>
          {ring && (
            <circle r="13" fill="none" stroke="hsl(var(--area-ink) / 0.5)" strokeWidth="2" strokeDasharray="3 4" />
          )}
          <g>
            <Anim values={knee} dur={dur} keyTimes={keyTimes} splines={splines} />
            <path d={fig.shinFront} fill={fill} />
            <g transform={`translate(0 ${d.shin})`}>
              <path d={FOOT_FRONT} fill={fill} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Arm({ fig, poses, dur, keyTimes, splines, fill, side }) {
  const d = fig.dim;
  const shoulder = grab(poses, side === 'L' ? 'armL' : 'armR', side === 'L' ? 9 : -9);
  const elbow = grab(poses, side === 'L' ? 'elbowL' : 'elbowR', 10);

  return (
    <g transform={`translate(${side === 'L' ? fig.shoulderX : -fig.shoulderX} ${fig.shoulderY + 2})`}>
      <g>
        <Anim values={shoulder} dur={dur} keyTimes={keyTimes} splines={splines} />
        <path d={fig.upperFront} fill={fill} />
        <g transform={`translate(0 ${d.upperArm})`}>
          <g>
            <Anim values={elbow} dur={dur} keyTimes={keyTimes} splines={splines} />
            <path d={fig.foreFront} fill={fill} />
            <ellipse cy={d.foreArm + 2} rx="5.8" ry="6.8" fill={fill} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Silueta humana de frente, con banda elástica cuando el ejercicio la usa. */
export default function SilhouetteFront({
  poses,
  dur,
  keyTimes,
  splines,
  work = 'both',
  env,
  hip = [120, 119],
  gender = 'hombre',
}) {
  const fig = figureFor(gender);
  const leftFill = work === 'left' ? INK.work : INK.body;
  const rightFill = work === 'right' ? INK.work : INK.body;
  const rootValues = poses.map((p) => [p.rx ?? 0, p.ry ?? 0]);
  const lean = grab(poses, 'lean', 0);

  const ankles = poses.map((p) => {
    const l = { x: p.rx ?? 0, y: p.ry ?? 0 };
    const ax = (h, k, x0) =>
      x0 + Math.sin(rad(h)) * fig.dim.thigh + Math.sin(rad(h + k)) * fig.dim.shin + l.x;
    const ay = (h, k) => Math.cos(rad(h)) * fig.dim.thigh + Math.cos(rad(h + k)) * fig.dim.shin + l.y + 4;
    return {
      lx: ax(p.hipL ?? 5, p.kneeL ?? 0, fig.hipX),
      ly: ay(p.hipL ?? 5, p.kneeL ?? 0),
      rx: ax(p.hipR ?? -5, p.kneeR ?? 0, -fig.hipX),
      ry: ay(p.hipR ?? -5, p.kneeR ?? 0),
    };
  });

  return (
    <g transform={`translate(${hip[0]} ${hip[1]})`}>
      <g>
        <Anim type="translate" values={rootValues} dur={dur} keyTimes={keyTimes} splines={splines} />

        {env === 'band' && (
          <g>
            <line
              x1={ankles[0].lx}
              y1={ankles[0].ly}
              x2={ankles[0].rx}
              y2={ankles[0].ry}
              stroke="hsl(var(--brand-cyan))"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="x1" values={ankles.map((a) => a.lx.toFixed(1)).join(';')} dur={`${dur}s`} keyTimes={keyTimes.join(';')} calcMode="spline" keySplines={splines} repeatCount="indefinite" />
              <animate attributeName="y1" values={ankles.map((a) => a.ly.toFixed(1)).join(';')} dur={`${dur}s`} keyTimes={keyTimes.join(';')} calcMode="spline" keySplines={splines} repeatCount="indefinite" />
              <animate attributeName="x2" values={ankles.map((a) => a.rx.toFixed(1)).join(';')} dur={`${dur}s`} keyTimes={keyTimes.join(';')} calcMode="spline" keySplines={splines} repeatCount="indefinite" />
              <animate attributeName="y2" values={ankles.map((a) => a.ry.toFixed(1)).join(';')} dur={`${dur}s`} keyTimes={keyTimes.join(';')} calcMode="spline" keySplines={splines} repeatCount="indefinite" />
            </line>
          </g>
        )}

        <Arm fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={rightFill} side="R" />
        <Leg fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={rightFill} side="R" />

        <g>
          <Anim values={lean} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={fig.torsoFront} fill={INK.body} />
          <path d={fig.neckFront} fill={INK.body} />
          <ellipse
            cx={fig.headFront.cx}
            cy={fig.headFront.cy}
            rx={fig.headFront.rx}
            ry={fig.headFront.ry}
            fill={INK.body}
          />
        </g>

        <Leg fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={leftFill} side="L" ring={work === 'left'} />
        <Arm fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={INK.body} side="L" />
      </g>
    </g>
  );
}