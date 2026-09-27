import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS, METRIC_MAP, qualitative } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import { ArrowLeft, Activity, HeartPulse, TrendingUp, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function PatientSessionReport() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    try {
      const s = await base44.entities.Session.get(sessionId);
      setSession(s);
      const [m, ss, allM, cm] = await Promise.all([
        base44.entities.SessionMetrics.filter({ session_id: sessionId }, '-created_date', 5),
        base44.entities.Session.filter({ patient_id: s.patient_id }, '-date', 100),
        base44.entities.SessionMetrics.filter({ patient_id: s.patient_id }, '-created_date', 100),
        base44.entities.ProfessionalComment.filter({ session_id: sessionId }, '-date', 20),
      ]);
      setMetrics(m[0] || null);
      setAllSessions(ss);
      setAllMetrics(allM);
      setComments(cm);
    } catch (e) {
      toast.error('No se pudo cargar el reporte');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando reporte…</div>;
  if (!session) return null;

  const sessionsAsc = [...allSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(allMetrics.map(m => [m.session_id, m]));
  const idx = sessionsAsc.findIndex(s => s.id === sessionId);
  const prev = idx > 0 ? metricBySession[sessionsAsc[idx - 1].id] : null;

  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id];
    const row = { label: `S${i + 1}`, current: s.id === sessionId };
    if (m) { row.symmetry = m.symmetry; row.confidence_perceived = m.confidence_perceived; row.pain_perceived = m.pain_perceived; }
    return row;
  });

  // mensaje simple
  let headline = 'Sesión completada. Seguí así.';
  if (metrics && prev) {
    if (metrics.confidence_perceived > prev.confidence_perceived) headline = 'Mejoraste tu confianza respecto a la sesión anterior. 🌱';
    else if (metrics.pain_perceived < prev.pain_perceived) headline = 'Sentiste menos dolor que la última vez. ¡Buen avance!';
    else if (metrics.symmetry > prev.symmetry) headline = 'Tu simetría mejoró. Vas por buen camino.';
    else headline = 'Sesión sostenida. La constancia también es progreso.';
  }

  const simple = [
    { key: 'symmetry', icon: <Activity className="w-5 h-5 text-blue-600" />, text: 'Qué tan parecido trabajan ambas piernas' },
    { key: 'pain_perceived', icon: <HeartPulse className="w-5 h-5 text-rose-500" />, text: 'Dolor que sentiste durante la sesión' },
    { key: 'confidence_perceived', icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, text: 'Cuánta confianza sentiste en tu rodilla' },
  ];

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reporte de sesión {session.session_number}</h1>
        <div className="text-sm text-slate-500">{format(parseISO(session.date), "dd/MM/yyyy")}</div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100 p-5">
        <p className="text-slate-800">{headline}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {simple.map(s => (
          <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">{s.icon} {METRIC_MAP[s.key].label}</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900">{metrics ? (metrics[s.key] ?? '—') : '—'}</span>
              <span className="text-xs text-slate-400">{METRIC_MAP[s.key].unit}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{metrics ? qualitative(s.key, metrics[s.key]) : ''}</div>
            <div className="text-xs text-slate-400 mt-1">{s.text}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="font-medium text-slate-700 mb-1">Tu evolución</div>
        <p className="text-sm text-slate-500 mb-4">Compará esta sesión con las anteriores. Los altibajos son parte del proceso.</p>
        <MetricChart data={chartData} metrics={METRICS.filter(m => ['symmetry', 'confidence_perceived', 'pain_perceived'].includes(m.key))} />
      </div>

      {comments.length > 0 && (
        <div>
          <div className="font-medium text-slate-700 mb-2 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Comentario de tu kinesiólogo</div>
          <div className="space-y-2">
            {comments.map(c => (
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