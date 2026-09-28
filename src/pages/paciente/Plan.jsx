import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { ArrowLeft, Target, Dumbbell } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const DIFFICULTY_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta' };

export default function Plan() {
  const [patient, setPatient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [lastSession, setLastSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const me = await base44.auth.me();
      let patients = [];
      try { patients = await base44.entities.Patient.filter({ user_id: me.id }, '-created_date', 5); } catch (_) {}
      if (patients.length === 0) patients = await base44.entities.Patient.list('-created_date', 1);
      const p = patients[0];
      if (!p) { setLoading(false); return; }
      setPatient(p);

      const [plans, ex, ss] = await Promise.all([
        base44.entities.RehabPlan.filter({ patient_id: p.id }, '-created_date', 5),
        base44.entities.Exercise.list('-created_date', 100),
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 200),
      ]);
      setPlan(plans.find(x => x.status === 'activo') || plans[0] || null);
      setExercises(ex);
      const completed = ss
        .filter(s => s.status === 'completada')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setLastSession(completed[0] || null);
    } catch (e) {
      toast.error('No se pudo cargar tu plan');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado.</div>;

  const prescribed = (lastSession?.exercises || [])
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Plan de rehabilitación</h1>
        <p className="text-sm text-slate-500">Tu plan actual y los ejercicios indicados por tu kinesiólogo.</p>
      </div>

      {plan ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="font-semibold text-slate-900">{plan.title}</div>
            <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 whitespace-nowrap">
              {PHASE_LABELS[plan.current_phase] || plan.current_phase}
            </span>
          </div>
          {plan.description && <p className="text-sm text-slate-600">{plan.description}</p>}
          {plan.goals && (
            <div className="mt-3 flex items-start gap-2 text-sm text-slate-700">
              <Target className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>{plan.goals}</span>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {plan.start_date && <span>Inicio: {format(parseISO(plan.start_date), 'dd/MM/yyyy')}</span>}
            {plan.target_end_date && <span>Fin estimado: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</span>}
            {plan.total_sessions ? <span>Total: {plan.total_sessions} sesiones</span> : null}
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-400">Todavía no tenés un plan asignado.</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
          <Dumbbell className="w-4 h-4 text-slate-500" /> Ejercicios indicados
        </div>
        <p className="text-sm text-slate-500 mb-3">
          {lastSession
            ? `Indicados por tu kinesiólogo en tu última sesión (${format(parseISO(lastSession.date), 'dd/MM/yyyy')}).`
            : 'Todavía no tenés ejercicios indicados.'}
        </p>

        {prescribed.length > 0 ? (
          <ul className="space-y-3">
            {prescribed.map(ex => (
              <li key={ex.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-slate-900">{ex.name}</div>
                  {ex.difficulty && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 whitespace-nowrap">
                      Dificultad {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {ex.category}{ex.target_muscle ? ` · ${ex.target_muscle}` : ''}
                </div>
                {(ex.instructions || ex.description) && (
                  <p className="text-sm text-slate-600 mt-2">{ex.instructions || ex.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-400">Sin ejercicios para mostrar.</div>
        )}
      </div>
    </div>
  );
}