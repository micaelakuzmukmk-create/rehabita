// Configuración de movimientos de la guía de ejercicios.
// Cuatro posiciones por ciclo (inicio → ejecución → máxima → retorno) con interpolación suave.

export const KEY_TIMES = [0, 0.42, 0.6, 1];
const SPLINES = '0.42 0 0.2 1; 0.02 0 0.98 1; 0.42 0 0.6 1';

export const MOTIONS = {
  squat: {
    view: 'lateral',
    viewLabel: 'Vista lateral',
    dur: 3.8,
    keyTimes: KEY_TIMES,
    splines: SPLINES,
    steps: [
      'De pie, pies apoyados y mirada al frente',
      'Descenso flexionando cadera y rodillas',
      'Posición baja, rodillas alineadas con los pies',
      'Ascenso controlado hasta la posición inicial',
    ],
    rootY: [0, 50, 50, 0],
    torso: [0, 16, 16, 0],
    upperArm: [0, -58, -58, 0],
    foreArm: [0, -24, -24, 0],
    nearThigh: [0, -42, -42, 0],
    nearKnee: [0, 88, 88, 0],
    nearFoot: [0, -46, -46, 0],
    farThigh: [0, -38, -38, 0],
    farKnee: [0, 84, 84, 0],
    farFoot: [0, -46, -46, 0],
  },
  kneeFlex: {
    view: 'lateral',
    viewLabel: 'Vista lateral',
    dur: 3.4,
    keyTimes: KEY_TIMES,
    splines: SPLINES,
    steps: [
      'De pie, apoyado en ambas piernas',
      'Flexión de la rodilla llevando el talón hacia atrás',
      'Máxima flexión controlada',
      'Extensión lenta hasta la posición inicial',
    ],
    rootY: [0, 2, 2, 0],
    torso: [0, 5, 5, 0],
    upperArm: [0, -10, -10, 0],
    foreArm: [0, -6, -6, 0],
    trajectory: 'M 10 176 A 92 92 0 0 0 -78 100',
    nearThigh: [0, 4, 4, 0],
    nearKnee: [0, 90, 90, 0],
    nearFoot: [0, 10, 10, 0],
    farThigh: [0, 0, 0, 0],
    farKnee: [0, 0, 0, 0],
    farFoot: [0, 0, 0, 0],
  },
  singleLeg: {
    view: 'lateral',
    viewLabel: 'Vista lateral',
    dur: 3.6,
    keyTimes: KEY_TIMES,
    splines: SPLINES,
    steps: [
      'De pie, peso repartido en ambas piernas',
      'Transferencia del peso a la pierna de apoyo',
      'Elevación de la pierna contraria con rodilla flexionada',
      'Descenso controlado hasta apoyar nuevamente',
    ],
    rootY: [0, 0, 0, 0],
    torso: [0, -3, -3, 0],
    upperArm: [0, -14, -14, 0],
    foreArm: [0, -10, -10, 0],
    trajectory: 'M 10 168 A 46 46 0 0 1 44 142',
    nearThigh: [0, -36, -36, 0],
    nearKnee: [0, 55, 55, 0],
    nearFoot: [0, -10, -10, 0],
    farThigh: [0, 0, 0, 0],
    farKnee: [0, 0, 0, 0],
    farFoot: [0, 0, 0, 0],
  },
  balance: {
    view: 'frontal',
    viewLabel: 'Vista frontal',
    dur: 3.4,
    keyTimes: KEY_TIMES,
    splines: SPLINES,
    steps: [
      'De pie, brazos junto al cuerpo',
      'Desplazamiento del peso hacia una pierna',
      'Elevación de la pierna contraria manteniendo el tronco estable',
      'Regreso controlado a los dos apoyos',
    ],
    rootX: [0, -10, -10, 0],
    torso: [0, 0, 0, 0],
    workLift: [0, -18, -18, 0],
    workThigh: [0, 10, 10, 0],
    workKnee: [0, 36, 36, 0],
    workFoot: [0, -20, -20, 0],
  },
};

export function motionForCategory(category) {
  switch (category) {
    case 'propiocepcion':
      return 'balance';
    case 'retorno_deportivo':
      return 'singleLeg';
    case 'movilidad':
    case 'estiramiento':
      return 'kneeFlex';
    default:
      return 'squat';
  }
}