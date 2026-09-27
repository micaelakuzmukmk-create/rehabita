import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, clearDemoRole } from '@/lib/rehbaita';
import { Activity, Users, LogOut, ArrowLeftRight } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = getEffectiveRole(user);
  const isAdminPreview = user?.role === 'admin';

  function handleLogout() {
    clearDemoRole();
    logout();
  }

  function switchPreview() {
    clearDemoRole();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-slate-900">rehbaita</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
              {role === 'professional' ? 'Kinesiólogo' : 'Paciente'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdminPreview && (
              <button
                onClick={switchPreview}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
              >
                <ArrowLeftRight className="w-4 h-4" /> Cambiar vista
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
        {role === 'professional' && (
          <nav className="max-w-6xl mx-auto px-4 h-10 flex items-center gap-5 text-sm">
            <NavLink to="/profesional" end className={({ isActive }) => `flex items-center gap-1.5 ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
              <Users className="w-4 h-4" /> Pacientes
            </NavLink>
          </nav>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}