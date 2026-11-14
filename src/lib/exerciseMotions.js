/**
 * Biblioteca de movimientos de ejercicios.
 *
 * Cada movimiento está atado a un patrón del NOMBRE del ejercicio y describe:
 *  · posturas clave (ángulos articulares) que se interpolan en bucle,
 *  · el escenario necesario (step, banda, camilla, banco, máquina, base),
 *  · la pierna trabajada que se resalta,
 *  · la secuencia de indicaciones coherente con el movimiento.
 *
 * Vista lateral: 0° = hacia abajo, valores positivos = hacia adelante.
 * Vista frontal: los ángulos se aplican sobre cada lado del cuerpo.
 */

import { DIM, rad } from './silhouette';

export const F_SIDE = { vb: '0 0 300 320', ground: 300, hip: [110, 119] };
export const F_FRONT = { vb: '0 0 240 320', ground: 300, hip: [120, 119] };
export const F_SUPINE = { vb: '0 0 300 214', ground: 190, mat: 190, hip: [112, 174] };
export const F_PRENSA = { vb: '0 0 300 300', ground: 292, hip: [64, 186] };
export const F_RUN = { vb: '0 0 340 320', ground: 300, hip: [182, 119] };
export const F_LUNGE = { vb: '0 0 340 320', ground: 300, hip: [150, 119] };

const STAND_REACH = DIM.thigh + DIM.shin;

const kt = (n) => {
  if (n === 4) return [0, 0.34, 0.62, 1];
  if (n === 5) return [0, 0.26, 0.44, 0.66, 1];
  return [0, 0.16, 0.32, 0.5, 0.72, 1];
};
const splines = (n) => Array.from({ length: n - 1 }, () => '0.42 0 0.58 1').join(';');

const S = (o) => ({ th: 0, kn: 4, ft: 0, th2: 0, kn2: 4, ft2: 0, lean: 0, sh: 6, el: 10, sh2: 3, el2: 8, ...o });
const F = (o) => ({ rx: 0, lean: 0, hipL: 5, kneeL: 0, hipR: -5, kneeR: 0, armL: 9, elbowL: 10, armR: -9, elbowR: 10, ...o });

/** Resuelve la posición de la cadera para que el pie de apoyo quede fijo en el piso. */
function solveSide(pose, frame) {
  const leg = pose.solveLeg || 'near';
  const th = (leg === 'far' ? pose.th2 : pose.th) ?? 0;
  const kn = (leg === 'far' ? pose.kn2 : pose.kn) ?? 4;
  const kneeX = Math.sin(rad(th)) * DIM.thigh;
  const kneeY = Math.cos(rad(th)) * DIM.thigh;
  const sa = th - kn;
  const ankleX = kneeX + Math.sin(rad(sa)) * DIM.shin;
  const ankleY = kneeY + Math.cos(rad(sa)) * DIM.shin;
  const anchorY = pose.anchor ?? frame.ground - DIM.ankleLift;
  const anchorX = pose.anchorX ?? 0;
  return {
    ...pose,
    rx: anchorX - ankleX,
    ry: anchorY - ankleY - frame.hip[1] + (pose.dy ?? 0),
  };
}

/** Vista frontal: baja la cadera lo que se flexionan las rodillas para no despegar los pies. */
function solveFront(pose) {
  const reach = (hip, knee) => Math.cos(rad(hip)) * DIM.thigh + Math.cos(rad(hip + knee)) * DIM.shin;
  const support = Math.max(reach(pose.hipL, pose.kneeL), reach(pose.hipR, pose.kneeR));
  return { ...pose, rx: pose.rx ?? 0, ry: STAND_REACH - support + (pose.dy ?? 0) };
}

function build(id, cfg) {
  const view = cfg.view || 'side';
  const frame = cfg.frame || F_SIDE;
  const raw = cfg.poses.map((p) => (cfg.sym ? { ...p, th2: p.th, kn2: p.kn, ft2: p.ft } : p));
  const poses = cfg.auto === false
    ? raw.map((p) => ({ ...p, rx: p.rx ?? 0, ry: p.ry ?? 0 }))
    : view === 'front' ? raw.map(solveFront) : raw.map((p) => solveSide(p, frame));
  return {
    view,
    work: 'near',
    env: 'ground',
    ...cfg,
    frame,
    id,
    poses,
    keyTimes: kt(raw.length),
    splines: splines(raw.length),
  };
}

