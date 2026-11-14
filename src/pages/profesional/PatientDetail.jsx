import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS, PHASE_LABELS } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import Tabs from '@/components/ds/Tabs';
import MetricHero from '@/components/ds/MetricHero';
import PatientFeedbackList from '@/components/profesional/PatientFeedbackList';
import DataList from '@/components/ds/DataList';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus, FileText, ClipboardList, MessageSquare, ArrowUpRight, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'Resumen', label: 'Resumen' },
  { key: 'Sesiones', label: 'Sesiones' },
  { key: 'Evolucion', label: 'Evolución' },
  { key: 'Comparaciones', label: 'Comparaciones' },
  { key: 'Plan', label: 'Plan' },
  { key: 'Reportes', label: 'Reportes' },
];

const STATUS_TONE = { activo: 'success', pausa: 'warning', alta: 'primary' };
const STATUS_LABEL = { activo: 'Activo', pausa: 'Pausa', alta: 'Finalizado' };

export default function PatientDetail() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [plans, setPlans] = useState([]);
  const [comments, setComments] = useState([]);
  const [tab, setTab] = useState('Resumen');
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [patientId]);

  async function load() {
    setLoading(true);
    try {
      const [p, s, m, pl, c] = await Promise.all([
        base44.entities.Patient.get(patientId),
        base44.entities.Session.filter({ patient_id: patientId }, '-date', 100),
        base44.entities.SessionMetrics.filter({ patient_id: patientId }, '-created_date', 100),
        base44.entities.RehabPlan.filter({ patient_id: patientId }, '-created_date', 10),
        base44.entities.ProfessionalComment.filter({ patient_id: patientId }, '-date', 50),
      ]);
      setPatient(p);
      setSessions(s);
      setMetrics(m);
      setPlans(pl);
      setComments(c);
    } catch (e) {
      toast.error('No se pudo cargar la ficha');
    } finally {
      setLoading(false);
    }
  }

  // ordenar sesiones ascendente por fecha para gráficos
  const sessionsAsc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));

  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id];
    const row = { label: `S${i + 1}` };
    if (m) METRICS.forEach(mm => row[mm.key] = m[mm.key]);
    return row;
  });

  const lastSession = sessionsAsc[sessionsAsc.length - 1];
  const lastMetrics = lastSession ? metricBySession[lastSession.id] : null;
  const prevMetrics = sessionsAsc.length > 1 ? metricBySession[sessionsAsc[sessionsAsc.length - 2].id] : null;

  async function addComment() {
    if (!newComment.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.ProfessionalComment.create({
        patient_id: patientId,
        content: newComment.trim(),
        date: new Date().toISOString(),
      });
      setComments([created, ...comments]);
      setNewComment('');
      toast.success('Comentario guardado');
    } catch (e) {
      toast.error('No se pudo guardar el comentario');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Cargando ficha…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">Paciente no encontrado</div>;

  const plan = plans[0];
  const currentSession = lastSession?.session_number ?? sessions.length;
  const totalSessions = plan?.total_sessions || null;

  const metricDeltaOf = (key) =>
    lastMetrics?.[key] != null && prevMetrics?.[key] != null
      ? Math.round((lastMetrics[key] - prevMetrics[key]) * 10) / 10
      : null;

  const lastSessionRows = lastMetrics
    ? METRICS.filter((m) => m.key !== 'symmetry').map((m) => {
        const d = metricDeltaOf(m.key);
        return {
          label: m.label,
          value:
            lastMetrics[m.key] != null
              ? `${Math.round(lastMetrics[m.key] * 10) / 10}${m.unit ? ` ${m.unit}` : ''}`
              : '—',
          delta: d,
          deltaUnit: m.unit ? ` ${m.unit}` : '',
          improved: d == null ? undefined : m.higherBetter ? d >= 0 : d <= 0,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/kinesiologo/pacientes', label: 'Volver a pacientes' }}
        actions={
          <Link to={`/kinesiologo/paciente/${patientId}/sesion/nueva`}>
            <Button><Plus className="h-4 w-4" /> Nueva sesión</Button>
          </Link>
        }
        title={patient.full_name}
        subtitle={
          <span>
            Rodilla {patient.injury_side}
            {patient.injury_type ? ` · ${patient.injury_type}` : ' · Rehabilitación LCA'}
          </span>
        }
      />

      {/* Cabecera clínica */}
      <Card className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-brand-soft blur-3xl" />
        <div className="relative flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={STATUS_TONE[patient.status] || 'neutral'} dot>{STATUS_LABEL[patient.status] || patient.status}</Chip>
            {plan?.current_phase && <Chip tone="primary">Etapa: {PHASE_LABELS[plan.current_phase]}</Chip>}
            {patient.injury_date && <Chip tone="neutral">Lesión {format(parseISO(patient.injury_date), 'dd/MM/yyyy')}</Chip>}
            {patient.birth_date && <Chip tone="neutral">Nac. {format(parseISO(patient.birth_date), 'dd/MM/yyyy')}</Chip>}
          </div>

          <div className="flex flex-col gap-5 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <MetricHero
              label="Sesión actual"
              value={currentSession}
              unit={totalSessions ? `/ ${totalSessions}` : undefined}
              caption={lastSession ? `Última registrada el ${format(parseISO(lastSession.date), 'dd/MM/yyyy')}` : 'Sin sesiones registradas'}
            />

            <div className="w-full sm:w-72">
              <DataList
                dense
                rows={[
                  { label: 'Etapa', value: PHASE_LABELS[plan?.current_phase] || '—' },
                  {
                    label: 'Simetría última sesión',
                    value: lastMetrics?.symmetry != null ? `${Math.round(lastMetrics.symmetry * 10) / 10} %` : '—',
                    delta: metricDeltaOf('symmetry'),
                    deltaUnit: ' %',
                  },
                  { label: 'Plan vigente', value: plan?.title || '—' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'Resumen' && (
        <div className="space-y-4">
          <SectionCard icon={TrendingUp} title="Última sesión" description={lastSession ? format(parseISO(lastSession.date), "dd/MM/yyyy HH:mm") : undefined}>
            {lastMetrics ? (
              <div className="space-y-6">
                <MetricHero
                  label="Simetría"
                  value={lastMetrics.symmetry}
                  unit="%"
                  delta={metricDeltaOf('symmetry')}
                  deltaUnit=" %"
                  caption={prevMetrics ? 'vs. sesión anterior' : 'Primera medición registrada'}
                />
                <DataList rows={lastSessionRows} />
              </div>
            ) : <div className="text-sm text-muted-foreground">Sin mediciones registradas</div>}
          </SectionCard>
        </div>
      )}

      {tab === 'Sesiones' && (
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-sm text-muted-foreground">Sin sesiones registradas</div>}
          {[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (
            <Link
              key={s.id}
              to={`/kinesiologo/sesion/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-lavender"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-heading text-sm font-medium text-foreground">Sesión {s.session_number ?? sessions.length - i}</div>
                  <div className="text-[11px] text-muted-foreground">{format(parseISO(s.date), "dd/MM/yyyy HH:mm")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip tone={s.status === 'completada' ? 'success' : 'warning'}>{s.status}</Chip>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'Evolucion' && (
        <SectionCard
          icon={TrendingUp}
          title="Evolución por sesión"
          description="Simetría, distribución de carga, estabilidad y tiempo de reacción a lo largo del seguimiento."
        >
          <MetricChart data={chartData} metrics={METRICS.slice(0, 4)} />
        </SectionCard>
      )}

      {tab === 'Comparaciones' && (
        <SectionCard
          icon={TrendingUp}
          title="Última sesión vs. anterior"
          description="Diferencia de cada indicador entre las dos últimas sesiones registradas."
        >
          {prevMetrics && lastMetrics ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="eyebrow py-2 pr-3 font-semibold">Indicador</th>
                    <th className="eyebrow py-2 px-3 text-right font-semibold">Anterior</th>
                    <th className="eyebrow py-2 px-3 text-right font-semibold">Última</th>
                    <th className="eyebrow py-2 pl-3 text-right font-semibold">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {METRICS.map(m => {
                    const a = prevMetrics[m.key];
                    const b = lastMetrics[m.key];
                    const delta = a != null && b != null ? Math.round((b - a) * 10) / 10 : null;
                    const good = delta == null ? null : m.higherBetter ? delta >= 0 : delta <= 0;
                    return (
                      <tr key={m.key}>
                        <td className="py-2.5 pr-3 text-foreground">{m.label}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground tabular-nums">{a != null ? Math.round(a * 10) / 10 : '—'}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-foreground tabular-nums">{b != null ? Math.round(b * 10) / 10 : '—'}</td>
                        <td className="py-2.5 pl-3 text-right">
                          {delta == null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <Chip tone={delta === 0 ? 'neutral' : good ? 'primary' : 'warning'}>
                              {delta > 0 ? '+' : ''}{delta} {m.unit}
                            </Chip>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin comparación disponible" description="Se necesitan al menos dos sesiones con mediciones para comparar." />
          )}
        </SectionCard>
      )}

      {tab === 'Plan' && (
        <Card className="p-5 sm:p-6">
          {plan ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">{plan.title}</h3>
                <Link
                  to={`/kinesiologo/paciente/${patientId}/plan`}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                >
                  Editar plan <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Info label="Fase actual" value={PHASE_LABELS[plan.current_phase] || plan.current_phase} />
                <Info label="Inicio" value={plan.start_date ? format(parseISO(plan.start_date), 'dd/MM/yyyy') : '—'} />
                <Info label="Objetivo" value={plan.target_end_date ? format(parseISO(plan.target_end_date), 'dd/MM/yyyy') : '—'} />
                <Info label="Estado" value={plan.status} />
              </div>
              {plan.goals && (
                <div className="mt-5">
                  <div className="eyebrow mb-1.5">Objetivos</div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{plan.goals}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Sin plan de rehabilitación</span>
              <Link to={`/kinesiologo/paciente/${patientId}/plan`}>
                <Button><ClipboardList className="h-4 w-4" /> Crear plan</Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      {tab === 'Reportes' && (
        <div className="space-y-4">
          <Card className="p-5">
            <label className="field-label">Nueva devolución para el paciente</label>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Escribí un comentario para el paciente…"
              rows={3}
              className="input mt-2 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={addComment} disabled={saving || !newComment.trim()}>
                <MessageSquare className="h-4 w-4" /> {saving ? 'Guardando…' : 'Publicar comentario'}
              </Button>
            </div>
          </Card>
          {comments.length === 0 && <div className="text-sm text-muted-foreground">Sin comentarios</div>}
          {comments.map(c => (
            <Card key={c.id} className="p-4 sm:p-5">
              <div className="mb-1 text-[11px] text-muted-foreground">{format(parseISO(c.date), "dd/MM/yyyy HH:mm")}</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{c.content}</p>
            </Card>
          ))}

          <PatientFeedbackList patientId={patientId} />
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="micro-label">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}