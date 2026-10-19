import React from 'react';
import { Check, Clock, X } from 'lucide-react';

export default function RequestsList({ incoming, outgoing, patientById, onRespond }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Solicitudes recibidas</div>
        {incoming.length === 0 ? (
          <div className="text-sm text-slate-400">No tenés solicitudes pendientes.</div>
        ) : (
          <div className="space-y-3">
            {incoming.map((friendship) => {
              const person = patientById[friendship.requester_patient_id];
              return (
                <div key={friendship.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{person?.full_name || 'Paciente'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Quiere conectar con vos</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRespond(friendship, 'aceptada')}
                      className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Check className="w-3.5 h-3.5" /> Aceptar
                    </button>
                    <button
                      onClick={() => onRespond(friendship, 'rechazada')}
                      className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300"
                    >
                      <X className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Solicitudes enviadas</div>
        {outgoing.length === 0 ? (
          <div className="text-sm text-slate-400">No enviaste solicitudes pendientes.</div>
        ) : (
          <div className="space-y-3">
            {outgoing.map((friendship) => {
              const person = patientById[friendship.addressee_patient_id];
              return (
                <div key={friendship.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{person?.full_name || 'Paciente'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Esperando respuesta</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg shrink-0">
                    <Clock className="w-3.5 h-3.5" /> Pendiente
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}