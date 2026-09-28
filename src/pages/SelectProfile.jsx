import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setDemoRole } from '@/lib/rehbaita';
import { Activity, User, Stethoscope, ArrowRight } from 'lucide-react';

export default function SelectProfile() {
  const navigate = useNavigate();

  function choose(role) {
    setDemoRole(role);
    navigate(role === 'professional' ? '/kinesiologo/pacientes' : '/paciente', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Marca */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">ReHabita</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center">Seleccioná un perfil</h1>

        {/* Tarjetas */}
        <div className="grid sm:grid-cols-2 gap-5 mt-8 w-full max-w-3xl">
          {/* Paciente */}
          <button
            onClick={() => choose('patient')}
            className="group flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-7 hover:border-teal-500 hover:shadow-sm transition"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
              <User className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-lg font-semibold text-slate-900">Paciente</div>
            <div className="text-sm text-teal-700 font-medium mt-0.5">Seguimiento de mi rehabilitación</div>
            <p className="text-sm text-slate-500 mt-2 flex-1">Consultá tu progreso, sesiones y evolución</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700">
              Ingresar como paciente
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </span>
          </button>

          {/* Kinesiólogo */}
          <button
            onClick={() => choose('professional')}
            className="group flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-7 hover:border-slate-900 hover:shadow-sm transition"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-5">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="text-lg font-semibold text-slate-900">Kinesiólogo</div>
            <div className="text-sm text-slate-500 font-medium mt-0.5">Gestión y seguimiento de pacientes</div>
            <p className="text-sm text-slate-500 mt-2 flex-1">Gestioná pacientes, sesiones y mediciones</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
              Ingresar como kinesiólogo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </span>
          </button>
        </div>

        {/* Leyenda */}
        <p className="text-sm text-slate-400 mt-8">Seleccioná cómo querés ingresar a ReHabita</p>
      </div>

      <footer className="text-center text-xs text-slate-400 pb-6">
        Modo demostración · podés cambiar de perfil en cualquier momento desde tu menú de usuario
      </footer>
    </div>
  );
}