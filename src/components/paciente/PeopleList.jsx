import React from 'react';
import { Check, Clock, UserPlus } from 'lucide-react';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { elapsedSince } from '@/lib/format';

export default function PeopleList({ people, plansByPatient, friendIds, pendingIds, onConnect }) {
  if (people.length === 0) {
    return <div className="text-sm text-slate-400">Todavía no hay otros pacientes en rehabilitación.</div>;
  }

  return (
    <div className="space-y-3">
      {people.map((person) => {
        const plan = plansByPatient[person.id];
        const since = elapsedSince(person.injury_date);
        const isFriend = friendIds.has(person.id);
        const isPending = pendingIds.has(person.id);

        return (
          <div key={person.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-medium shrink-0">
                {(person.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">{person.full_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {PHASE_LABELS[plan?.current_phase] || 'En rehabilitación'}
                  {since ? ` · hace ${since} desde la lesión` : ''}
                </div>
              </div>
            </div>

            {isFriend ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg shrink-0">
                <Check className="w-3.5 h-3.5" /> Amigos
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg shrink-0">
                <Clock className="w-3.5 h-3.5" /> Pendiente
              </span>
            ) : (
              <button
                onClick={() => onConnect(person)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" /> Conectar
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}