export const MOTIONS = {
  /* ── Sentadilla ───────────────────────────────────────────────── */
  sentadilla: build('sentadilla', {
    label: 'Vista lateral',
    caption: 'Descenso y ascenso con flexión de cadera y rodillas',
    dur: 4,
    sym: true,
    steps: [
      'De pie, pies al ancho de cadera y mirada al frente',
      'Descenso llevando la cadera hacia atrás, con el pecho alto',
      'Rodillas alineadas con los pies, peso repartido en la planta',
      'Ascenso controlado empujando el piso hasta la posición inicial',
    ],
    arc: 'M 110 119 C 100 138 88 150 77 158',
    poses: [
      S({ lean: 3 }),
      S({ lean: 14, th: 30, kn: 44, sh: 26, el: 16 }),
      S({ lean: 24, th: 50, kn: 74, sh: 54, el: 20 }),
      S({ lean: 24, th: 50, kn: 74, sh: 54, el: 20 }),
      S({ lean: 3 }),
    ],
  }),

  /* ── Apoyo / equilibrio monopodal ─────────────────────────────── */
  monopodal: build('monopodal', {
    label: 'Vista lateral',
    caption: 'Apoyo sobre una sola pierna, la otra rodilla se eleva',
    dur: 3.8,
    steps: [
      'De pie, apoyando todo el peso en la pierna de apoyo',
      'Elevá la rodilla contraria sin perder la verticalidad del tronco',
      'Sostené el apoyo sobre una sola pierna',
      'Descendé el pie con control hasta el piso',
    ],
    arc: 'M 130 286 C 154 268 160 240 152 218',
    poses: [
      S({ lean: 2, th2: 0, kn2: 4 }),
      S({ lean: 0, sh: -14, el: 16, sh2: -8, el2: 12, th2: 32, kn2: 60, ft2: -16 }),
      S({ lean: -2, sh: -22, el: 22, sh2: -12, el2: 16, th2: 46, kn2: 82, ft2: -26 }),
      S({ lean: -2, sh: -22, el: 22, sh2: -12, el2: 16, th2: 46, kn2: 82, ft2: -26 }),
      S({ lean: 2, th2: 0, kn2: 4 }),
    ],
  }),

  /* ── Equilibrio bipodal sobre base inestable ──────────────────── */
  pivot: build('pivot', {
    view: 'front',
    frame: F_FRONT,
    env: 'pivot',
    work: 'both',
    label: 'Vista frontal',
    caption: 'Ambos pies sobre la base, control del balanceo',
    dur: 3.6,
    steps: [
      'Apoyá los dos pies sobre la base inestable',
      'Sostené el peso repartido con las rodillas levemente flexionadas',
      'Controlá el balanceo sin separar los pies de la base',
      'Volvé al centro del apoyo',
    ],
    poses: [
      F({}),
      F({ rx: -9, lean: -3, kneeL: -6, kneeR: 4, armL: 15 }),
      F({ rx: 9, lean: 3, kneeL: 4, kneeR: -6, armR: -15 }),
      F({}),
    ],
  }),

  /* ── Equilibrio ───────────────────────────────────────────────── */
  equilibrio: build('equilibrio', {
    view: 'front',
    frame: F_FRONT,
    work: 'both',
    label: 'Vista frontal',
    caption: 'Postura de sostén y estabilidad',
    dur: 3.8,
    steps: [
      'De pie, con los pies al ancho de cadera',
      'Separá los brazos para ampliar la base de control',
      'Sostené la postura con el tronco estable y la mirada al frente',
      'Volvé a la posición inicial',
    ],
    poses: [
      F({ armL: 22, armR: -22 }),
      F({ lean: -4, rx: -5, armL: 30, armR: -16, kneeL: -4 }),
      F({ lean: 4, rx: 5, armL: 16, armR: -30, kneeR: 4 }),
      F({ armL: 22, armR: -22 }),
    ],
  }),

  /* ── Transferencia de peso ────────────────────────────────────── */
  transferencia: build('transferencia', {
    view: 'front',
    frame: F_FRONT,
    work: 'both',
    label: 'Vista frontal',
    caption: 'Cambio del eje corporal de un pie al otro',
    dur: 4.2,
    steps: [
      'De pie, con los pies separados al ancho de hombros',
      'Llevá el peso del cuerpo hacia un pie',
      'Pasá el peso hacia el otro lado, cambiando el eje',
      'Volvé al centro con control',
    ],
    poses: [
      F({ kneeL: -2, kneeR: 2 }),
      F({ rx: -18, lean: -5, hipL: 9, kneeL: -10, armL: 14 }),
      F({ rx: 18, lean: 5, hipR: -9, kneeR: -10, armR: -14 }),
      F({}),
    ],
  }),

  /* ── Step ─────────────────────────────────────────────────────── */
  step: build('step', {
    label: 'Vista lateral',
    env: 'step',
    caption: 'Subida y bajada del step',
    dur: 4.6,
    steps: [
      'De pie frente al step, con el pie alineado a la plataforma',
      'Apoyá el pie sobre el escalón',
      'Subí el cuerpo empujando con la pierna de arriba',
      'Bajá con control hasta el piso',
    ],
    arc: 'M 92 172 C 84 140 84 110 92 84',
    poses: [
      S({ lean: 4, solveLeg: 'near', anchor: 291 }),
      S({ lean: 12, th: 50, kn: 72, ft: -18, sh: 22, el: 16, solveLeg: 'far' }),
      S({ lean: 14, th: 26, kn: 42, sh: 26, el: 14, solveLeg: 'near', anchor: 251 }),
      S({ lean: 4, sh: 6, el: 10, solveLeg: 'near', anchor: 251 }),
      S({ lean: 10, th: 46, kn: 66, ft: -16, sh: 18, el: 14, solveLeg: 'far', anchor: 291 }),
      S({ lean: 4, solveLeg: 'near', anchor: 291 }),
    ],
  }),

  /* ── Flexión de rodilla ───────────────────────────────────────── */
  flexion_rodilla: build('flexion_rodilla', {
    label: 'Vista lateral',
    caption: 'Cambio del ángulo de la rodilla',
    dur: 3.8,
    steps: [
      'De pie, con el peso sobre la pierna de apoyo',
      'Flexioná la rodilla llevando el talón hacia atrás',
      'Sostené la flexión sin mover la cadera',
      'Extendé la rodilla lentamente',
    ],
    arc: 'M 136 288 C 96 304 40 270 46 212',
    poses: [
      S({ lean: 2, th: 8, kn: 6, solveLeg: 'far' }),
      S({ lean: 4, th: 10, kn: 56, ft: -8, solveLeg: 'far' }),
      S({ lean: 6, th: 12, kn: 104, ft: -26, solveLeg: 'far' }),
      S({ lean: 6, th: 12, kn: 104, ft: -26, solveLeg: 'far' }),
      S({ lean: 2, th: 8, kn: 6, solveLeg: 'far' }),
    ],
  }),

  /* ── Ejercicio con banda ──────────────────────────────────────── */
  banda: build('banda', {
    view: 'front',
    frame: F_FRONT,
    env: 'band',
    work: 'both',
    label: 'Vista frontal',
    caption: 'Banda elástica en tensión entre ambos pies',
    dur: 4,
    steps: [
      'Colocá la banda por encima de los tobillos',
      'Mantené los pies al ancho de cadera con la banda en tensión',
      'Desplazá un pie hacia el costado venciendo la resistencia',
      'Volvé lentamente sin perder la tensión de la banda',
    ],
    poses: [
      F({ rx: -12, hipL: 16, kneeL: -6, hipR: -10 }),
      F({ rx: -2, hipL: 10, kneeL: -2, hipR: -8, armL: 12 }),
      F({ rx: 12, hipL: 22, kneeL: -10, hipR: -14, armL: 14 }),
      F({ rx: -12, hipL: 16, kneeL: -6, hipR: -10 }),
    ],
  }),

  /* ── Salto lateral ────────────────────────────────────────────── */
  salto: build('salto', {
    view: 'front',
    frame: F_FRONT,
    work: 'both',
    label: 'Vista frontal',
    caption: 'Desplazamiento lateral con vuelo y aterrizaje',
    dur: 3,
    steps: [
      'De pie, con las rodillas levemente flexionadas',
      'Impulsate hacia un costado con ambos pies',
      'Aterrizá con la rodilla alineada, amortiguando',
      'Repetí el salto hacia el otro lado',
    ],
    poses: [
      F({ rx: -22, kneeL: -16, kneeR: 14, hipL: 10, hipR: -6 }),
      F({ dy: -34, kneeL: -4, kneeR: 4, armL: 24, armR: -24 }),
      F({ rx: 22, kneeL: -14, kneeR: 16, hipL: 6, hipR: -10 }),
      F({ dy: -34, kneeL: -4, kneeR: 4, armL: 24, armR: -24 }),
      F({ rx: -22, kneeL: -16, kneeR: 14, hipL: 10, hipR: -6 }),
    ],
  }),

  /* ── Carrera ──────────────────────────────────────────────────── */
  carrera: build('carrera', {
    label: 'Vista lateral',
    frame: F_RUN,
    caption: 'Ciclo de carrera con apoyo alternado',
    dur: 2,
    steps: [
      'Postura erguida con una leve inclinación del tronco',
      'Alterná el apoyo de un pie al otro',
      'Acompañá el movimiento con los brazos',
      'Mantené un ritmo continuo y controlado',
    ],
    poses: [
      S({ lean: 8, th: 26, kn: 18, th2: -24, kn2: 52, ft2: -20, sh: -34, el: 76, sh2: 34, el2: 64, solveLeg: 'near' }),
      S({ lean: 8, th: 2, kn: 10, th2: 20, kn2: 86, ft2: -30, sh: 22, el: 84, sh2: -22, el2: 84, solveLeg: 'near', dy: -8 }),
      S({ lean: 8, th: -24, kn: 52, ft: -20, th2: 26, kn2: 18, sh: 34, el: 64, sh2: -34, el2: 76, solveLeg: 'far' }),
      S({ lean: 8, th: 20, kn: 86, ft: -30, th2: 2, kn2: 10, sh: -22, el: 84, sh2: 22, el2: 84, solveLeg: 'far', dy: -8 }),
      S({ lean: 8, th: 26, kn: 18, th2: -24, kn2: 52, ft2: -20, sh: -34, el: 76, sh2: 34, el2: 64, solveLeg: 'near' }),
    ],
  }),

  /* ── Elevación de pierna recta ────────────────────────────────── */
  slr: build('slr', {
    label: 'Vista lateral · decúbito dorsal',
    frame: F_SUPINE,
    env: 'mat',
    caption: 'Pierna recta elevada, rodilla extendida',
    dur: 4.2,
    auto: false,
    steps: [
      'Acostado boca arriba, con una pierna extendida sobre la camilla',
      'Elevá la pierna manteniendo la rodilla extendida',
      'Sostené arriba sin compensar con el tronco',
      'Descendé lento hasta apoyar la pierna',
    ],
    arc: 'M 284 172 C 306 118 268 62 200 40',
    poses: [
      S({ lean: -88, th: 90, kn: 2, th2: 90, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }),
      S({ lean: -88, th: 118, kn: 2, th2: 90, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }),
      S({ lean: -88, th: 142, kn: 2, th2: 90, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }),
      S({ lean: -88, th: 142, kn: 2, th2: 90, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }),
      S({ lean: -88, th: 90, kn: 2, th2: 90, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }),
    ],
  }),

  /* ── Estiramiento de isquiotibiales ───────────────────────────── */
  estiramiento: build('estiramiento', {
    label: 'Vista lateral',
    env: 'box',
    caption: 'Estiramiento con la rodilla extendida sobre el banco',
    dur: 5,
    steps: [
      'Apoyá la pierna a estirar sobre el banco',
      'Mantené la rodilla extendida y la espalda recta',
      'Llevá el tronco hacia adelante hasta sentir el estiramiento',
      'Sostené y volvé lentamente',
    ],
    poses: [
      S({ lean: 8, th: 55, kn: 6, sh: 20, el: 10, solveLeg: 'far' }),
      S({ lean: 38, th: 58, kn: 4, sh: 56, el: 12, solveLeg: 'far' }),
      S({ lean: 56, th: 60, kn: 2, sh: 82, el: 10, solveLeg: 'far' }),
      S({ lean: 56, th: 60, kn: 2, sh: 82, el: 10, solveLeg: 'far' }),
      S({ lean: 8, th: 55, kn: 6, sh: 20, el: 10, solveLeg: 'far' }),
    ],
  }),

  /* ── Slides de rodilla ────────────────────────────────────────── */
  slides: build('slides', {
    label: 'Vista lateral',
    env: 'slider',
    caption: 'Deslizamiento de la rodilla hacia adelante',
    dur: 4,
    steps: [
      'De pie sobre la superficie deslizante',
      'Deslizá la rodilla hacia adelante sin despegar el talón',
      'Llegá a la flexión máxima controlada',
      'Volvé a la posición inicial empujando el piso',
    ],
    poses: [
      S({ lean: 6 }),
      S({ lean: 12, th: 18, kn: 42, th2: -6, kn2: 20, sh: 26, el: 14, anchorX: 28 }),
      S({ lean: 18, th: 26, kn: 62, th2: -10, kn2: 30, sh: 44, el: 18, anchorX: 58 }),
      S({ lean: 18, th: 26, kn: 62, th2: -10, kn2: 30, sh: 44, el: 18, anchorX: 58 }),
      S({ lean: 6 }),
    ],
  }),

  /* ── Prensa de pierna ─────────────────────────────────────────── */
  prensa: build('prensa', {
    label: 'Vista lateral',
    frame: F_PRENSA,
    env: 'machine',
    work: 'both',
    sym: true,
    auto: false,
    caption: 'Empuje de la plataforma con ambas piernas',
    dur: 4,
    steps: [
      'Sentado en la prensa, con la espalda apoyada',
      'Pies apoyados en la plataforma y rodillas flexionadas',
      'Empujá extendiendo las rodillas sin bloquearlas',
      'Volvé lento a la flexión inicial',
    ],
    poses: [
      { ...S({ lean: -14, th: 84, kn: 104, ft: 6, sh: 36, el: 12, sh2: 14, el2: 8 }), rx: 0, ry: 0 },
      { ...S({ lean: -14, th: 86, kn: 62, ft: 0, sh: 32, el: 10, sh2: 12, el2: 8 }), rx: 0, ry: 0 },
      { ...S({ lean: -14, th: 88, kn: 8, ft: -6, sh: 28, el: 8, sh2: 10, el2: 6 }), rx: 0, ry: 0 },
      { ...S({ lean: -14, th: 88, kn: 8, ft: -6, sh: 28, el: 8, sh2: 10, el2: 6 }), rx: 0, ry: 0 },
      { ...S({ lean: -14, th: 84, kn: 104, ft: 6, sh: 36, el: 12, sh2: 14, el2: 8 }), rx: 0, ry: 0 },
    ],
  }),

  /* ── Puente glúteo ────────────────────────────────────────────── */
  puente: build('puente', {
    label: 'Vista lateral · decúbito dorsal',
    frame: F_SUPINE,
    env: 'mat',
    work: 'both',
    auto: false,
    caption: 'Elevación de cadera con los pies apoyados',
    dur: 4.2,
    steps: [
      'Acostado boca arriba, rodillas flexionadas y pies apoyados',
      'Empujá con los pies y elevá la cadera',
      'Sostené arriba con la espalda baja neutra',
      'Descendé lento hasta apoyar la cadera',
    ],
    poses: [
      { ...S({ lean: -90, th: 88, kn: 2, th2: 88, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }), rx: 0, ry: 0 },
      { ...S({ lean: -94, th: 110, kn: 58, th2: 110, kn2: 58, sh: 172, el: 4, sh2: 172, el2: 4 }), rx: 0, ry: -14 },
      { ...S({ lean: -98, th: 118, kn: 104, th2: 118, kn2: 104, sh: 172, el: 4, sh2: 172, el2: 4 }), rx: 0, ry: -26 },
      { ...S({ lean: -98, th: 118, kn: 104, th2: 118, kn2: 104, sh: 172, el: 4, sh2: 172, el2: 4 }), rx: 0, ry: -26 },
      { ...S({ lean: -90, th: 88, kn: 2, th2: 88, kn2: 2, sh: 172, el: 4, sh2: 172, el2: 4 }), rx: 0, ry: 0 },
    ],
  }),

  /* ── Elevación de talones ─────────────────────────────────────── */
  talones: build('talones', {
    label: 'Vista lateral',
    sym: true,
    caption: 'Elevación sobre la punta de los pies',
    dur: 3.2,
    steps: [
      'De pie, con el peso sobre la punta de los pies',
      'Elevá los talones manteniendo las rodillas extendidas',
      'Sostené arriba un instante',
      'Bajá los talones con control',
    ],
    poses: [
      S({ lean: 2, kn: 2 }),
      S({ lean: 2, kn: 2, ft: 30, dy: -14 }),
      S({ lean: 2, kn: 2, ft: 30, dy: -14 }),
      S({ lean: 2, kn: 2 }),
    ],
  }),

  /* ── Abducción de cadera ──────────────────────────────────────── */
  abduccion: build('abduccion', {
    view: 'front',
    frame: F_FRONT,
    label: 'Vista frontal',
    caption: 'Apertura lateral de la pierna',
    dur: 3.8,
    steps: [
      'De pie, con el tronco estable',
      'Separá la pierna hacia el costado',
      'Sostené arriba sin inclinar el tronco',
      'Bajá con control',
    ],
    poses: [
      F({}),
      F({ hipL: 26, kneeL: 4, hipR: -4 }),
      F({ hipL: 38, kneeL: 2, hipR: -4 }),
      F({ hipL: 38, kneeL: 2, hipR: -4 }),
      F({}),
    ],
  }),

  /* ── Zancada ──────────────────────────────────────────────────── */
  zancada: build('zancada', {
    label: 'Vista lateral',
    frame: F_LUNGE,
    caption: 'Paso al frente con descenso controlado',
    dur: 4,
    steps: [
      'De pie, con un pie adelantado',
      'Descendé flexionando ambas rodillas',
      'Rodilla delantera sobre el pie, sin pasar la punta',
      'Empujá para volver a la posición inicial',
    ],
    poses: [
      S({ lean: 4 }),
      S({ lean: 10, th: 34, kn: 30, sh: 16, el: 12 }),
      S({ lean: 16, th: 40, kn: 58, th2: -18, kn2: 40, ft2: -30, sh: 26, el: 14 }),
      S({ lean: 4 }),
    ],
  }),
};

