import React from 'react';
import { format } from 'date-fns';
import { Eraser } from 'lucide-react';

export default function MessageLog({ messages, onClear }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-700">Historial reciente</div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Eraser className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>
      {messages.length === 0 ? (
        <div className="text-sm text-slate-400">Sin mensajes registrados</div>
      ) : (
        <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {messages.slice(0, 20).map((m) => (
            <li key={m.id} className="py-2 flex items-start justify-between gap-3">
              <span className="text-sm font-mono text-slate-800 break-all">
                {m.text || '(binario)'}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">
                {format(m.time, 'HH:mm:ss')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}