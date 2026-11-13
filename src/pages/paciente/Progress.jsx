import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProgressRing from '@/components/paciente/ProgressRing';
import MuscleStrengthChart from '@/components/paciente/MuscleStrengthChart';
import InjuriousMovementsChart from '@/components/paciente/InjuriousMovementsChart';
import MuscleActivitySummary from '@/components/paciente/MuscleActivitySummary';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import LoadingState from '@/components/ds/LoadingState';
import { Activity, Dumbbell, AlertTriangle, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_TOTAL_SESSIONS = 24;

export default function PatientProgress() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [plan, setPlan] = useState(null);
  const [measurementSessions, setMeasurementSessions] = useState([]);
  const [measurementSummaries, setMeasurementSummaries] = useState({});
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
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 100),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 100),
        base44.entities.RehabPlan.filter({ patient_id: p.id, status: 'activo' }, '-created_date', 5),
      ]);
      setSessions(s);
      setMetrics(m);
      setPlan(pl[0] || null);

      const [ms, ss] = await Promise.all([
        base44.entities.MeasurementSession.filter({ patient_id: p.id }, '-started_at', 100),
        base44.entities.SessionSummary.filter({ patient_id: p.id }, '-created_date', 200),
      ]);
      setMeasurementSessions(ms.filter(x => x.status !== 'activa'));
      setMeasurementSummaries(Object.fromEntries(ss.map(x => [x.session_id, x])));
    } catch (e) {
      toast.error('No se pudo cargar tu progreso');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState label="Cargando tu progreso…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado. Pedí a tu kinesiólogo que te asigne.</div>;

  const sessionsAsc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));

  const completed = sessions.filter(s => s.status === 'completada').length;
  const total = plan?.total_sessions || DEFAULT_TOTAL_SESSIONS;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id] || {};
    return {
      label: `S${i + 1}`,
      strength_vastus_medialis: m.strength_vastus_medialis ?? null,
      strength_vastus_lateralis: m.strength_vastus_lateralis ?? null,
      strength_hamstrings: m.strength_hamstrings ?? null,
      injurious_movements: m.injurious_movements ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Mi progreso"
        subtitle="Cómo venís avanzando en tu rehabilitación, sesión a sesión."
      />

      {/* Sesiones realizadas de las totales a realizar */}
      <SectionCard
        icon={CalendarCheck}
        title="Sesiones realizadas"
        description={plan ? `Plan: ${plan.title}` : 'Plan de rehabilitación'}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <ProgressRing value={pct} size={132} color="#3B1A7B" label="completadas" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-baseline justify-center gap-1.5 sm:justify-start">
              <span className="font-heading text-[34px] font-semibold leading-none tracking-tight text-foreground tabular-nums">{completed}</span>
              <span className="text-sm text-muted-foreground">de {total} sesiones</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted sm:max-w-sm">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">{pct}% del plan completado</div>
          </div>
        </div>
      </SectionCard>

      {/* Fuerza por grupo muscular */}
      <SectionCard icon={Dumbbell} title="Fuerza por grupo muscular" description="Fuerza adquirida en cada sesión, por grupo muscular.">
        <MuscleStrengthChart data={chartData} />
      </SectionCard>

      {/* Movimientos lesivos */}
      <SectionCard icon={AlertTriangle} title="Movimientos lesivos" description="Cantidad de movimientos lesivos registrados en cada sesión.">
        <InjuriousMovementsChart data={chartData} />
      </SectionCard>

      {/* Actividad muscular registrada con el wearable */}
      <SectionCard
        icon={Activity}
        title="Actividad muscular registrada"
        description="Índices máximos de actividad de cada grupo muscular en tus mediciones con el wearable."
      >
        <MuscleActivitySummary sessions={measurementSessions} summaries={measurementSummaries} />
      </SectionCard>
    </div>
  );
}