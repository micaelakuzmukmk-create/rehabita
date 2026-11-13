// Utilidades compartidas de ReHabita

// Determina el rol efectivo para la interfaz.
// 1) Admin (modo demostración): usa la vista elegida temporalmente en localStorage.
//    No modifica su rol real ni tipo_usuario; solo cambia la vista para presentar/probar.
// 2) Usuario real: usa su tipo_usuario (paciente => patient, kinesiologo => professional).
//    Si no tiene tipo_usuario asignado, devuelve null (perfil no asignado).
export function getEffectiveRole(user) {
  if (!user) return null;
  if (user.role === 'admin') {
    return localStorage.getItem('rehbaita_demo_role') || 'professional';
  }
  if (user.tipo_usuario === 'paciente') return 'patient';
  if (user.tipo_usuario === 'kinesiologo') return 'professional';
  return null;
}

export function setDemoRole(role) {
  localStorage.setItem('rehbaita_demo_role', role);
}

export function clearDemoRole() {
  localStorage.removeItem('rehbaita_demo_role');
}

// Definición de métricas de sesión.
// Colores alineados a la paleta ReHabita: un color = un indicador en toda la app.
export const METRICS = [
  { key: 'symmetry', label: 'Simetría', unit: '%', min: 0, max: 100, higherBetter: true, color: '#3B1A7B' },
  { key: 'load_distribution', label: 'Distribución de carga', unit: '%', min: 0, max: 100, higherBetter: true, color: '#2CB1D2' },
  { key: 'stability', label: 'Estabilidad', unit: '', min: 0, max: 100, higherBetter: true, color: '#9182FF' },
  { key: 'reaction_time', label: 'Tiempo de reacción', unit: 'ms', min: 0, max: 1000, higherBetter: false, color: '#89D4E6' },
  { key: 'movement_control', label: 'Control de movimiento', unit: '', min: 0, max: 100, higherBetter: true, color: '#6344B8' },
  { key: 'strength', label: 'Fuerza', unit: '', min: 0, max: 100, higherBetter: true, color: '#22E2ED' },
  { key: 'knee_flexion_angle', label: 'Ángulo flexión rodilla', unit: '°', min: 0, max: 150, higherBetter: true, color: '#5A9FC4' },
  { key: 'pain_perceived', label: 'Dolor percibido', unit: '/10', min: 0, max: 10, higherBetter: false, color: '#D9A03C' },
  { key: 'confidence_perceived', label: 'Confianza percibida', unit: '', min: 0, max: 100, higherBetter: true, color: '#4FD8E8' },
];

export const METRIC_MAP = Object.fromEntries(METRICS.map(m => [m.key, m]));

// Grupos musculares medidos en cada sesión.
export const MUSCLE_GROUPS = [
  { key: 'strength_vastus_medialis', label: 'Cuádriceps vasto interno', color: '#2CB1D2' },
  { key: 'strength_vastus_lateralis', label: 'Cuádriceps vasto externo', color: '#22E2ED' },
  { key: 'strength_hamstrings', label: 'Isquiotibiales', color: '#9182FF' },
];

// Genera un valor de progreso no lineal (mejoras, mesetas, descensos) para una sesión i de n.
export function nonLinearProgress(start, end, i, n, noise = 0.04) {
  const t = n <= 1 ? 1 : i / (n - 1);
  // base lineal + onda senoidal para crear mesetas/descensos
  const wave = Math.sin(t * Math.PI * 2.2) * (Math.abs(end - start) * 0.18);
  const dip = t > 0.6 && t < 0.72 ? -(Math.abs(end - start) * 0.12) : 0;
  const jitter = (Math.random() - 0.5) * 2 * noise * Math.abs(end - start);
  return start + (end - start) * t + wave + dip + jitter;
}

// Versión "paciente" simplificada de un valor: traduce a etiqueta cualitativa.
export function qualitative(metricKey, value) {
  const m = METRIC_MAP[metricKey];
  if (!m || value == null) return '—';
  if (metricKey === 'pain_perceived') {
    if (value <= 2) return 'Bajo';
    if (value <= 5) return 'Moderado';
    return 'Alto';
  }
  if (!m.higherBetter) {
    if (value <= m.max * 0.4) return 'Bueno';
    if (value <= m.max * 0.7) return 'Regular';
    return 'A mejorar';
  }
  if (value >= m.max * 0.8) return 'Excelente';
  if (value >= m.max * 0.6) return 'Bueno';
  if (value >= m.max * 0.4) return 'Regular';
  return 'A mejorar';
}

// Compara el valor actual con el de la sesión anterior.
export function metricDelta(metricKey, current, previous) {
  const m = METRIC_MAP[metricKey];
  if (!m || current == null || previous == null) return null;
  const delta = Math.round((current - previous) * 10) / 10;
  const improved = m.higherBetter ? delta >= 0 : delta <= 0;
  return { delta, improved };
}

export const PHASE_LABELS = {
  proteccion: 'Protección',
  movilidad: 'Movilidad',
  fuerza: 'Fuerza',
  propiocepcion: 'Propiocepción',
  retorno_deportivo: 'Retorno deportivo',
};