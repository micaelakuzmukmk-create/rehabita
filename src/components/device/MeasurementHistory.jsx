import React from 'react';
import { format, parseISO } from 'date-fns';
import { Database, RefreshCw } from 'lucide-react';

function formatReceived(value) {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm:ss');
  } catch {
    return value;
  }
}

export default function MeasurementHistory({ records, loading, onRefresh }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Database className="w-4 h-4" /> Historial de registros guardados
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Cargando historial…</div>
      ) : records.length === 0 ? (
        <div className="text-sm text-slate-400">Todavía no hay registros guardados</div>
      ) : (
        <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {records.map((r) => (
            <li key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="min-w-0">
                <div className="text-sm font-mono text-slate-800 break-all">{r.message}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {r.device_name || '—'} · sesión {(r.session_id || '—').slice(0, 8)} · {r.data_type || '—'}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 shrink-0">{formatReceived(r.received_at)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}