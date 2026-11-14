import React from 'react';
import Anim from './Anim';
import { DIM, INK, TORSO_SIDE, FOOT_SIDE, HEAD_SIDE, limbPath } from '@/lib/silhouette';

const THIGH_SHAPE = limbPath({ x: 0, y: -10 }, { x: 0, y: DIM.thigh }, DIM.hipW, DIM.kneeW);
const SHIN_SHAPE = limbPath({ x: 0, y: -6 }, { x: 0, y: DIM.shin }, DIM.kneeW * 0.94, DIM.ankleW);
const UPPER_SHAPE = limbPath({ x: 0, y: -8 }, { x: 0, y: DIM.upperArm }, DIM.armW, DIM.elbowW);
const FORE_SHAPE = limbPath({ x: 0, y: -4 }, { x: 0, y: DIM.foreArm }, DIM.elbowW, DIM.wristW);
const NECK_SHAPE = limbPath({ x: 0, y: -70 }, { x: 0, y: -86 }, 19, 16);

const grab = (poses, key, fallback = 0) => poses.map((p) => p[key] ?? fallback);

function Leg({ poses, dur, keyTimes, splines, fill, suffix = '', ring = false }) {
  const thigh = grab(poses, `th${suffix}`, 0);
  const knee = grab(poses, `kn${suffix}`, 4);
  const foot = poses.map((p) => -(((p[`th${suffix}`] ?? 0) - (p[`kn${suffix}`] ?? 4))) + (p[`ft${suffix}`] ?? 0));

  return (
    <g>
      <Anim values={thigh} dur={dur} keyTimes={keyTimes} splines={splines} />
      <path d={THIGH_SHAPE} fill={fill} />
      <g transform={`translate(0 ${DIM.thigh})`}>
        {ring && (
          <circle r="14" fill="none" stroke="hsl(var(--area-ink) / 0.5)" strokeWidth="2" strokeDasharray="3 4" />
        )}
        <g>
          <Anim values={knee.map((v) => -v)} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={SHIN_SHAPE} fill={fill} />
          <g transform={`translate(0 ${DIM.shin})`}>
            <g>
              <Anim values={foot} dur={dur} keyTimes={keyTimes} splines={splines} />
              <path d={FOOT_SIDE} fill={fill} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Arm({ poses, dur, keyTimes, splines, fill, suffix = '' }) {
  const shoulder = grab(poses, `sh${suffix}`, suffix ? 3 : 6);
  const elbow = grab(poses, `el${suffix}`, suffix ? 8 : 10);

  return (
    <g transform="translate(2 -70)">
      <Anim values={shoulder} dur={dur} keyTimes={keyTimes} splines={splines} />
      <path d={UPPER_SHAPE} fill={fill} />
      <g transform={`translate(0 ${DIM.upperArm})`}>
        <g>
          <Anim values={elbow} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={FORE_SHAPE} fill={fill} />
          <ellipse cy={DIM.foreArm + 2} rx="6.4" ry="7.4" fill={fill} />
        </g>
      </g>
    </g>
  );
}

/** Silueta humana de perfil con volumen, articulada y animada. */
export default function SilhouetteSide({ poses, dur, keyTimes, splines, work = 'near', hip = [110, 119] }) {
  const near = work === 'near' ? INK.work : INK.body;
  const far = work === 'far' ? INK.work : INK.far;
  const rootValues = poses.map((p) => [p.rx ?? 0, p.ry ?? 0]);
  const lean = grab(poses, 'lean', 0);

  return (
    <g transform={`translate(${hip[0]} ${hip[1]})`}>
      <g>
        <Anim type="translate" values={rootValues} dur={dur} keyTimes={keyTimes} splines={splines} />

        {/* Brazo y pierna del plano lejano */}
        <Arm poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={far} suffix="2" />
        <Leg poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={far} suffix="2" />

        {/* Torso, cuello y cabeza */}
        <g>
          <Anim values={lean} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={TORSO_SIDE} fill={INK.body} />
          <path d={NECK_SHAPE} fill={INK.body} />
          <ellipse cx={HEAD_SIDE.cx} cy={HEAD_SIDE.cy} rx={HEAD_SIDE.rx} ry={HEAD_SIDE.ry} fill={INK.body} />
          <Arm poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={INK.body} suffix="" />
        </g>

        {/* Pierna trabajada */}
        <Leg poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={near} ring={work === 'near'} />
      </g>
    </g>
  );
}