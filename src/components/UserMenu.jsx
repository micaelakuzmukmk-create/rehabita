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
import { ArrowLeftRight, LogOut, ChevronDown, Repeat, User } from 'lucide-react';

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
        <button className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:border-brand-lavender focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold text-primary">
            {initial}
          </span>
          <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-foreground sm:inline">
            {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-2xl border-border p-1.5 shadow-surface">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col px-1.5 py-1">
            <span className="truncate text-sm font-medium text-foreground">{user?.full_name || user?.email || 'Usuario'}</span>
            <span className="text-[11px] text-muted-foreground">Área {AREA_LABELS[area]}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(area === 'professional' ? '/kinesiologo/perfil' : '/paciente/perfil')} className="cursor-pointer rounded-lg">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={switchRole} className="cursor-pointer rounded-lg">
          <ArrowLeftRight className="mr-2 h-4 w-4 text-muted-foreground" />
          Cambiar vista
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/seleccionar-perfil', { replace: true })} className="cursor-pointer rounded-lg">
          <Repeat className="mr-2 h-4 w-4 text-muted-foreground" />
          Cambiar perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-danger focus:text-danger">
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}