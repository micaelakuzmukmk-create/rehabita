import React from 'react';
import Anim from './Anim';
import { figureFor, INK, FOOT_SIDE } from '@/lib/silhouette';

const grab = (poses, key, fallback = 0) => poses.map((p) => p[key] ?? fallback);

function Leg({ fig, poses, dur, keyTimes, splines, fill, suffix = '', ring = false, pad = false }) {
  const d = fig.dim;
  const thigh = grab(poses, `th${suffix}`, 0);
  const knee = grab(poses, `kn${suffix}`, 4);
  const foot = poses.map((p) => -(((p[`th${suffix}`] ?? 0) - (p[`kn${suffix}`] ?? 4))) + (p[`ft${suffix}`] ?? 0));

  return (
    <g>
      <Anim values={thigh} dur={dur} keyTimes={keyTimes} splines={splines} />
      <path d={fig.thighSide} fill={fill} />
      <g transform={`translate(0 ${d.thigh})`}>
        {ring && (
          <circle r="14" fill="none" stroke="hsl(var(--area-ink) / 0.5)" strokeWidth="2" strokeDasharray="3 4" />
        )}
        <g>
          <Anim values={knee.map((v) => -v)} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={fig.shinSide} fill={fill} />
          <g transform={`translate(0 ${d.shin})`}>
            {/* Superficie deslizante bajo el talón (slides de rodilla) */}
            {pad && (
              <ellipse rx="13" ry="4.5" fill="hsl(var(--muted))" stroke="hsl(var(--foreground) / 0.16)" strokeWidth="1.2" />
            )}
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

function Arm({ fig, poses, dur, keyTimes, splines, fill, suffix = '' }) {
  const d = fig.dim;
  const shoulder = grab(poses, `sh${suffix}`, suffix ? 3 : 6);
  const elbow = grab(poses, `el${suffix}`, suffix ? 8 : 10);

  return (
    <g transform={`translate(${fig.armX} ${fig.shoulderY})`}>
      <Anim values={shoulder} dur={dur} keyTimes={keyTimes} splines={splines} />
      <path d={fig.upperSide} fill={fill} />
      <g transform={`translate(0 ${d.upperArm})`}>
        <g>
          <Anim values={elbow} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={fig.foreSide} fill={fill} />
          <ellipse cy={d.foreArm + 2} rx="6.4" ry="7.4" fill={fill} />
        </g>
      </g>
    </g>
  );
}

/** Silueta humana de perfil con volumen, articulada y animada. */
export default function SilhouetteSide({
  poses,
  dur,
  keyTimes,
  splines,
  work = 'near',
  hip = [110, 119],
  gender = 'hombre',
  pad = false,
}) {
  const fig = figureFor(gender);
  const near = work === 'near' ? INK.work : INK.body;
  const far = work === 'far' ? INK.work : INK.far;
  const rootValues = poses.map((p) => [p.rx ?? 0, p.ry ?? 0]);
  const lean = grab(poses, 'lean', 0);

  return (
    <g transform={`translate(${hip[0]} ${hip[1]})`}>
      <g>
        <Anim type="translate" values={rootValues} dur={dur} keyTimes={keyTimes} splines={splines} />

        {/* Brazo y pierna del plano lejano */}
        <Arm fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={far} suffix="2" />
        <Leg fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={far} suffix="2" />

        {/* Torso, cuello y cabeza */}
        <g>
          <Anim values={lean} dur={dur} keyTimes={keyTimes} splines={splines} />
          <path d={fig.torsoSide} fill={INK.body} />
          <path d={fig.neckSide} fill={INK.body} />
          <ellipse
            cx={fig.headSide.cx}
            cy={fig.headSide.cy}
            rx={fig.headSide.rx}
            ry={fig.headSide.ry}
            fill={INK.body}
          />
          <Arm fig={fig} poses={poses} dur={dur} keyTimes={keyTimes} splines={splines} fill={INK.body} suffix="" />
        </g>

        {/* Pierna trabajada */}
        <Leg
          fig={fig}
          poses={poses}
          dur={dur}
          keyTimes={keyTimes}
          splines={splines}
          fill={near}
          ring={work === 'near'}
          pad={pad}
        />
      </g>
    </g>
  );
}