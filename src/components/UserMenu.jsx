import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { setDemoRole, clearDemoRole } from '@/lib/rehbaita';
import { AREA_LABELS } from '@/lib/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ArrowLeftRight, LogOut, ChevronDown, Repeat } from 'lucide-react';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const area = location.pathname.startsWith('/kinesiologo') ? 'professional' : 'patient';
  const initial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  function switchRole() {
    const next = area === 'professional' ? 'patient' : 'professional';
    setDemoRole(next);
    navigate(next === 'professional' ? '/kinesiologo/pacientes' : '/paciente', { replace: true });
  }

  function handleLogout() {
    clearDemoRole();
    logout();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-2 py-1 hover:border-slate-300 transition">
          <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
            {initial}
          </span>
          <span className="hidden sm:inline text-sm text-slate-700 max-w-[140px] truncate">
            {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm text-slate-800 truncate">{user?.full_name || user?.email || 'Usuario'}</span>
            <span className="text-xs text-slate-400">Área {AREA_LABELS[area]}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={switchRole} className="cursor-pointer">
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Cambiar vista
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/seleccionar-perfil', { replace: true })} className="cursor-pointer">
          <Repeat className="w-4 h-4 mr-2" />
          Cambiar perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 focus:text-rose-700">
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}