/* ── Resolución por nombre del ejercicio ──────────────────────────── */

const RULES = [
  [/(equilibrio|apoyo|balance)[a-z ]*(mono|unipod)|monopodal|unipodal|single leg|una sola pierna|una pierna/, 'monopodal'],
  [/(equilibrio|balance)[a-z ]*(bipod|pivot|bosu)|pivot|bosu|inestable|base movil/, 'pivot'],
  [/(equilibrio|balance|estabilidad|propiocep)/, 'equilibrio'],
  [/transferencia|desplazamiento de peso|cambio de peso|peso lateral/, 'transferencia'],
  [/slide|desliza/, 'slides'],
  [/prensa|leg press|maquina/, 'prensa'],
  [/estiramiento|elongacion|stretch|flexibilidad/, 'estiramiento'],
  [/puente|bridge|gluteo/, 'puente'],
  [/elevacion de pierna recta|pierna recta|slr/, 'slr'],
  [/isquio|curl|flexion de rodilla|flexoextension/, 'flexion_rodilla'],
  [/step|escalon|escalera|subir|bajar/, 'step'],
  [/banda|elastico|theraband|goma|tensor/, 'banda'],
  [/salto|jump|hop|plio|rebote|multisalto/, 'salto'],
  [/carrera|trote|correr|marcha|running|jog/, 'carrera'],
  [/zancada|lunge|desplante|estocada/, 'zancada'],
  [/talon|gemelo|puntilla|calf/, 'talones'],
  [/abduccion|almeja|clamshell|lateral de cadera/, 'abduccion'],
  [/sentadilla|squat|cuclilla/, 'sentadilla'],
];

const BY_CATEGORY = {
  movilidad: 'flexion_rodilla',
  fuerza: 'sentadilla',
  propiocepcion: 'monopodal',
  potencia: 'salto',
  retorno_deportivo: 'carrera',
  estiramiento: 'estiramiento',
};

export const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Devuelve la clave de movimiento que corresponde al nombre del ejercicio. */
export function motionKeyFor(exercise) {
  const name = normalize(exercise?.name || '');
  const hit = RULES.find(([re]) => re.test(name));
  if (hit) return hit[1];
  return BY_CATEGORY[exercise?.category] || 'sentadilla';
}

export function motionFor(exercise) {
  return MOTIONS[motionKeyFor(exercise)];
}