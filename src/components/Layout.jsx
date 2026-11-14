import React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserMenu from '@/components/UserMenu';
import NavBadge from '@/components/NavBadge';
import DeviceStatusPill from '@/components/DeviceStatusPill';
import { usePatientBadges } from '@/hooks/usePatientBadges';
import { PACIENTE_NAV, PROFESIONAL_NAV, AREA_LABELS } from '@/lib/navigation';

const DETAIL_LABELS = [
  { test: /^\/paciente\/sesion\//, label: 'Reporte de sesión' },
  { test: /^\/kinesiologo\/paciente\/[^/]+\/sesion\/nueva/, label: 'Nueva sesión' },
  { test: /^\/kinesiologo\/paciente\/[^/]+\/plan/, label: 'Plan de rehabilitación' },
  { test: /^\/kinesiologo\/paciente\//, label: 'Ficha del paciente' },
  { test: /^\/kinesiologo\/sesion\//, label: 'Detalle de sesión' },
];

export default function Layout() {
  const location = useLocation();
  const isKinesiologo = location.pathname.startsWith('/kinesiologo');
  const nav = isKinesiologo ? PROFESIONAL_NAV : PACIENTE_NAV;
  const areaLabel = AREA_LABELS[isKinesiologo ? 'professional' : 'patient'];
  const counts = usePatientBadges(!isKinesiologo);

  const detail = DETAIL_LABELS.find((item) => item.test.test(location.pathname));
  const activeItem = [...nav]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
  const screenLabel = detail?.label || activeItem?.label || 'ReHabita';

  const renderNavItems = () =>
    nav.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `group relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
              isActive
                ? 'bg-area-soft font-semibold text-area-ink ring-1 ring-inset ring-area-accent/25'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-area-accent" />
              )}
              <Icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? 'text-area-ink' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.badgeKey && <NavBadge count={counts[item.badgeKey]} />}
            </>
          )}
        </NavLink>
      );
    });

  return (
    <div className={`min-h-screen bg-background ${isKinesiologo ? 'area-professional' : 'area-patient'}`}>
      <Toaster position="top-right" />

      {/* Sidebar desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-[212px] md:flex-col border-r border-border bg-card">
        <div className="px-4 pb-4 pt-5">
          <Link to="/seleccionar-perfil" className="block" aria-label="ReHabita">
            <img src="/brand/rehabita-logo-horizontal.png" alt="ReHabita" className="h-9 w-auto max-w-full" />
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-area-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-area-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-area-accent" />
            Área {areaLabel}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">{renderNavItems()}</nav>

        <div className="border-t border-border px-4 py-4">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            El dispositivo registra · la plataforma traduce · vos interpretás.
          </p>
        </div>
      </aside>

      {/* Columna principal */}
      <div className="flex min-h-screen flex-col md:pl-[212px]">
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/brand/rehabita-logo-horizontal.png"
                alt="ReHabita"
                className="h-8 w-auto md:hidden"
              />
              <div className="hidden min-w-0 md:block">
                <div className="eyebrow">Área {areaLabel}</div>
                <div className="truncate font-heading text-sm font-semibold text-foreground">{screenLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isKinesiologo && <DeviceStatusPill />}
              <UserMenu />
            </div>
          </div>

          {/* Nav mobile */}
          <nav className="flex h-12 items-center gap-1 overflow-x-auto border-t border-border px-3 md:hidden">
            {renderNavItems()}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div key={location.pathname} className="animate-fade-rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}