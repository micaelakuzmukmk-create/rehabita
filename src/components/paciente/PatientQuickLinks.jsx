import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeftRight, ClipboardList, MessageSquareQuote, TrendingUp } from 'lucide-react';

const LINKS = [
  { to: '/paciente/progreso', label: 'Ver mi progreso', icon: TrendingUp },
  { to: '/paciente/comparar', label: 'Comparar sesiones', icon: ArrowLeftRight },
  { to: '/paciente/plan', label: 'Plan de rehabilitación', icon: ClipboardList },
  { to: '/paciente/reportes', label: 'Último reporte', icon: MessageSquareQuote },
];

export default function PatientQuickLinks() {
  return (
    <nav className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {LINKS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-area-accent/60"
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-area-ink" />
            <span className="text-[13px] font-medium leading-tight text-foreground">{label}</span>
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-area-ink" />
        </Link>
      ))}
    </nav>
  );
}