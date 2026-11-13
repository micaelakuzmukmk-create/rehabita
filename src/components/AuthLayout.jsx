import React from "react";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand-soft blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-brand-mist blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/brand/rehabita-logo-horizontal.png" alt="ReHabita" className="h-10 w-auto" />
          <h1 className="mt-6 font-heading text-[26px] font-semibold leading-tight tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-surface sm:p-8">
          {children}
        </div>

        {footer && <p className="mt-6 text-center text-[13px] text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}