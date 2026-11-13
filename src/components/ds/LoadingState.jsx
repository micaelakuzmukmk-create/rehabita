import React from 'react';

export default function LoadingState({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center gap-2.5 py-10 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label}
    </div>
  );
}