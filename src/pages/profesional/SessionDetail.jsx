import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import MetricCard from '@/components/MetricCard';
import { ArrowLeft, FileText, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [calibration, setCalibration] = useState(null);
  const [compare, setCompare] = useState(['symmetry', 'stability', 'strength']);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    try {
      const s = await base44.entities.Session.get(sessionId);
      setSession(s);
      const [p, m, ss, allM, ex, cal, cm] = await Promise.all([
        base44.entities.Patient.get(s.patient_id),
        base44.entities.SessionMetrics.filter({ session_id: sessionId }, '-created_date', 5),
        base44.entities.Session.filter({ patient_id: s.patient_id }, '-date', 100),
        base44.entities.SessionMetrics.filter({ patient_id: s.patient_id }, '-created_date', 100),
        base44.entities.Exercise.list('-created_date', 50),
        s.calibration_id ? base44.entities.Calibration.get(s.calibration_id).catch(() => null) : Promise.resolve(null),
        base44.entities.ProfessionalComment.filter({ session_id: sessionId }, '-date', 20),
      ]);
      setPatient(p);
      setMetrics(m[0] || null);
      setAllSessions(ss);
      setAllMetrics(allM);
      setExercises(ex);
      setCalibration(cal);
      setComments(cm);
    } catch (e) {
      toast.error('No se pudo cargar la sesión');
    } finally {
      setLoading(false);
    }
  }

  async function addComment() {
    if (!comment.trim()) return;
    try {
      const c = await base44.entities.ProfessionalComment.create({
        patient_id: session.patient_id,
        session_id: sessionId,
        content: comment.trim(),
        date: new Date().toISOString(),
      });
      setComments([c, ...comments]);
      setComment('');
      toast.success('Comentario guardado');
    } catch (e) {
      toast.error('No se pudo guardar');
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando sesión…</div>;
  if (!session) return <div className="text-sm text-slate-400">Sesión no encontrada</div>;

  const sessionsAsc = [...allSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(allMetrics.map(m => [m.session_id, m]));
  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id];
    const row = { label: `S${i + 1}`, current: s.id === sessionId };
    if (m) compare.forEach(k => row[k] = m[k]);
    return row;
  });

  const selectedExercises = (session.exercises || []).map(id => exercises.find(e => e.id === id)).filter(Boolean);

  return (
    <div>
      <Link to={`/profesional/paciente/${session.patient_id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a la ficha
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sesión {session.session_number}</h1>
          <div className="text-sm text-slate-500 mt-0.5">
            {patient?.full_name} · {format(parseISO(session.date), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${session.status === 'completada' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{session.status}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700 mb-3">Mediciones de la sesión</div>
          {metrics ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {METRICS.map(m => <MetricCard key={m.key} metricKey={m.key} value={metrics[m.key]} />)}
            </div>
          ) : <div className="text-sm text-slate-400">Sin mediciones</div>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-700">Comparativa entre sesiones</div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setCompare(c => c.includes(m.key) ? c.filter(x => x !== m.key) : [...c, m.key])}
                className={`text-xs px-2 py-1 rounded-full border ${compare.includes(m.key) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <MetricChart data={chartData} metrics={METRICS.filter(m => compare.includes(m.key))} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Ejercicios y calibración</div>
          {selectedExercises.length > 0 ? (
            <ul className="space-y-1.5">
              {selectedExercises.map(ex => (
                <li key={ex.id} className="text-sm text-slate-700">
                  <span className="font-medium">{ex.name}</span> <span className="text-slate-400">· {ex.category}</span>
                </li>
              ))}
            </ul>
          ) : <div className="text-sm text-slate-400">Sin ejercicios registrados</div>}
          {calibration && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Calibración: simetría {Math.round(calibration.baseline_symmetry * 10) / 10}% · estabilidad {Math.round(calibration.baseline_stability * 10) / 10} · carga {Math.round(calibration.baseline_load * 10) / 10}%
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Comentario de la sesión</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Comentario manual para el paciente…"
            rows={3}
            className="w-full text-sm rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-slate-400 resize-none"
          />
          <button onClick={addComment} disabled={!comment.trim()} className="mt-2 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40">
            Guardar comentario
          </button>
          {comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {comments.map(c => (
                <div key={c.id} className="text-sm text-slate-700 border-t border-slate-100 pt-2">
                  <div className="text-xs text-slate-400 mb-0.5">{format(parseISO(c.date), "dd/MM/yyyy HH:mm")}</div>
                  {c.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}