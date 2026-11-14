/**
 * Geometría de la silueta humana.
 *
 * Las figuras NO son esquemas articulados: cada segmento se dibuja como una
 * cápsula cónica con volumen (muslo, pierna, brazo) y se combinan con un torso
 * macizo, cuello y cabeza, de modo que la superposición de formas opacas
 * produce una silueta continua, con masa y proporción anatómica.
 */

export const DIM = {
  thigh: 88,
  shin: 84,
  upperArm: 46,
  foreArm: 42,
  hipW: 27,
  kneeW: 19,
  ankleW: 12,
  armW: 15,
  elbowW: 11,
  wristW: 9,
  ankleLift: 9,
};

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

/* Torso lateral: cadera en (0,0), hombros hacia arriba (eje -y), +x = frente. */
export const TORSO_SIDE =
  'M 3 -78 C 9 -76 12 -70 13 -62 C 15 -50 15 -34 13 -18 C 12 -6 12 2 11 7 ' +
  'C 4 11 -5 11 -10 5 C -14 -4 -15 -20 -14 -34 C -13 -50 -11 -66 -6 -74 C -4 -77 -1 -79 3 -78 Z';

/* Torso frontal: simétrico respecto del eje. */
export const TORSO_FRONT =
  'M -25 -70 C -19 -75 -10 -78 0 -78 C 10 -78 19 -75 25 -70 ' +
  'C 27 -58 25 -44 22 -30 C 20 -18 20 -8 19 5 C 13 10 6 12 0 12 ' +
  'C -6 12 -13 10 -19 5 C -20 -8 -20 -18 -22 -30 C -25 -44 -27 -58 -25 -70 Z';

/* Pie lateral: tobillo en (0,0), puntera hacia +x, planta en y≈9. */
export const FOOT_SIDE =
  'M -10 1 C -10 -5 -1 -7 9 -6.5 C 19 -6 27 -2.5 27 2.5 C 27 7.5 18 10 8 10 ' +
  'C -2 10 -10 7 -10 1 Z';

/* Pie frontal: vista anterior, pequeño volumen redondeado. */
export const FOOT_FRONT = 'M -8 -2 C -8 -7 8 -7 8 -2 L 8 5 C 8 9 -8 9 -8 5 Z';

export const HEAD_SIDE = { cx: 2, cy: -96, rx: 12.5, ry: 15.5 };
export const HEAD_FRONT = { cx: 0, cy: -95, rx: 12.5, ry: 15.5 };
export const NECK_H = 14;

/** Color de la silueta: masa oscura sobria, miembro trabajado en cian institucional. */
export const INK = { body: 'hsl(var(--foreground) / 0.84)', far: 'hsl(var(--foreground) / 0.26)', work: 'hsl(var(--brand-cyan))' };