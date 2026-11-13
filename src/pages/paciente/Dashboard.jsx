import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRIC_MAP, PHASE_LABELS, qualitative, metricDelta } from '@/lib/rehbaita';
import ProgressRing from '@/components/paciente/ProgressRing';
import StatCard from '@/components/paciente/StatCard';
import EvolutionChart from '@/components/paciente/EvolutionChart';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { Button } from '@/components/ui/button';
import { Activity, ArrowUpRight, HeartPulse, MessageSquareQuote, Sparkles, Quote, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const EVOLUTION_KEYS = ['symmetry', 'stability', 'knee_flexion_angle'];
const CARD_KEYS = ['symmetry', 'stability', 'knee_flexion_angle', 'pain_perceived', 'confidence_perceived'];
const SCORE_KEYS = ['symmetry', 'stability', 'confidence_perceived', 'movement_control', 'strength'];

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [plan, setPlan] = useState(null);
  const [comments, setComments] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pain, setPain] = useState(3);
  const [confidence, setConfidence] = useState(60);
  const [perceptionNote, setPerceptionNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const me = await base44.auth.me();
      let patients = [];
      try { patients = await base44.entities.Patient.filter({ user_id: me.id }, '-created_date', 5); } catch (_) {}
      if (patients.length === 0) {
        patients = await base44.entities.Patient.list('-created_date', 1);
      }
      const p = patients[0];
      if (!p) { setLoading(false); return; }
      setPatient(p);
      const [s, m, pl, c, per] = await Promise.all([
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 100),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 100),
        base44.entities.RehabPlan.filter({ patient_id: p.id }, '-created_date', 5),
        base44.entities.ProfessionalComment.filter({ patient_id: p.id }, '-date', 20),
        base44.entities.Perception.filter({ patient_id: p.id }, '-date', 50),
      ]);
      setSessions(s); setMetrics(m); setPlan(pl[0]); setComments(c); setPerceptions(per);
    } catch (e) {
      toast.error('No se pudo cargar tu información');
    } finally {
      setLoading(false);
    }
  }

  async function savePerception() {
    setSaving(true);
    try {
      const created = await base44.entities.Perception.create({
        patient_id: patient.id,
        date: new Date().toISOString(),
        pain_level: Number(pain),
        confidence_level: Number(confidence),
        notes: perceptionNote.trim() || undefined,
      });
      setPerceptions([created, ...perceptions]);
      setPerceptionNote('');
      toast.success('Registro guardado');
    } catch (e) {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Cargando tu información…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado. Pedí a tu kinesiólogo que te asigne.</div>;

  const sessionsAsc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));
  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id];
    const row = { label: `S${i + 1}` };
    if (m) EVOLUTION_KEYS.concat(['pain_perceived', 'confidence_perceived']).forEach(k => row[k] = m[k]);
    return row;
  });

  const last = sessionsAsc[sessionsAsc.length - 1];
  const lastM = last ? metricBySession[last.id] : null;
  const prev = sessionsAsc.length > 1 ? metricBySession[sessionsAsc[sessionsAsc.length - 2].id] : null;
  const currentSessionNumber = last?.session_number ?? sessions.length;

  // progreso general: promedio normalizado (0-100) de métricas positivas de la última sesión
  const score = lastM
    ? Math.round(SCORE_KEYS.reduce((acc, k) => {
        const v = lastM[k]; const m = METRIC_MAP[k];
        return acc + (v != null && m ? (v / m.max) * 100 : 0);
      }, 0) / SCORE_KEYS.length)
    : 0;
  const prevScore = prev
    ? Math.round(SCORE_KEYS.reduce((acc, k) => {
        const v = prev[k]; const m = METRIC_MAP[k];
        return acc + (v != null && m ? (v / m.max) * 100 : 0);
      }, 0) / SCORE_KEYS.length)
    : null;

  // comparación con sesión anterior
  const comparable = CARD_KEYS.filter(k => lastM?.[k] != null && prev?.[k] != null);
  const improvedCount = comparable.filter(k => metricDelta(k, lastM[k], prev[k])?.improved).length;

  let motivation = 'Seguí con tu plan, cada sesión cuenta.';
  if (lastM && prev) {
    if (lastM.confidence_perceived > prev.confidence_perceived) motivation = '¡Tu confianza está creciendo!';
    else if (lastM.confidence_perceived < prev.confidence_perceived) motivation = 'Hubo un pequeño bajón, es parte del proceso. Vamos de a poco.';
    else motivation = 'Vas sostenido. La constancia es clave.';
  } else if (!lastM) {
    motivation = 'Acá vas a ver tu progreso sesión a sesión. ¡Empecemos!';
  }

  const latestComment = comments[0] || null;
  const olderComments = comments.slice(1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Área Paciente"
        title={`Hola, ${patient.full_name.split(' ')[0]}`}
        subtitle={
          <span>
            Sesión <span className="font-medium text-foreground">Nº {currentSessionNumber}</span> · rehabilitación de rodilla {patient.injury_side}
          </span>
        }
      />

      {/* Progreso general + mensaje */}
      <Card className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-soft blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-7">
          <div className="flex flex-col items-center">
            <ProgressRing value={score} size={140} color="#3B1A7B" label="progreso general" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="eyebrow flex items-center justify-center gap-1.5 sm:justify-start">
              <HeartPulse className="h-3.5 w-3.5 text-brand-cyan" /> Tu mensaje de hoy
            </div>
            <p className="mt-2 font-heading text-lg font-medium leading-snug text-foreground sm:text-xl">{motivation}</p>
            {prevScore != null && (
              <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
                <Chip tone={score >= prevScore ? 'primary' : 'warning'} dot>
                  {score > prevScore ? `+${score - prevScore} pts` : score < prevScore ? `${score - prevScore} pts` : 'igual'}
                </Chip>
                <span className="text-[11px] text-muted-foreground">respecto de tu sesión anterior</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Evolución */}
      <SectionCard
        icon={Sparkles}
        title="Tu evolución"
        description="Así vienen simetría, estabilidad y flexión sesión a sesión. No siempre es una línea recta: las mesetas y los pequeños descensos son parte del proceso."
      >
        <EvolutionChart data={chartData} keys={EVOLUTION_KEYS} />
      </SectionCard>

      {/* Indicadores actuales con comparación */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-title">Tus indicadores</h2>
          {comparable.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              vs. sesión anterior: <span className="font-semibold text-primary">{improvedCount}</span> de {comparable.length} mejoraron
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CARD_KEYS.map(k => <StatCard key={k} metricKey={k} value={lastM?.[k]} prev={prev?.[k]} />)}
        </div>
      </section>

      {/* Último comentario del kinesiólogo */}
      {latestComment && (
        <div className="rounded-2xl border border-border bg-brand-mist p-5 sm:p-6">
          <div className="eyebrow flex items-center gap-1.5 text-primary">
            <MessageSquareQuote className="h-3.5 w-3.5" /> Último comentario de tu kinesiólogo
          </div>
          <div className="mt-2.5 flex gap-2">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
            <div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{latestComment.content}</p>
              <div className="mt-2 text-[11px] text-muted-foreground">{format(parseISO(latestComment.date), "dd/MM/yyyy")}</div>
            </div>
          </div>
        </div>
      )}

      {/* ¿Cómo te sentís hoy? */}
      <SectionCard icon={Activity} title="¿Cómo te sentís hoy?" description="Registrá tu percepción para acompañar la lectura de tus datos.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Dolor percibido</span>
              <span className="font-heading text-sm font-semibold text-foreground tabular-nums">{pain}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={pain}
              onChange={e => setPain(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-1 text-[11px] text-muted-foreground">{qualitative('pain_perceived', pain)}</div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Confianza corporal</span>
              <span className="font-heading text-sm font-semibold text-foreground tabular-nums">{confidence}/100</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-1 text-[11px] text-muted-foreground">{qualitative('confidence_perceived', confidence)}</div>
          </div>
        </div>
        <textarea
          value={perceptionNote}
          onChange={e => setPerceptionNote(e.target.value)}
          placeholder="Notas (opcional)…"
          rows={2}
          className="input mt-4 resize-none"
        />
        <Button onClick={savePerception} disabled={saving} className="mt-3">
          {saving ? 'Guardando…' : 'Registrar'}
        </Button>
      </SectionCard>

      {/* Plan */}
      {plan && (
        <SectionCard
          icon={ClipboardList}
          title="Tu plan de rehabilitación"
          action={<Link to="/paciente/plan" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">Ver plan <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
        >
          <div className="text-sm font-medium text-foreground">{plan.title}</div>
          {plan.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip tone="primary">Etapa: {PHASE_LABELS[plan.current_phase]}</Chip>
            <Chip tone="neutral" className="capitalize">{plan.status}</Chip>
            {plan.target_end_date && <Chip tone="cyan">Objetivo: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</Chip>}
          </div>
        </SectionCard>
      )}

      {/* Sesiones recientes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Tus sesiones</h2>
          <Link to="/paciente/sesiones" className="text-[13px] font-medium text-primary hover:underline">Ver todas</Link>
        </div>
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-sm text-muted-foreground">Aún no hay sesiones</div>}
          {[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (
            <Link
              key={s.id}
              to={`/paciente/sesion/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-brand-lavender"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-[13px] font-semibold text-primary">
                  {s.session_number ?? sessions.length - i}
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">Sesión {s.session_number ?? sessions.length - i}</div>
                  <div className="text-[11px] text-muted-foreground">{format(parseISO(s.date), "dd/MM/yyyy")}</div>
                </div>
              </div>
              <span className="text-[13px] text-muted-foreground">Ver reporte →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Comentarios anteriores */}
      {olderComments.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Comentarios anteriores</h2>
          <div className="space-y-2">
            {olderComments.map(c => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-1 text-[11px] text-muted-foreground">{format(parseISO(c.date), "dd/MM/yyyy")}</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{c.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}