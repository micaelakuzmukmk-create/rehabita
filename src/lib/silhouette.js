/**
 * Geometría de la silueta humana.
 *
 * Las figuras NO son esquemas articulados: cada segmento se dibuja como una
 * cápsula cónica con volumen (muslo, pierna, brazo) y se combinan con un torso
 * macizo, cuello y cabeza, de modo que la superposición de formas opacas
 * produce una silueta continua, con masa y proporción anatómica.
 *
 * Dos variantes corporales (mujer / hombre) comparten exactamente el mismo
 * sistema y las mismas longitudes de segmento: solo cambian anchos, la forma
 * del torso y la relación hombros–cintura–cadera. Así la mecánica del
 * movimiento (ángulos, apoyos, piso) es idéntica en ambas.
 */

export const rad = (deg) => (deg * Math.PI) / 180;

/** Punto a `len` de distancia en la dirección `angle` (0° = hacia abajo, 90° = adelante). */
export function dir(angle, len) {
  return { x: Math.sin(rad(angle)) * len, y: Math.cos(rad(angle)) * len };
}

/** Cápsula cónica entre dos puntos: contorno continuo con extremos redondeados. */
export function limbPath(a, b, w1, w2) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const r1 = w1 / 2;
  const r2 = w2 / 2;
  const pts = [];

  pts.push([a.x + nx * r1, a.y + ny * r1]);
  pts.push([b.x + nx * r2, b.y + ny * r2]);
  for (let i = 1; i < 9; i += 1) {
    const t = (Math.PI * i) / 9;
    pts.push([
      b.x + nx * r2 * Math.cos(t) + ux * r2 * Math.sin(t),
      b.y + ny * r2 * Math.cos(t) + uy * r2 * Math.sin(t),
    ]);
  }
  pts.push([b.x - nx * r2, b.y - ny * r2]);
  pts.push([a.x - nx * r1, a.y - ny * r1]);
  for (let i = 1; i < 9; i += 1) {
    const t = (Math.PI * i) / 9;
    pts.push([
      a.x - nx * r1 * Math.cos(t) - ux * r1 * Math.sin(t),
      a.y - ny * r1 * Math.cos(t) - uy * r1 * Math.sin(t),
    ]);
  }

  return `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')} Z`;
}

/* Longitudes de segmento: idénticas en ambas variantes (misma mecánica). */
export const DIM = {
  thigh: 88,
  shin: 84,
  upperArm: 46,
  foreArm: 42,
  ankleLift: 9,
};

/* ── Torso de perfil: cadera en (0,0), hombros hacia arriba, +x = frente ── */

const TORSO_SIDE_M = // hombre: espalda amplia y línea más recta
  'M 3 -78 C 9 -76 12 -70 13.5 -61 C 15.5 -50 15 -36 13.5 -22 ' +
  'C 12.5 -10 12 0 11 6 C 5 11 -4 11 -9 6 C -12.5 -4 -14 -18 -13.5 -32 ' +
  'C -13 -48 -11 -64 -6 -74 C -4 -77 -1 -79 3 -78 Z';

const TORSO_SIDE_F = // mujer: cintura marcada, cadera y glúteo con más curva, hombros más finos
  'M 2.5 -78 C 8 -75.5 11.5 -69 12.5 -61 C 14.5 -50 13 -40 11 -30 ' +
  'C 10.5 -20 11.5 -6 12.5 3 C 12 8 6 11 0 11 C -6 11 -11 6 -12 -2 ' +
  'C -13.5 -12 -12.5 -26 -11 -38 C -9.5 -52 -7.5 -66 -4 -74 C -2 -77.5 0 -79 2.5 -78 Z';

/* ── Torso frontal: simétrico respecto del eje ── */

const TORSO_FRONT_M =
  'M -25 -70 C -19 -75 -10 -78 0 -78 C 10 -78 19 -75 25 -70 ' +
  'C 27 -58 25 -44 22 -30 C 20 -18 20 -8 19 5 C 13 10 6 12 0 12 ' +
  'C -6 12 -13 10 -19 5 C -20 -8 -20 -18 -22 -30 C -25 -44 -27 -58 -25 -70 Z';

const TORSO_FRONT_F =
  'M -21.5 -70 C -16 -75 -9 -78 0 -78 C 9 -78 16 -75 21.5 -70 ' +
  'C 23 -58 20 -46 17.5 -34 C 16 -26 18.5 -14 21 4 C 14.5 10 7 12 0 12 ' +
  'C -7 12 -14.5 10 -21 4 C -18.5 -14 -16 -26 -17.5 -34 C -20 -46 -23 -58 -21.5 -70 Z';

