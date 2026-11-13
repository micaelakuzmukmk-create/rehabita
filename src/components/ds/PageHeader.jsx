import React from 'react';
import BackLink from '@/components/ds/BackLink';

export default function PageHeader({ eyebrow, title, subtitle, actions, back }) {
  return (
    <header className="space-y-4">
      {back && <BackLink to={back.to} label={back.label} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h1 className="page-title truncate">{title}</h1>
          {subtitle && <p className="page-sub mt-1.5 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}