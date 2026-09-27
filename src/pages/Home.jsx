import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, setDemoRole } from '@/lib/rehbaita';
import { Stethoscope, HeartPulse, Activity, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const role = getEffectiveRole(user);
      navigate(role === 'professional' ? '/profesional' : '/paciente', { replace: true });
    }
  }, [user]);

  if (!user) return null;

  function choose(role) {
    setDemoRole(role);
    navigate(role === 'professional' ? '/profesional' : '/paciente', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">rehbaita</span>
        </div>

        <span className="inline-block text-xs font-medium tracking-wide uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
          Modo demostración
        </span>
        <h1 className="text-3xl font-semibold text-slate-900 mt-4">Seleccioná un perfil</h1>
        <p className="text-slate-500 mt-1">
          Elegí cómo querés explorar la aplicación. Podrás cambiar de vista en cualquier momento desde tu menú de usuario.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          {/* ÁREA PACIENTE */}
          <button
            onClick={() => choose('patient')}
            className="group flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-emerald-500 hover:shadow-sm transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-xs font-medium tracking-wide uppercase text-emerald-700">Área paciente</div>
            <div className="text-lg font-semibold text-slate-900 mt-1">Paciente</div>
            <p className="text-sm text-slate-500 mt-1 flex-1">
              Seguimiento de mi rehabilitación
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              Ingresar como paciente
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </span>
          </button>

          {/* ÁREA KINESIÓLOGO */}
          <button
            onClick={() => choose('professional')}
            className="group flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-500 hover:shadow-sm transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-xs font-medium tracking-wide uppercase text-blue-700">Área kinesiólogo</div>
            <div className="text-lg font-semibold text-slate-900 mt-1">Kinesiólogo</div>
            <p className="text-sm text-slate-500 mt-1 flex-1">
              Seguimiento y gestión de pacientes
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700">
              Ingresar como kinesiólogo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Datos simulados cargados para probar la app sin hardware conectado. El selector es solo para presentación académica; en la arquitectura final cada usuario es redirigido automáticamente a su área según su perfil asignado.
        </p>
      </div>
    </div>
  );
}