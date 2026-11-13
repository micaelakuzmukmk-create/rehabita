import React from 'react';
import PageHeader from '@/components/ds/PageHeader';

export default function AreaPlaceholder({ title, description, icon: Icon }) {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader eyebrow="ReHabita" title={title} subtitle={description} />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
        {Icon && (
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="section-title">Sección en desarrollo</div>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Esta pantalla formará parte del área y estará disponible próximamente dentro de ReHabita.
        </p>
      </div>
    </div>
  );
}