import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRIC_MAP, PHASE_LABELS, qualitative, metricDelta } from '@/lib/rehbaita';
import EvolutionChart from '@/components/paciente/EvolutionChart';
import ProgressRing from '@/components/paciente/ProgressRing';
import MiniSpark from '@/components/paciente/MiniSpark';
import MuscleStrengthChart from '@/components/paciente/MuscleStrengthChart';
import InjuriousMovementsChart from '@/components/paciente/InjuriousMovementsChart';
import MuscleActivitySummary from '@/components/paciente/MuscleActivitySummary';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import SectionHead from '@/components/ds/SectionHead';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { Button } from '@/components/ui/button';
import { Activity, ArrowLeftRight, ArrowRight, Dumbbell, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const DEFAULT_TOTAL_SESSIONS = 24;
const IMPROVEMENT_KEYS = ['symmetry', 'stability', 'knee_flexion_angle', 'confidence_perceived', 'pain_perceived', 'movement_control'];

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

  const sessionsData = sessionsAsc.filter(s => metricBySession[s.id]);

  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id] || {};
    return {
      label: `S${s.session_number ?? i + 1}`,
      symmetry: m.symmetry ?? null,
      stability: m.stability ?? null,
      knee_flexion_angle: m.knee_flexion_angle ?? null,
      pain_perceived: m.pain_perceived ?? null,
      confidence_perceived: m.confidence_perceived ?? null,
      strength_vastus_medialis: m.strength_vastus_medialis ?? null,
      strength_vastus_lateralis: m.strength_vastus_lateralis ?? null,
      strength_hamstrings: m.strength_hamstrings ?? null,
      injurious_movements: m.injurious_movements ?? 0,
    };
  });

  const completed = sessions.filter(s => s.status === 'completada').length;
  const total = plan?.total_sessions || DEFAULT_TOTAL_SESSIONS;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const lastSession = sessionsData[sessionsData.length - 1];
  const prevSession = sessionsData[sessionsData.length - 2];
  const lastM = lastSession ? metricBySession[lastSession.id] : null;
  const prevM = prevSession ? metricBySession[prevSession.id] : null;

  const improvements = IMPROVEMENT_KEYS
    .map((key) => ({ key, ...(metricDelta(key, lastM?.[key], prevM?.[key]) || {}) }))
    .filter((d) => d.delta != null);

  const trendRows = [...sessionsData].reverse().slice(0, 8).reverse();

  return (
    <div className="space-y-7">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Mi progreso"
        subtitle="Tu evolución en gráficos. El detalle sesión por sesión está en Comparar sesiones."
        actions={
          <Link to="/paciente/comparar">
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Comparar sesiones
            </Button>
          </Link>
        }
      />

      {/* Resumen superior */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-surface">
        <div className="grid divide-y divide-border sm:grid-cols-[auto_1fr_1fr] sm:divide-x sm:divide-y-0">
          <div className="flex items-center justify-center p-5">
            <ProgressRing value={pct} size={124} stroke={11} color="#2CB1D2" label="del plan" />
          </div>

          <div className="p-5">
            <div className="micro-label">Sesiones realizadas</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-heading text-[32px] font-semibold leading-none tracking-[-0.02em] text-foreground tabular-nums">
                {completed}
              </span>
              <span className="text-[11px] text-muted-foreground">de {total}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-area-accent transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            {plan && <div className="mt-2 truncate text-[11px] text-muted-foreground">{plan.title}</div>}
          </div>

          <div className="p-5">
            <div className="micro-label">Etapa actual</div>
            <div className="mt-2 font-heading text-[17px] font-semibold text-foreground">
              {plan?.current_phase ? PHASE_LABELS[plan.current_phase] : '—'}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lastSession && <Chip tone="cyan">Última: {format(parseISO(lastSession.date), 'dd/MM/yy')}</Chip>}
              <Chip tone="neutral">{sessions.length} sesiones registradas</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Evolución temporal */}
      <section>
        <SectionHead title="Evolución en el tiempo" description="Cada punto es una sesión. Las mesetas y los descensos también son parte del proceso." />
        <div className="grid gap-3 lg:grid-cols-2">
          <SectionCard title="Simetría" description="Diferencia de trabajo entre ambas piernas (%)">
            <EvolutionChart data={chartData} keys={['symmetry']} height={200} />
          </SectionCard>
          <SectionCard title="Estabilidad" description="Control del apoyo a lo largo del plan">
            <EvolutionChart data={chartData} keys={['stability']} height={200} />
          </SectionCard>
          <SectionCard title="Flexión de rodilla" description="Recorrido articular en grados">
            <EvolutionChart data={chartData} keys={['knee_flexion_angle']} height={200} />
          </SectionCard>
          <SectionCard title="Dolor y confianza" description="Cómo te sentiste, sesión a sesión">
            <EvolutionChart data={chartData} keys={['pain_perceived', 'confidence_perceived']} height={200} />
          </SectionCard>
        </div>
      </section>

      {/* Últimas mejoras */}
      <section>
        <SectionHead
          title="Últimas mejoras"
          description={prevSession ? `Comparado con la sesión anterior (${format(parseISO(prevSession.date), 'dd/MM/yy')}).` : 'Se muestran a partir de tu segunda sesión.'}
        />
        {improvements.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Todavía no hay dos sesiones con datos para calcular mejoras.
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {improvements.slice(0, 6).map((d) => {
              const m = METRIC_MAP[d.key];
              const Icon = d.improved ? TrendingUp : ArrowRight;
              return (
                <div key={d.key} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="micro-label">{m.label}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                        d.delta === 0 ? 'bg-muted text-muted-foreground' : d.improved ? 'bg-area-soft text-area-ink' : 'bg-warning-soft text-warning'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {d.delta > 0 ? '+' : ''}{Math.round(d.delta * 10) / 10}{m.unit}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-heading text-[22px] font-semibold leading-none text-foreground tabular-nums">
                      {Math.round((lastM?.[d.key] ?? 0) * 10) / 10}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{m.unit}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{qualitative(d.key, lastM?.[d.key])}</div>
                  <MiniSpark data={trendRows} dataKey={d.key} color={m.color} height={34} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Próximos objetivos */}
      <section>
        <SectionHead title="Próximos objetivos" />
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-area-ink" />
            <div className="min-w-0">
              <p className="text-[13px] leading-relaxed text-foreground">
                {plan?.goals || 'Tu kinesiólogo va a definir los objetivos del plan.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="cyan">Faltan {Math.max(0, total - completed)} sesiones</Chip>
                {plan?.target_end_date && (
                  <Chip tone="neutral">Fin estimado {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</Chip>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fuerza y seguridad del movimiento */}
      <section>
        <SectionHead title="Fuerza y seguridad del movimiento" />
        <div className="grid gap-3 lg:grid-cols-2">
          <SectionCard icon={Dumbbell} title="Fuerza por grupo muscular" description="Fuerza adquirida en cada sesión.">
            <MuscleStrengthChart data={chartData} />
          </SectionCard>
          <SectionCard icon={AlertTriangle} title="Movimientos lesivos" description="Cantidad registrada en cada sesión.">
            <InjuriousMovementsChart data={chartData} />
          </SectionCard>
        </div>
      </section>

      <SectionCard
        icon={Activity}
        title="Actividad muscular registrada"
        description="Índices máximos de actividad de cada grupo muscular en tus mediciones con el wearable."
      >
        <MuscleActivitySummary sessions={measurementSessions} summaries={measurementSummaries} />
      </SectionCard>

      <div className="rounded-2xl border border-area-accent/40 bg-area-soft/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <div className="font-heading text-[15px] font-semibold text-foreground">¿Querés ver qué cambió entre dos sesiones?</div>
          <p className="mt-1 text-[12px] text-muted-foreground">Compará dos sesiones y mirá las diferencias en detalle.</p>
        </div>
        <Link to="/paciente/comparar" className="mt-3 inline-block sm:mt-0">
          <Button className="bg-area-ink text-white">
            <ArrowLeftRight className="h-4 w-4" /> Comparar sesiones
          </Button>
        </Link>
      </div>
    </div>
  );
}