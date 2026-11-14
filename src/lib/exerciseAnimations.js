/**
 * Biblioteca de animaciones de ejercicios.
 *
 * Cada ejercicio tiene un archivo propio por preferencia corporal. La app nunca
 * genera el movimiento: busca el archivo que corresponde al nombre del ejercicio
 * y al género elegido, y si no existe muestra "Demostración en desarrollo".
 *
 * Convención de nombres: <slug>_<genero>.mp4
 *   sentadilla_parcial_mujer.mp4 / sentadilla_parcial_hombre.mp4
 *   slides_rodilla_mujer.mp4     / slides_rodilla_hombre.mp4
 *   saltos_laterales_mujer.mp4   / saltos_laterales_hombre.mp4
 *
 * Para habilitar un video: pegar su URL pública en la entrada del slug.
 */

const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/** Nombres aceptados (normalizados) para cada animación disponible. */
export const ANIMATION_ALIASES = {
  sentadilla_parcial: [
    'sentadilla_parcial',
    'sentadilla',
    'media_sentadilla',
    'sentadilla_parcial_con_banda',
  ],
  slides_rodilla: [
    'slides_rodilla',
    'slides_de_rodilla',
    'slide_de_rodilla',
    'deslizamientos_de_rodilla',
    'deslizamiento_de_rodilla',
  ],
  saltos_laterales: [
    'saltos_laterales',
    'salto_lateral',
    'saltos_laterales_con_banda',
    'saltos_laterales_con_minibanda',
  ],
};

/**
 * URLs de los archivos. Vacío = todavía no existe el recurso.
 * Ejemplo: sentadilla_parcial: { mujer: 'https://…/sentadilla_parcial_mujer.mp4' }
 */
export const EXERCISE_ANIMATIONS = {
  sentadilla_parcial: {},
  slides_rodilla: {},
  saltos_laterales: {},
};

const SLUG_BY_ALIAS = Object.entries(ANIMATION_ALIASES).reduce((acc, [slug, aliases]) => {
  aliases.forEach((alias) => {
    acc[alias] = slug;
  });
  return acc;
}, {});

export const ANIMATION_GENDERS = ['mujer', 'hombre'];

export function animationSlugFor(exerciseName) {
  return SLUG_BY_ALIAS[normalize(exerciseName)] || null;
}

export function animationFileName(slug, gender) {
  return `${slug}_${gender}.mp4`;
}

/**
 * Devuelve el recurso que corresponde a un ejercicio y una preferencia corporal.
 * `available` es false cuando el archivo todavía no está cargado.
 */
export function resolveExerciseAnimation(exerciseName, gender) {
  const preference = gender === 'hombre' ? 'hombre' : 'mujer';
  const slug = animationSlugFor(exerciseName);
  if (!slug) return { slug: null, gender: preference, fileName: null, url: null, available: false };

  const fileName = animationFileName(slug, preference);
  const url = EXERCISE_ANIMATIONS[slug]?.[preference] || null;

  return { slug, gender: preference, fileName, url, available: Boolean(url) };
}