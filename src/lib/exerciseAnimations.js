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
  sentadilla_parcial: {
    mujer: 'https://media.base44.com/videos/public/6ab87cc4d91f4c040f179413/8e5c2056b_Sentadilla_mujer.mp4',
    hombre: 'https://media.base44.com/videos/public/6ab87cc4d91f4c040f179413/d08bdd2c6_Sentadilla_hombre.mp4',
  },
  slides_rodilla: {
    mujer: 'https://media.base44.com/videos/public/6ab87cc4d91f4c040f179413/89dd2efac_Slides_mujer.mp4',
    hombre: 'https://media.base44.com/videos/public/6ab87cc4d91f4c040f179413/e1efdc937_Slides_hombre.mp4',
  },
  saltos_laterales: {
    mujer: 'https://media.base44.com/videos/public/6ab87cc4d91f4c040f179413/f5084cd8e_Saltos_mujer.mp4',
    hombre: 'https://media.base44.com/videos/public/6ab87cc4d91f4c040f179413/809f3fcf8_Saltos_hombre.mp4',
  },
};

/**
 * Portadas estáticas (frame inicial representativo) para las vistas previas.
 * Las miniaturas usan siempre estas imágenes: nunca un video en reproducción.
 */
export const EXERCISE_POSTERS = {
  sentadilla_parcial: {
    mujer: 'https://media.base44.com/images/public/6ab87cc4d91f4c040f179413/b2973dd43_generated_image.png',
    hombre: 'https://media.base44.com/images/public/6ab87cc4d91f4c040f179413/bf25e0965_generated_image.png',
  },
  slides_rodilla: {
    mujer: 'https://media.base44.com/images/public/6ab87cc4d91f4c040f179413/f13a921cf_generated_image.png',
    hombre: 'https://media.base44.com/images/public/6ab87cc4d91f4c040f179413/2e6460c86_generated_image.png',
  },
  saltos_laterales: {
    mujer: 'https://media.base44.com/images/public/6ab87cc4d91f4c040f179413/4ecef238a_generated_image.png',
    hombre: 'https://media.base44.com/images/public/6ab87cc4d91f4c040f179413/832cac85c_generated_image.png',
  },
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
  if (!slug) return { slug: null, gender: preference, fileName: null, url: null, poster: null, available: false };

  const fileName = animationFileName(slug, preference);
  const url = EXERCISE_ANIMATIONS[slug]?.[preference] || null;
  const poster = EXERCISE_POSTERS[slug]?.[preference] || null;

  return { slug, gender: preference, fileName, url, poster, available: Boolean(url) };
}