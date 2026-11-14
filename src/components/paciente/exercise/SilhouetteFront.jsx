import React from 'react';
import Anim from './Anim';
import { DIM, INK, TORSO_FRONT, FOOT_FRONT, HEAD_FRONT, limbPath, rad } from '@/lib/silhouette';

const THIGH_SHAPE = limbPath({ x: 0, y: -10 }, { x: 0, y: DIM.thigh }, DIM.hipW * 0.9, DIM.kneeW * 0.95);
const SHIN_SHAPE = limbPath({ x: 0, y: -6 }, { x: 0, y: DIM.shin }, DIM.kneeW * 0.85, DIM.ankleW);
const UPPER_SHAPE = limbPath({ x: 0, y: -8 }, { x: 0, y: DIM.upperArm }, DIM.armW * 0.9, DIM.elbowW);
const FORE_SHAPE = limbPath({ x: 0, y: -4 }, { x: 0, y: DIM.foreArm }, DIM.elbowW, DIM.wristW);
const NECK_SHAPE = limbPath({ x: 0, y: -68 }, { x: 0, y: -86 }, 22, 18);

const grab = (poses, key, fallback = 0) => poses.map((p) => p[key] ?? fallback);
const HIP_X = 13;

function Leg({ poses, dur, keyTimes, splines, fill, side, ring = false }) {
  const hip = grab(poses, side === 'L' ? 'hipL' : 'hipR', side === 'L' ? 5 : -5);
  const knee = grab(poses, side === 'L' ? 'kneeL' : 'kneeR', 0);

  return (
    <g transform={`translate(${side === 'L' ? HIP_X : -HIP_X} 0)`}>
      <g>
        <Anim values={hip} dur={dur} keyTimes={keyTimes} splines={splines} />
        <path d={THIGH_SHAPE} fill={fill} />
        <g transform={`translate(0 ${DIM.thigh})`}>
          {ring && (
            <circle r="13" fill="none" stroke="hsl(var(--area-ink) / 0.5)" strokeWidth="2" strokeDasharray="3 4" />
          )}
          <g>
            <Anim values={knee} dur={dur} keyTimes={keyTimes} splines={splines} />
            <path d={SHIN_SHAPE} fill={fill} />
            <g transform={`translate(0 ${DIM.shin})`}>
              <path d={FOOT_FRONT} fill={fill} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Arm({ poses, dur, keyTimes, splines, fill, side }) {
  const shoulder = grab(poses, side === 'L' ? 'armL' : 'armR', side === 'L' ? 9 : -9);
  const elbow = grab(poses, side === 'L' ? 'elbowL' : 'elbowR', 10);

  return (
    <g transform={`translate(${side === 'L' ? 24 : -24} -68)`}>
      <g>
        <Anim values={shoulder} dur={dur} keyTimes={keyTimes} splines={splines} />
        <path d={UPPER_SHAPE} fill={fill} />
        <g transform={`translate(0 ${DIM.upperArm})`}>
          <g>
            <Anim values={elbow} dur={dur} keyTimes={keyTimes} splines={splines} />
            <path d={FORE_SHAPE} fill={fill} />
            <ellipse cy={DIM.foreArm + 2} rx="5.8" ry="6.8" fill={fill} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Silueta humana de frente, con banda elástica cuando el ejercicio la usa. */
export default function SilhouetteFront({ poses, dur, keyTimes, splines, work = 'both', env, hip = [120, 119] }) {
  const leftFill = work === 'left' ? INK.work : INK.body;
  const rightFill = work === 'right' ? INK.work : INK.body;
  const rootValues = poses.map((p) => [p.rx ?? 0, p.ry ?? 0]);
  const lean = grab(poses, 'lean', 0);

  const ankles = poses.map((p) => {
    const l = { x: p.rx ?? 0, y: p.ry ?? 0 };
    const ax = (h, k, x0) =>
      x0 + Math.sin(rad(h)) * DIM.thigh + Math.sin(rad(h + k)) * DIM.shin + l.x;
    const ay = (h, k) => Math.cos(rad(h)) * DIM.thigh + Math.cos(rad(h + k)) * DIM.shin + l.y + 4;
    return {
      lx: ax(p.hipL ?? 5, p.kneeL ?? 0, HIP_X),
      ly: ay(p.hipL ?? 5, p.kneeL ?? 0),
      rx: ax(p.hipR ?? -5, p.kneeR ?? 0, -HIP_X),
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

        <Arm poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={rightFill} side="R" />
        <Leg poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={rightFill} side="R" />

        <g>
          <Anim values={lean} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={TORSO_FRONT} fill={INK.body} />
          <path d={NECK_SHAPE} fill={INK.body} />
          <ellipse cx={HEAD_FRONT.cx} cy={HEAD_FRONT.cy} rx={HEAD_FRONT.rx} ry={HEAD_FRONT.ry} fill={INK.body} />
        </g>

        <Leg poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={leftFill} side="L" ring={work === 'left'} />
        <Arm poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={INK.body} side="L" />
      </g>
    </g>
  );
}