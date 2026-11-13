import React from 'react';
import { Inbox } from 'lucide-react';
import { format } from 'date-fns';
import Card from '@/components/ds/Card';

export default function LastMessageCard({ message }) {
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="section-title mb-3">Último mensaje recibido</h3>
      {message ? (
        <div className="rounded-xl bg-primary p-4">
          <div className="break-all font-mono text-base text-brand-cyan">
            {message.text || '(sin texto legible)'}
          </div>
          <div className="mt-3 break-all font-mono text-[11px] text-slate-400">
            HEX: {message.hex || '—'}
          </div>
          <div className="mt-2 text-[11px] text-slate-300">
            {format(message.time, 'dd/MM/yyyy HH:mm:ss')}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
          <Inbox className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">Todavía no se recibieron datos</div>
        </div>
      )}
    </Card>
  );
}