import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS, METRIC_MAP, PHASE_LABELS, qualitative } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import { FileText, HeartPulse, TrendingUp, MessageSquare, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

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
      // demo: si el usuario no tiene paciente vinculado, usar el más reciente
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
    if (m) {
      row.symmetry = m.symmetry;
      row.stability = m.stability;
      row.confidence_perceived = m.confidence_perceived;
      row.pain_perceived = m.pain_perceived;
    }
    return row;
  });

  const last = sessionsAsc[sessionsAsc.length - 1];
  const lastM = last ? metricBySession[last.id] : null;
  const prev = sessionsAsc.length > 1 ? metricBySession[sessionsAsc[sessionsAsc.length - 2].id] : null;

  // mensaje motivacional según tendencia de confianza
  let motivation = 'Seguí con tu plan, cada sesión cuenta.';
  if (lastM && prev) {
    if (lastM.confidence_perceived > prev.confidence_perceived) motivation = '¡Tu confianza está creciendo! 🌱';
    else if (lastM.confidence_perceived < prev.confidence_perceived) motivation = 'Hubo un pequeño bajón, es parte del proceso. Vamos de a poco.';
    else motivation = 'Vas sostenido. La constancia es clave.';
  }

  const progressMetrics = ['symmetry', 'stability', 'confidence_perceived'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Hola, {patient.full_name.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500">Tu progreso de rehabilitación de rodilla {patient.injury_side}</p>
      </div>

      {/* Mensaje motivacional */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100 p-5">
        <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium"><HeartPulse className="w-4 h-4" /> Tu mensaje de hoy</div>
        <p className="text-slate-800 mt-1.5">{motivation}</p>
      </div>

      {/* Progreso simplificado */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-700 font-medium mb-1"><TrendingUp className="w-4 h-4" /> Tu evolución</div>
        <p className="text-sm text-slate-500 mb-4">Así vienen tus indicadores sesión a sesión. No siempre es una línea recta: las mesetas y los pequeños descensos son normales.</p>
        <MetricChart data={chartData} metrics={METRICS.filter(m => progressMetrics.includes(m.key))} />
      </div>

      {/* Indicadores simples de última sesión */}
      {lastM && (
        <div className="grid sm:grid-cols-3 gap-3">
          <SimpleIndicator icon={<Activity className="w-5 h-5 text-blue-600" />} label="Simetría" value={lastM.symmetry} metricKey="symmetry" prev={prev?.symmetry} />
          <SimpleIndicator icon={<HeartPulse className="w-5 h-5 text-rose-500" />} label="Dolor" value={lastM.pain_perceived} metricKey="pain_perceived" prev={prev?.pain_perceived} />
          <SimpleIndicator icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Confianza" value={lastM.confidence_perceived} metricKey="confidence_perceived" prev={prev?.confidence_perceived} />
        </div>
      )}

      {/* Registro de dolor y confianza */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="font-medium text-slate-700 mb-3">¿Cómo te sentís hoy?</div>
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
          <div className="font-medium text-slate-700 mb-2">Tu plan de rehabilitación</div>
          <div className="text-sm text-slate-600">{plan.title}</div>
          {plan.description && <p className="text-sm text-slate-500 mt-1">{plan.description}</p>}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">Fase: {PHASE_LABELS[plan.current_phase]}</span>
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">{plan.status}</span>
            {plan.target_end_date && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">Objetivo: {format(parseISO(plan.target_end_date), 'dd/MM/yyyy')}</span>}
          </div>
        </div>
      )}

      {/* Sesiones recientes */}
      <div>
        <div className="font-medium text-slate-700 mb-3">Tus sesiones</div>
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-sm text-slate-400">Aún no hay sesiones</div>}
          {[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (
            <Link key={s.id} to={`/paciente/sesion/${s.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><FileText className="w-4 h-4 text-slate-600" /></div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Sesión {s.session_number ?? sessions.length - i}</div>
                  <div className="text-xs text-slate-500">{format(parseISO(s.date), "dd/MM/yyyy")}</div>
                </div>
              </div>
              <span className="text-sm text-slate-400">Ver reporte →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Comentarios del kinesiólogo */}
      <div>
        <div className="font-medium text-slate-700 mb-3 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Comentarios de tu kinesiólogo</div>
        <div className="space-y-2">
          {comments.length === 0 && <div className="text-sm text-slate-400">Sin comentarios aún</div>}
          {comments.map(c => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-400 mb-1">{format(parseISO(c.date), "dd/MM/yyyy")}</div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimpleIndicator({ icon, label, value, metricKey, prev }) {
  const m = METRIC_MAP[metricKey];
  const improved = prev != null ? (m.higherBetter ? value >= prev : value <= prev) : null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500 text-sm">{icon} {label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-slate-900">{value == null ? '—' : Math.round(value * 10) / 10}</span>
        <span className="text-xs text-slate-400">{m.unit}</span>
        {improved != null && prev != null && (
          <span className={`text-xs ${improved ? 'text-emerald-600' : 'text-rose-500'}`}>
            {improved ? '↑' : '↓'} {Math.abs(value - prev).toFixed(1)}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 mt-1">{qualitative(metricKey, value)}</div>
    </div>
  );
}