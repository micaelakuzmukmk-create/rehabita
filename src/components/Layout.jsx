import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import UserMenu from '@/components/UserMenu';
import { PACIENTE_NAV, PROFESIONAL_NAV, AREA_LABELS } from '@/lib/navigation';

export default function Layout() {
  const location = useLocation();
  const isKinesiologo = location.pathname.startsWith('/kinesiologo');
  const nav = isKinesiologo ? PROFESIONAL_NAV : PACIENTE_NAV;
  const areaLabel = AREA_LABELS[isKinesiologo ? 'professional' : 'patient'];

  const renderNavItems = (itemClass, iconClass) =>
    nav.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${itemClass(isActive)}`
          }
        >
          <Icon className={iconClass} />
          {item.label}
        </NavLink>
      );
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-60 border-r border-slate-200 bg-white">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-slate-900">rehbaita</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderNavItems(
            (a) => (a ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'),
            'w-4 h-4 shrink-0'
          )}
        </nav>
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">Área {areaLabel}</div>
      </aside>

      {/* Columna principal */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="md:hidden w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="md:hidden font-semibold tracking-tight text-slate-900">rehbaita</span>
              <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Área {areaLabel}
              </span>
            </div>
            <UserMenu />
          </div>

          {/* Nav mobile */}
          <nav className="md:hidden flex items-center gap-1 px-3 h-12 overflow-x-auto border-t border-slate-100">
            {renderNavItems(
              (a) => (a ? 'bg-slate-100 text-slate-900 font-medium whitespace-nowrap' : 'text-slate-600 hover:text-slate-900 whitespace-nowrap'),
              'w-4 h-4 shrink-0'
            )}
          </nav>
        </header>

        <main className="max-w-6xl w-full mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}