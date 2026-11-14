import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Título de sección con divisoria: crea jerarquía con tipografía y espacio,
 * en lugar de encerrar cada bloque en una tarjeta.
 */
export default function SectionHead({ title, description, action, className }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4 border-b border-border pb-2.5', className)}>
      <div className="min-w-0">
        <h2 className="section-title">{title}</h2>
        {description && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}