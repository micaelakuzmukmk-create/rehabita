import {
  Home,
  TrendingUp,
  CalendarDays,
  GitCompare,
  ClipboardList,
  FileText,
  User,
  Users,
  CalendarPlus,
  Activity,
  Cpu,
} from 'lucide-react';

// Navegación separada por área. No se mezclan opciones entre perfiles.
// `end` marca los items que deben coincidir exactamente (sin subrutas).

export const PACIENTE_NAV = [
  { to: '/paciente', label: 'Inicio', icon: Home, end: true },
  { to: '/paciente/progreso', label: 'Mi progreso', icon: TrendingUp },
  { to: '/paciente/sesiones', label: 'Mis sesiones', icon: CalendarDays },
  { to: '/paciente/comparar', label: 'Comparar sesiones', icon: GitCompare },
  { to: '/paciente/plan', label: 'Plan de rehabilitación', icon: ClipboardList },
  { to: '/paciente/reportes', label: 'Reportes', icon: FileText },
  { to: '/paciente/perfil', label: 'Perfil', icon: User },
];

export const PROFESIONAL_NAV = [
  { to: '/kinesiologo/pacientes', label: 'Pacientes', icon: Users, end: true },
  { to: '/kinesiologo/sesion/nueva', label: 'Nueva sesión', icon: CalendarPlus },
  { to: '/kinesiologo/sesiones', label: 'Sesiones', icon: CalendarDays },
  { to: '/kinesiologo/seguimiento', label: 'Seguimiento', icon: Activity },
  { to: '/kinesiologo/dispositivo', label: 'Dispositivo', icon: Cpu },
  { to: '/kinesiologo/perfil', label: 'Perfil', icon: User },
];

export const AREA_LABELS = {
  patient: 'Paciente',
  professional: 'Kinesiólogo',
};