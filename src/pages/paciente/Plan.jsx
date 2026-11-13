import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PHASE_LABELS } from '@/lib/rehbaita';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import { Target, Dumbbell } from 'lucide-react';
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

  if (loading) return <LoadingState label="Cargando tu plan…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado.</div>;

  const prescribed = (lastSession?.exercises || [])
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Plan de rehabilitación"
        subtitle="Tu plan actual y los ejercicios indicados por tu kinesiólogo."
      />

      {plan ? (
        <Card className="relative overflow-hidden p-5 sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-soft blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Plan activo</div>
                <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight text-foreground">{plan.title}</h2>
              </div>
              <Chip tone="primary" dot>{PHASE_LABELS[plan.current_phase] || plan.current_phase}</Chip>
            </div>

            {plan.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>}

            {plan.goals && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-3.5 text-sm text-foreground">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="leading-relaxed">{plan.goals}</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
              {plan.start_date && <span>Inicio: {format(parseISO(plan.start_date), 'dd/MM/yyyy')}</span>}
              {plan.target_end_date && <span>Fin estimado: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</span>}
              {plan.total_sessions ? <span>Total: {plan.total_sessions} sesiones</span> : null}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState title="Sin plan asignado" description="Todavía no tenés un plan asignado." />
      )}

      <SectionCard
        icon={Dumbbell}
        title="Ejercicios indicados"
        description={
          lastSession
            ? `Indicados por tu kinesiólogo en tu última sesión (${format(parseISO(lastSession.date), 'dd/MM/yyyy')}).`
            : 'Todavía no tenés ejercicios indicados.'
        }
      >
        {prescribed.length > 0 ? (
          <ul className="space-y-2.5">
            {prescribed.map(ex => (
              <li key={ex.id} className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-heading text-sm font-medium text-foreground">{ex.name}</div>
                  {ex.difficulty && (
                    <Chip tone="neutral" className="bg-card">Dificultad {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}</Chip>
                  )}
                </div>
                <div className="mt-1 text-[11px] capitalize text-muted-foreground">
                  {ex.category}{ex.target_muscle ? ` · ${ex.target_muscle}` : ''}
                </div>
                {(ex.instructions || ex.description) && (
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{ex.instructions || ex.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">Sin ejercicios para mostrar.</div>
        )}
      </SectionCard>
    </div>
  );
}