// Utilidades compartidas para las mediciones del wearable (ESP32-S3).

export const SAMPLE_STALE_MS = 6000;

// Grupos musculares registrados por el wearable.
export const MUSCLE_SERIES = [
  { key: 'isquio', label: 'Isquiotibial', short: 'Isquio', color: '#7c3aed' },
  { key: 'vasto_interno', label: 'Vasto interno', short: 'V. interno', color: '#0d9488' },
  { key: 'vasto_externo', label: 'Vasto externo', short: 'V. externo', color: '#2563eb' },
];

export const MEASUREMENT_STATE_LABELS = {
  en_espera: 'En espera',
  midiendo: 'Midiendo',
  sin_datos: 'Sin datos recientes',
  interrumpido: 'Interrumpido',
};

export const SESSION_STATUS_LABELS = {
  activa: 'En curso',
  finalizada: 'Finalizada',
  interrumpida: 'Interrumpida',
};

const clampIndex = (v) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : null;

// Interpreta el mensaje JSON enviado por la ESP32. Devuelve null si no es una muestra válida.
export function parseSample(text) {
  if (!text) return null;
  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object') return null;
    const isquio = clampIndex(obj.isquio);
    const vasto_interno = clampIndex(obj.vasto_interno);
    const vasto_externo = clampIndex(obj.vasto_externo);
    if (isquio == null && vasto_interno == null && vasto_externo == null) return null;
    return {
      type: obj.type || 'emg',
      simulated: obj.simulated !== false,
      isquio,
      vasto_interno,
      vasto_externo,
    };
  } catch {
    return null;
  }
}

// Calcula los máximos de actividad de una sesión a partir de sus muestras válidas.
export function summarizeSamples(samples) {
  const maxOf = (key) => {
    const values = samples
      .map((s) => s[key])
      .filter((v) => typeof v === 'number' && Number.isFinite(v));
    return values.length ? Math.round(Math.max(...values) * 10) / 10 : null;
  };
  return {
    max_isquio: maxOf('isquio'),
    max_vasto_interno: maxOf('vasto_interno'),
    max_vasto_externo: maxOf('vasto_externo'),
    sample_count: samples.length,
  };
}

export function formatDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return '—';
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSec = Math.round(ms / 1000);
  return `${Math.floor(totalSec / 60)}m ${String(totalSec % 60).padStart(2, '0')}s`;
}

export function formatElapsed(ms) {
  const totalSec = Math.max(0, Math.round((ms || 0) / 1000));
  return `${String(Math.floor(totalSec / 60)).padStart(2, '0')}:${String(totalSec % 60).padStart(2, '0')}`;
}