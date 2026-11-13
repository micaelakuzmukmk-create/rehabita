import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setDemoRole } from '@/lib/rehbaita';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

export default function SelectProfile() {
  const navigate = useNavigate();

  function choose(role) {
    setDemoRole(role);
    navigate(role === 'professional' ? '/kinesiologo/pacientes' : '/paciente', { replace: true });
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-soft blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-mist blur-3xl" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <img src="/brand/rehabita-logo-horizontal.png" alt="ReHabita" className="h-11 w-auto" />

        <p className="mt-8 eyebrow">Acceso al sistema</p>
        <h1 className="mt-2 text-center font-heading text-[26px] font-semibold tracking-tight text-foreground sm:text-[32px]">
          Seleccioná un perfil
        </h1>
        <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
          La misma información clínica, dos formas de recorrerla: análisis para el profesional, comprensión para el paciente.
        </p>

        <div className="mt-9 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <button
            onClick={() => choose('patient')}
            className="group flex flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-lavender sm:p-7"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <User className="h-6 w-6" />
            </div>
            <div className="font-heading text-lg font-semibold tracking-tight text-foreground">Paciente</div>
            <div className="mt-1 text-[13px] font-medium text-primary">Seguimiento de mi rehabilitación</div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              Consultá tu progreso, sesiones y la devolución de tu kinesiólogo.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
              Ingresar como paciente
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          <button
            onClick={() => choose('professional')}
            className="group flex flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-lavender sm:p-7"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="font-heading text-lg font-semibold tracking-tight text-foreground">Kinesiólogo</div>
            <div className="mt-1 text-[13px] font-medium text-primary">Gestión y seguimiento de pacientes</div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              Gestioná pacientes, sesiones, mediciones y planes de rehabilitación.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
              Ingresar como kinesiólogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>

        <p className="mt-8 text-[13px] text-muted-foreground">Seleccioná cómo querés ingresar a ReHabita</p>
      </div>

      <footer className="relative pb-6 text-center text-[11px] text-muted-foreground">
        Modo demostración · podés cambiar de perfil en cualquier momento desde tu menú de usuario
      </footer>
    </div>
  );
}