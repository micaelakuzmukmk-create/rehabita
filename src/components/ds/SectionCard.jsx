import React from 'react';
import Card from '@/components/ds/Card';
import { cn } from '@/lib/utils';

export default function SectionCard({ icon: Icon, title, description, action, className, bodyClassName, children }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="section-title">{title}</h2>}
              {description && <p className="page-sub mt-1">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('px-5 pb-5 pt-4 sm:px-6 sm:pb-6', bodyClassName)}>{children}</div>
    </Card>
  );
}