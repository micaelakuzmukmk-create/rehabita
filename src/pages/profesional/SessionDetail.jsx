import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS, PHASE_LABELS } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import MetricCard from '@/components/MetricCard';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare } from 'lucide-react';
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

  if (loading) return <LoadingState label="Cargando sesión…" />;
  if (!session) return <div className="text-sm text-muted-foreground">Sesión no encontrada</div>;

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
    <div className="space-y-6">
      <PageHeader
        back={{ to: `/kinesiologo/paciente/${session.patient_id}`, label: 'Volver a la ficha' }}
        eyebrow={patient?.full_name}
        title={`Sesión ${session.session_number}`}
        subtitle={format(parseISO(session.date), "dd/MM/yyyy HH:mm")}
        actions={
          <div className="flex items-center gap-2">
            {session.phase && <Chip tone="primary">{PHASE_LABELS[session.phase]}</Chip>}
            <Chip tone={session.status === 'completada' ? 'success' : 'warning'} dot>{session.status}</Chip>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={FileText} title="Mediciones de la sesión">
          {metrics ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {METRICS.map(m => <MetricCard key={m.key} metricKey={m.key} value={metrics[m.key]} />)}
            </div>
          ) : <div className="text-sm text-muted-foreground">Sin mediciones</div>}
        </SectionCard>

        <SectionCard icon={FileText} title="Comparativa entre sesiones">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {METRICS.map(m => {
              const active = compare.includes(m.key);
              return (
                <button
                  key={m.key}
                  onClick={() => setCompare(c => c.includes(m.key) ? c.filter(x => x !== m.key) : [...c, m.key])}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    active
                      ? 'border-secondary bg-secondary font-medium text-primary'
                      : 'border-border text-muted-foreground hover:border-brand-lavender'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? m.color : '#D8D6E2' }} />
                  {m.label}
                </button>
              );
            })}
          </div>
          <MetricChart data={chartData} metrics={METRICS.filter(m => compare.includes(m.key))} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={FileText} title="Ejercicios y calibración">
          {selectedExercises.length > 0 ? (
            <ul className="space-y-2">
              {selectedExercises.map(ex => (
                <li key={ex.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-2.5 text-sm">
                  <span className="font-medium text-foreground">{ex.name}</span>
                  <span className="text-[11px] capitalize text-muted-foreground">{ex.category}</span>
                </li>
              ))}
            </ul>
          ) : <div className="text-sm text-muted-foreground">Sin ejercicios registrados</div>}
          {calibration && (
            <div className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
              Calibración: simetría {Math.round(calibration.baseline_symmetry * 10) / 10}% · estabilidad {Math.round(calibration.baseline_stability * 10) / 10} · carga {Math.round(calibration.baseline_load * 10) / 10}%
            </div>
          )}
        </SectionCard>

        <SectionCard icon={MessageSquare} title="Comentario de la sesión">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Comentario manual para el paciente…"
            rows={3}
            className="input resize-none"
          />
          <Button onClick={addComment} disabled={!comment.trim()} className="mt-3">
            Guardar comentario
          </Button>
          {comments.length > 0 && (
            <div className="mt-4 space-y-3">
              {comments.map(c => (
                <div key={c.id} className="border-t border-border pt-3">
                  <div className="mb-0.5 text-[11px] text-muted-foreground">{format(parseISO(c.date), "dd/MM/yyyy HH:mm")}</div>
                  <p className="text-sm leading-relaxed text-foreground">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}