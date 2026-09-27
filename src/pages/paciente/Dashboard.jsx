import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRIC_MAP, PHASE_LABELS, qualitative, metricDelta } from '@/lib/rehbaita';
import ProgressRing from '@/components/paciente/ProgressRing';
import StatCard from '@/components/paciente/StatCard';
import EvolutionChart from '@/components/paciente/EvolutionChart';
import { HeartPulse, MessageSquareQuote, Sparkles, Quote } from 'lucide-react';
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

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado. Pedí a tu kinesiólogo que te asigne.</div>;

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
    if (lastM.confidence_perceived > prev.confidence_perceived) motivation = '¡Tu confianza está creciendo! 🌱';
    else if (lastM.confidence_perceived < prev.confidence_perceived) motivation = 'Hubo un pequeño bajón, es parte del proceso. Vamos de a poco.';
    else motivation = 'Vas sostenido. La constancia es clave.';
  } else if (!lastM) {
    motivation = 'Acá vas a ver tu progreso sesión a sesión. ¡Empecemos!';
  }

  const latestComment = comments[0] || null;
  const olderComments = comments.slice(1);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hola, {patient.full_name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sesión <span className="font-semibold text-slate-700">Nº {currentSessionNumber}</span> · rehabilitación de rodilla {patient.injury_side}
          </p>
        </div>
      </div>

      {/* Progreso general + mensaje */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 border border-emerald-100 p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <ProgressRing value={score} color="#10b981" label="progreso general" />
            <div className="text-xs text-slate-500 mt-1">Progreso general</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium justify-center sm:justify-start">
              <HeartPulse className="w-4 h-4" /> Tu mensaje de hoy
            </div>
            <p className="text-slate-800 text-lg mt-1.5 leading-snug">{motivation}</p>
            {prevScore != null && (
              <div className="mt-2 text-sm text-slate-500">
                {score > prevScore ? <span className="text-emerald-600 font-medium">↑ {score - prevScore} pts</span>
                  : score < prevScore ? <span className="text-amber-600 font-medium">↓ {prevScore - score} pts</span>
                  : <span className="text-slate-500 font-medium">igual</span>}
                {' '}respecto de tu sesión anterior
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evolución */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-800 font-semibold"><Sparkles className="w-4 h-4 text-amber-500" /> Tu evolución</div>
        <p className="text-sm text-slate-500 mt-1 mb-3">
          Así vienen simetría, estabilidad y flexión sesión a sesión. No siempre es una línea recta: las mesetas y los pequeños descensos son parte del proceso.
        </p>
        <EvolutionChart data={chartData} keys={EVOLUTION_KEYS} />
      </div>

      {/* Indicadores actuales con comparación */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-slate-800 font-semibold">Tus indicadores</div>
          {comparable.length > 0 && (
            <div className="text-xs text-slate-500">
              vs. sesión anterior: <span className="font-medium text-emerald-600">{improvedCount}</span> de {comparable.length} mejoraron
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CARD_KEYS.map(k => <StatCard key={k} metricKey={k} value={lastM?.[k]} prev={prev?.[k]} />)}
        </div>
      </div>

      {/* Último comentario del kinesiólogo */}
      {latestComment && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
          <div className="flex items-center gap-2 text-sky-700 text-sm font-medium">
            <MessageSquareQuote className="w-4 h-4" /> Último comentario de tu kinesiólogo
          </div>
          <div className="flex gap-2 mt-2">
            <Quote className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{latestComment.content}</p>
              <div className="text-xs text-slate-400 mt-1.5">{format(parseISO(latestComment.date), "dd/MM/yyyy")}</div>
            </div>
          </div>
        </div>
      )}

      {/* ¿Cómo te sentís hoy? */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="font-medium text-slate-800 mb-3">¿Cómo te sentís hoy?</div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Dolor percibido</span>
              <span className="font-medium text-slate-900">{pain}/10</span>
            </div>
            <input type="range" min={0} max={10} step={1} value={pain} onChange={e => setPain(Number(e.target.value))} className="w-full accent-rose-500" />
            <div className="text-xs text-slate-400 mt-1">{qualitative('pain_perceived', pain)}</div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Confianza corporal</span>
              <span className="font-medium text-slate-900">{confidence}/100</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full accent-emerald-500" />
            <div className="text-xs text-slate-400 mt-1">{qualitative('confidence_perceived', confidence)}</div>
          </div>
        </div>
        <textarea
          value={perceptionNote}
          onChange={e => setPerceptionNote(e.target.value)}
          placeholder="Notas (opcional)…"
          rows={2}
          className="w-full mt-3 text-sm rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-slate-400 resize-none"
        />
        <button onClick={savePerception} disabled={saving} className="mt-2 text-sm px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40">
          {saving ? 'Guardando…' : 'Registrar'}
        </button>
      </div>

      {/* Plan */}
      {plan && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="font-medium text-slate-800 mb-2">Tu plan de rehabilitación</div>
          <div className="text-sm text-slate-700">{plan.title}</div>
          {plan.description && <p className="text-sm text-slate-500 mt-1">{plan.description}</p>}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">Etapa: {PHASE_LABELS[plan.current_phase]}</span>
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">{plan.status}</span>
            {plan.target_end_date && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">Objetivo: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</span>}
          </div>
        </div>
      )}

      {/* Sesiones recientes */}
      <div>
        <div className="font-medium text-slate-800 mb-3">Tus sesiones</div>
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-sm text-slate-400">Aún no hay sesiones</div>}
          {[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (
            <Link key={s.id} to={`/paciente/sesion/${s.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition">
              <div>
                <div className="text-sm font-medium text-slate-900">Sesión {s.session_number ?? sessions.length - i}</div>
                <div className="text-xs text-slate-500">{format(parseISO(s.date), "dd/MM/yyyy")}</div>
              </div>
              <span className="text-sm text-slate-400">Ver reporte →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Comentarios anteriores */}
      {olderComments.length > 0 && (
        <div>
          <div className="font-medium text-slate-800 mb-3">Comentarios anteriores</div>
          <div className="space-y-2">
            {olderComments.map(c => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-400 mb-1">{format(parseISO(c.date), "dd/MM/yyyy")}</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}