import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FriendsList({ friends, onOpen }) {
  if (friends.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        Todavía no tenés amigos en rehabilitación. Enviá una solicitud desde la pestaña Compañeros.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map(({ friendship, patient }) => (
        <button
          key={friendship.id}
          onClick={() => onOpen(friendship.id)}
          className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium shrink-0">
              {(patient.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{patient.full_name}</div>
              <div className="text-xs text-slate-500 mt-0.5">En rehabilitación</div>
            </div>
          </div>
          <MessageCircle className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      ))}
    </div>
  );
}