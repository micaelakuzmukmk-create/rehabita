import React from 'react';
import { AlertTriangle } from 'lucide-react';

const UserNotRegisteredError = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-soft blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-brand-mist blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-surface">
        <div className="text-center">
          <img src="/brand/rehabita-logo-horizontal.png" alt="ReHabita" className="mx-auto h-9 w-auto" />

          <div className="mb-5 mt-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft">
            <AlertTriangle className="h-7 w-7 text-warning" />
          </div>

          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Acceso restringido</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            No estás registrado para usar esta aplicación. Contactá al administrador para solicitar acceso.
          </p>

          <div className="mt-6 rounded-xl bg-muted p-4 text-left text-[13px] text-muted-foreground">
            <p className="font-medium text-foreground">Si creés que es un error, podés:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Verificar que estés con la cuenta correcta</li>
              <li>Pedir acceso al administrador de la aplicación</li>
              <li>Salir y volver a ingresar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;