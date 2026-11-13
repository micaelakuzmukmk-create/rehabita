import React from 'react';
import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center', className)}>
      {Icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
      )}
      {title && <div className="text-sm font-medium text-foreground">{title}</div>}
      {description && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}