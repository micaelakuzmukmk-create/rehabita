import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SessionsCalendar from '@/components/paciente/SessionsCalendar';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import LoadingState from '@/components/ds/LoadingState';
import { CheckCircle2, Clock, XCircle, Frown, Smile, CalendarDays } from 'lucide-react';
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
    { label: 'Realizadas', value: `${completed.length} / ${total}`, icon: CheckCircle2, tone: 'primary' },
    { label: 'Por realizar', value: remaining, icon: Clock, tone: 'cyan' },
    { label: 'Abandonadas', value: abandoned.length, icon: XCircle, tone: 'danger' },
    { label: 'Con dolor', value: withPain, icon: Frown, tone: 'warning' },
    { label: 'Sin dolor', value: withoutPain, icon: Smile, tone: 'success' },
  ];

  const ICON_TONES = {
    primary: 'bg-secondary text-primary',
    cyan: 'bg-accent text-brand-blue',
    danger: 'bg-danger-soft text-danger',
    warning: 'bg-warning-soft text-warning',
    success: 'bg-success-soft text-success',
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.label} className="card p-4">
              <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${ICON_TONES[st.tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="font-heading text-xl font-semibold leading-none tracking-tight text-foreground tabular-nums">{st.value}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{st.label}</div>
            </div>
          );
        })}
      </div>

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