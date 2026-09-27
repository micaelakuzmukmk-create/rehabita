import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, setDemoRole } from '@/lib/rehbaita';
import { Stethoscope, HeartPulse, Activity } from 'lucide-react';

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

  // Admin: selector de vista (demo)
  function choose(role) {
    setDemoRole(role);
    navigate(role === 'professional' ? '/profesional' : '/paciente', { replace: true });
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold tracking-tight">rehbaita</span>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Bienvenido a rehbaita</h1>
      <p className="text-slate-500 mt-1">
        Seguimiento de rehabilitación de lesión de LCA. Elegí cómo querés explorar la aplicación:
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <button
          onClick={() => choose('professional')}
          className="group text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-900 hover:shadow-sm transition"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-semibold text-slate-900">Vista Kinesiólogo</div>
          <p className="text-sm text-slate-500 mt-1">
            Pacientes, fichas, sesiones, mediciones, comparativas y plan de rehabilitación.
          </p>
        </button>
        <button
          onClick={() => choose('patient')}
          className="group text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-900 hover:shadow-sm transition"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <HeartPulse className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="font-semibold text-slate-900">Vista Paciente</div>
          <p className="text-sm text-slate-500 mt-1">
            Progreso, reportes de sesión, plan, registro de dolor y confianza, comentarios.
          </p>
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-6">
        Datos simulados cargados para probar la app sin hardware conectado.
      </p>
    </div>
  );
}