import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PHASE_LABELS } from '@/lib/rehbaita';
import PageHeader from '@/components/ds/PageHeader';
import SectionHead from '@/components/ds/SectionHead';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import ExerciseCard from '@/components/paciente/ExerciseCard';
import ExerciseGuide from '@/components/paciente/ExerciseGuide';
import BodyFigure from '@/components/paciente/BodyFigure';
import { Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function Plan() {
  const [patient, setPatient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [lastSession, setLastSession] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [guide, setGuide] = useState(null);
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
      setCompletedCount(completed.length);
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

  const total = plan?.total_sessions || null;
  const progress = total ? Math.min(100, Math.round((completedCount / total) * 100)) : null;
  const currentNumber = lastSession?.session_number ?? completedCount;

  return (
    <div className="space-y-7">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Plan de rehabilitación"
        subtitle="Tu plan actual y los ejercicios indicados por tu kinesiólogo."
      />

      {plan ? (
        <Card className="overflow-hidden">
          <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">Plan activo</span>
                <Chip tone="cyan" dot>{PHASE_LABELS[plan.current_phase] || plan.current_phase}</Chip>
              </div>
              <h2 className="mt-2 font-heading text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                {plan.title}
              </h2>

              <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <div className="micro-label">Progreso del plan</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-heading text-[38px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">
                      {progress ?? '—'}
                    </span>
                    <span className="font-heading text-sm font-medium text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <div className="micro-label">Sesión</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-heading text-[22px] font-semibold leading-none text-foreground tabular-nums">
                      {currentNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">/ {total || '—'}</span>
                  </div>
                </div>
                <div>
                  <div className="micro-label">Etapa</div>
                  <div className="mt-1 font-heading text-[15px] font-medium text-foreground">
                    {PHASE_LABELS[plan.current_phase] || plan.current_phase || '—'}
                  </div>
                </div>
              </div>

              {progress != null && (
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-area-accent transition-[width] duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center rounded-2xl bg-area-soft/70 px-4 py-3">
              <BodyFigure side={patient.injury_side} className="h-32 sm:h-36" />
            </div>
          </div>

          <div className="border-t border-border px-5 py-4 sm:px-6">
            {plan.description && <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>}
            {plan.goals && (
              <div className="mt-3 flex items-start gap-2 text-sm text-foreground">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-area-ink" />
                <span className="leading-relaxed">{plan.goals}</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
              {plan.start_date && <span>Inicio: {format(parseISO(plan.start_date), 'dd/MM/yyyy')}</span>}
              {plan.target_end_date && <span>Fin estimado: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</span>}
              {total ? <span>Total: {total} sesiones</span> : null}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState title="Sin plan asignado" description="Todavía no tenés un plan asignado." />
      )}

      <section>
        <SectionHead
          title="Ejercicios indicados"
          description={
            lastSession
              ? `Indicados por tu kinesiólogo en tu última sesión (${format(parseISO(lastSession.date), 'dd/MM/yyyy')}).`
              : 'Todavía no tenés ejercicios indicados.'
          }
        />

        {prescribed.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prescribed.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onOpen={setGuide} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Sin ejercicios para mostrar.</div>
        )}
      </section>

      <ExerciseGuide exercise={guide} side={patient.injury_side} onClose={() => setGuide(null)} />
    </div>
  );
}