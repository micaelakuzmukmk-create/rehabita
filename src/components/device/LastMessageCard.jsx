import React from 'react';
import { Inbox } from 'lucide-react';
import { format } from 'date-fns';

export default function LastMessageCard({ message }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-medium text-slate-700 mb-3">Último mensaje recibido</div>
      {message ? (
        <div className="rounded-lg bg-slate-900 p-4">
          <div className="text-lg font-mono text-emerald-400 break-all">
            {message.text || '(sin texto legible)'}
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-400 break-all">
            HEX: {message.hex || '—'}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {format(message.time, 'dd/MM/yyyy HH:mm:ss')}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-8 text-center">
          <Inbox className="w-6 h-6 text-slate-400" />
          <div className="text-sm text-slate-500">Todavía no se recibieron datos</div>
        </div>
      )}
    </div>
  );
}