/** Pie lateral: tobillo en (0,0), puntera hacia +x, planta en y≈9. */
export const FOOT_SIDE =
  'M -10 1 C -10 -5 -1 -7 9 -6.5 C 19 -6 27 -2.5 27 2.5 C 27 7.5 18 10 8 10 ' +
  'C -2 10 -10 7 -10 1 Z';

/** Pie frontal: vista anterior, pequeño volumen redondeado. */
export const FOOT_FRONT = 'M -8 -2 C -8 -7 8 -7 8 -2 L 8 5 C 8 9 -8 9 -8 5 Z';

const HEAD_SIDE = { cx: 2, cy: -96, rx: 12.5, ry: 15.5 };
const HEAD_FRONT = { cx: 0, cy: -95, rx: 12.5, ry: 15.5 };

/* ── Variantes corporales ── */

const VARIANTS = {
  hombre: {
    dim: { ...DIM, hipW: 28, kneeW: 20, ankleW: 12.5, armW: 16.5, elbowW: 12, wristW: 10 },
    torsoSide: TORSO_SIDE_M,
    torsoFront: TORSO_FRONT_M,
    shoulderX: 24,
    shoulderY: -70,
    armX: 2,
    hipX: 13,
    neckSide: [19, 16],
    neckFront: [22, 18],
  },
  mujer: {
    dim: { ...DIM, hipW: 26, kneeW: 18, ankleW: 11, armW: 13.5, elbowW: 10, wristW: 8.5 },
    torsoSide: TORSO_SIDE_F,
    torsoFront: TORSO_FRONT_F,
    shoulderX: 20.5,
    shoulderY: -70,
    armX: 2.5,
    hipX: 14,
    neckSide: [17, 14.5],
    neckFront: [19.5, 16],
  },
};

const cache = new Map();

/** Conjunto de formas de una variante corporal, listo para dibujar. */
export function figureFor(gender = 'hombre') {
  const key = gender === 'mujer' ? 'mujer' : 'hombre';
  if (cache.has(key)) return cache.get(key);

  const v = VARIANTS[key];
  const d = v.dim;

  const fig = {
    key,
    dim: d,
    torsoSide: v.torsoSide,
    torsoFront: v.torsoFront,
    headSide: HEAD_SIDE,
    headFront: HEAD_FRONT,
    shoulderX: v.shoulderX,
    shoulderY: v.shoulderY,
    armX: v.armX,
    hipX: v.hipX,
    thighSide: limbPath({ x: 0, y: -10 }, { x: 0, y: d.thigh }, d.hipW, d.kneeW),
    shinSide: limbPath({ x: 0, y: -6 }, { x: 0, y: d.shin }, d.kneeW * 0.94, d.ankleW),
    upperSide: limbPath({ x: 0, y: -8 }, { x: 0, y: d.upperArm }, d.armW, d.elbowW),
    foreSide: limbPath({ x: 0, y: -4 }, { x: 0, y: d.foreArm }, d.elbowW, d.wristW),
    thighFront: limbPath({ x: 0, y: -10 }, { x: 0, y: d.thigh }, d.hipW * 0.9, d.kneeW * 0.95),
    shinFront: limbPath({ x: 0, y: -6 }, { x: 0, y: d.shin }, d.kneeW * 0.85, d.ankleW),
    upperFront: limbPath({ x: 0, y: -8 }, { x: 0, y: d.upperArm }, d.armW * 0.9, d.elbowW),
    foreFront: limbPath({ x: 0, y: -4 }, { x: 0, y: d.foreArm }, d.elbowW, d.wristW),
    neckSide: limbPath({ x: 0, y: -70 }, { x: 0, y: -86 }, v.neckSide[0], v.neckSide[1]),
    neckFront: limbPath({ x: 0, y: -68 }, { x: 0, y: -86 }, v.neckFront[0], v.neckFront[1]),
  };

  cache.set(key, fig);
  return fig;
}

/** Color de la silueta: masa oscura sobria, miembro trabajado en cian institucional. */
export const INK = {
  body: 'hsl(var(--foreground) / 0.84)',
  far: 'hsl(var(--foreground) / 0.26)',
  work: 'hsl(var(--brand-cyan))',
};