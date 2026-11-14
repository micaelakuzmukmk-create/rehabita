import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRIC_MAP, PHASE_LABELS, qualitative, metricDelta } from '@/lib/rehbaita';
import EvolutionChart from '@/components/paciente/EvolutionChart';
import BodyFigure from '@/components/paciente/BodyFigure';
import PatientVitals from '@/components/paciente/PatientVitals';
import PatientQuickLinks from '@/components/paciente/PatientQuickLinks';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import MetricHero from '@/components/ds/MetricHero';
import SectionHead from '@/components/ds/SectionHead';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { Button } from '@/components/ui/button';
import { Activity, ArrowUpRight, ArrowLeftRight, HeartPulse, MessageSquareQuote, Sparkles, Quote, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const EVOLUTION_KEYS = ['symmetry', 'stability', 'knee_flexion_angle'];
const SCORE_KEYS = ['symmetry', 'stability', 'confidence_perceived', 'movement_control', 'strength'];
const SECONDARY_KEYS = ['confidence_perceived', 'pain_perceived', 'stability', 'knee_flexion_angle'];

const round1 = (v) => (v == null ? '—' : Math.round(v * 10) / 10);

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [plan, setPlan] = useState(null);
  const [comments, setComments] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pain, setPain] = useState(3);
  const [confidence, setConfidence] = useState(7);
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
  const totalSessions = plan?.total_sessions || null;

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

  const comparable = SECONDARY_KEYS.filter(k => lastM?.[k] != null && prev?.[k] != null);
  const improvedCount = comparable.filter(k => metricDelta(k, lastM[k], prev[k])?.improved).length;

  const symmetryDelta = lastM?.symmetry != null ? metricDelta('symmetry', lastM.symmetry, prev?.symmetry) : null;

  const primaryVital = {
    label: 'Simetría entre piernas',
    value: round1(lastM?.symmetry),
    unit: '%',
    delta: symmetryDelta?.delta ?? null,
    deltaUnit: ' %',
    improved: symmetryDelta?.improved,
    hint: lastM?.symmetry != null ? qualitative('symmetry', lastM.symmetry) : 'Sin registro',
  };

  const secondaryVitals = SECONDARY_KEYS.map((k) => {
    const m = METRIC_MAP[k];
    const raw = lastM?.[k];
    const prevRaw = prev?.[k];
    const d = raw != null ? metricDelta(k, raw, prevRaw) : null;
    // Confianza: se expresa en la misma escala 0-10 que usa el paciente en su devolución.
    const toScale = (v) => (v == null ? null : k === 'confidence_perceived' ? Math.round((v / 10) * 10) / 10 : round1(v));
    const unit = k === 'knee_flexion_angle' ? '°' : k === 'pain_perceived' || k === 'confidence_perceived' ? '/10' : '%';
    return {
      label: m.label.replace(' percibida', '').replace(' percibido', '').replace('Ángulo ', ''),
      value: toScale(raw),
      unit: raw == null ? '' : unit,
      delta: d?.delta != null ? (k === 'confidence_perceived' ? Math.round((d.delta / 10) * 10) / 10 : d.delta) : null,
      deltaUnit: raw == null ? '' : ` ${unit}`,
      improved: d?.improved,
      hint: qualitative(k, raw),
    };
  });

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
    <div className="space-y-7">
      <PageHeader
        eyebrow="Área Paciente"
        title={`Hola, ${patient.full_name.split(' ')[0]}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Tu recuperación · Sesión Nº {currentSessionNumber}{totalSessions ? ` de ${totalSessions}` : ''}</span>
            <span className="text-slate-300">·</span>
            <span>Rodilla {patient.injury_side}</span>
            {plan?.current_phase && (
              <>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-foreground">{PHASE_LABELS[plan.current_phase]}</span>
              </>
            )}
          </span>
        }
      />

      {/* Nivel 1: cómo estoy */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-surface">
        <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:p-7">
          <div className="min-w-0">
            <MetricHero
              label="Progreso general"
              value={score}
              unit="%"
              delta={prevScore != null ? score - prevScore : null}
              deltaUnit=" pts"
              caption={prevScore != null ? 'vs. tu sesión anterior' : undefined}
            />
            <div className="mt-5 flex items-start gap-2 border-t border-border pt-4">
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-area-accent" />
              <p className="font-heading text-[14px] font-medium leading-snug text-foreground">{motivation}</p>
            </div>
          </div>

          <div className="flex justify-center rounded-2xl bg-area-soft/70 px-4 py-3">
            <BodyFigure side={patient.injury_side} className="h-36 sm:h-44" />
          </div>
        </div>
      </section>

      <PatientQuickLinks />

      {/* Nivel 2 y 3: indicadores con dos escalas */}
      <section>
        <SectionHead
          title="Tus indicadores"
          description="El dato más importante de tu última sesión y el resto del contexto."
          action={
            comparable.length > 0 ? (
              <span className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-area-ink">{improvedCount}</span> de {comparable.length} mejoraron
              </span>
            ) : undefined
          }
        />
        <PatientVitals primary={primaryVital} secondary={secondaryVitals} />
      </section>

      {/* Evolución */}
      <SectionCard
        icon={Sparkles}
        title="Tu evolución"
        description="Simetría, estabilidad y flexión sesión a sesión. No siempre es una línea recta: las mesetas y los pequeños descensos son parte del proceso."
        action={
          <Link
            to="/paciente/comparar"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-area-ink hover:underline"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> Comparar sesiones
          </Link>
        }
      >
        <EvolutionChart data={chartData} keys={EVOLUTION_KEYS} />
      </SectionCard>

      {latestComment && (
        <div className="rounded-2xl border border-border bg-area-soft/60 p-5 sm:p-6">
          <div className="eyebrow flex items-center gap-1.5 text-area-ink">
            <MessageSquareQuote className="h-3.5 w-3.5" /> Último comentario de tu kinesiólogo
          </div>
          <div className="mt-2.5 flex gap-2">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-area-accent" />
            <div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{latestComment.content}</p>
              <div className="mt-2 text-[11px] text-muted-foreground">{format(parseISO(latestComment.date), "dd/MM/yyyy")}</div>
            </div>
          </div>
        </div>
      )}

      {plan && (
        <SectionCard
          icon={ClipboardList}
          title="Tu plan de rehabilitación"
          action={
            <Link to="/paciente/plan" className="inline-flex items-center gap-1 text-[13px] font-medium text-area-ink hover:underline">
              Ver plan <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{plan.title}</div>
              {plan.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-semibold leading-none text-foreground tabular-nums">
                {currentSessionNumber}
              </span>
              <span className="text-[11px] text-muted-foreground">/ {totalSessions || '—'} sesiones</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip tone="cyan">Etapa: {PHASE_LABELS[plan.current_phase]}</Chip>
            <Chip tone="neutral" className="capitalize">{plan.status}</Chip>
            {plan.target_end_date && <Chip tone="primary">Objetivo: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</Chip>}
          </div>
        </SectionCard>
      )}

      {/* Cómo te sentís hoy */}
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
              <span className="font-heading text-sm font-semibold text-foreground tabular-nums">{confidence}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-1 text-[11px] text-muted-foreground">{qualitative('confidence_perceived', confidence * 10)}</div>
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

      {/* Sesiones recientes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Tus sesiones</h2>
          <Link to="/paciente/sesiones" className="text-[13px] font-medium text-area-ink hover:underline">Ver todas</Link>
        </div>
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-sm text-muted-foreground">Aún no hay sesiones</div>}
          {[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (
            <Link
              key={s.id}
              to={`/paciente/sesion/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-area-accent/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-area-soft text-[13px] font-semibold text-area-ink">
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