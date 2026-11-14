import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SessionsCalendar from '@/components/paciente/SessionsCalendar';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import LoadingState from '@/components/ds/LoadingState';
import MetricHero from '@/components/ds/MetricHero';
import { CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_TOTAL_SESSIONS = 24;

export default function PatientSessions() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [plan, setPlan] = useState(null);
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
      const [s, m, pl] = await Promise.all([
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 200),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 200),
        base44.entities.RehabPlan.filter({ patient_id: p.id, status: 'activo' }, '-created_date', 5),
      ]);
      setSessions(s);
      setMetrics(m);
      setPlan(pl[0] || null);
    } catch (e) {
      toast.error('No se pudieron cargar tus sesiones');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState label="Cargando tus sesiones…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado. Pedí a tu kinesiólogo que te asigne.</div>;

  const sessionsAsc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));

  const total = plan?.total_sessions || DEFAULT_TOTAL_SESSIONS;
  const completed = sessions.filter(s => s.status === 'completada');
  const abandoned = sessions.filter(s => s.status === 'cancelada');
  const remaining = Math.max(0, total - completed.length);

  const withPain = completed.filter(s => (metricBySession[s.id]?.pain_perceived ?? 0) > 0).length;
  const withoutPain = completed.length - withPain;

  const stats = [
    { label: 'Por realizar', value: remaining, tone: 'cyan' },
    { label: 'Abandonadas', value: abandoned.length, tone: 'danger' },
    { label: 'Con dolor', value: withPain, tone: 'warning' },
    { label: 'Sin dolor', value: withoutPain, tone: 'success' },
  ];

  const DOT_TONES = {
    cyan: 'bg-brand-cyan',
    danger: 'bg-danger',
    warning: 'bg-warning',
    success: 'bg-success',
  };

  const sessionDates = sessionsAsc.map(s => s.date);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Mis sesiones"
        subtitle="Resumen de tus sesiones de rehabilitación."
      />

      {/* Resumen */}
      <section className="rounded-2xl border border-border bg-card px-5 py-5 shadow-surface sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <MetricHero
            label="Sesiones realizadas"
            value={completed.length}
            unit={`/ ${total}`}
            caption="de tu plan de rehabilitación"
          />

          <div className="hidden h-16 w-px shrink-0 bg-border sm:block" />

          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {stats.map((st) => (
              <div key={st.label}>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[st.tone]}`} />
                  <span className="micro-label">{st.label}</span>
                </div>
                <div className="mt-1 font-heading text-xl font-semibold leading-none text-foreground tabular-nums">
                  {st.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendario de sesiones */}
      <SectionCard
        icon={CalendarDays}
        title="Fechas de tus sesiones"
        description="Los días marcados son las fechas en las que realizaste sesiones."
      >
        <SessionsCalendar dates={sessionDates} />
      </SectionCard>
    </div>
  );
}