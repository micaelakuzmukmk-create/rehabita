import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS, METRIC_MAP, qualitative } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import PageHeader from '@/components/ds/PageHeader';
import SectionCard from '@/components/ds/SectionCard';
import Card from '@/components/ds/Card';
import StatTile from '@/components/ds/StatTile';
import SessionFeedback from '@/components/paciente/SessionFeedback';
import LoadingState from '@/components/ds/LoadingState';
import { Activity, HeartPulse, TrendingUp, MessageSquare, Sparkles } from 'lucide-react';
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

  if (loading) return <LoadingState label="Cargando reporte…" />;
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
    if (metrics.confidence_perceived > prev.confidence_perceived) headline = 'Mejoraste tu confianza respecto a la sesión anterior.';
    else if (metrics.pain_perceived < prev.pain_perceived) headline = 'Sentiste menos dolor que la última vez. ¡Buen avance!';
    else if (metrics.symmetry > prev.symmetry) headline = 'Tu simetría mejoró. Vas por buen camino.';
    else headline = 'Sesión sostenida. La constancia también es progreso.';
  }

  const simple = [
    { key: 'symmetry', icon: Activity, text: 'Qué tan parecido trabajan ambas piernas' },
    { key: 'pain_perceived', icon: HeartPulse, text: 'Dolor que sentiste durante la sesión' },
    { key: 'confidence_perceived', icon: TrendingUp, text: 'Cuánta confianza sentiste en tu rodilla' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Reporte de sesión"
        title={`Sesión ${session.session_number}`}
        subtitle={format(parseISO(session.date), "dd/MM/yyyy")}
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-brand-mist p-5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-soft blur-3xl" />
        <div className="relative flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
          <p className="text-[15px] leading-relaxed text-foreground">{headline}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {simple.map(s => {
          const Icon = s.icon;
          return (
            <StatTile
              key={s.key}
              label={METRIC_MAP[s.key].label}
              value={metrics ? metrics[s.key] : null}
              unit={METRIC_MAP[s.key].unit}
              hint={metrics ? qualitative(s.key, metrics[s.key]) : ''}
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {simple.map(s => {
          const Icon = s.icon;
          return (
            <div key={`${s.key}-hint`} className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-[11px] leading-relaxed text-muted-foreground">{s.text}</span>
            </div>
          );
        })}
      </div>

      <SectionCard icon={TrendingUp} title="Tu evolución" description="Compará esta sesión con las anteriores. Los altibajos son parte del proceso.">
        <MetricChart data={chartData} metrics={METRICS.filter(m => ['symmetry', 'confidence_perceived', 'pain_perceived'].includes(m.key))} />
      </SectionCard>

      {comments.length > 0 && (
        <section>
          <h2 className="section-title mb-3 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-muted-foreground" /> Comentario de tu kinesiólogo
          </h2>
          <div className="space-y-2">
            {comments.map(c => (
              <Card key={c.id} className="p-4">
                <div className="mb-1 text-[11px] text-muted-foreground">{format(parseISO(c.date), "dd/MM/yyyy")}</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{c.content}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <SessionFeedback sessionId={session.id} patientId={session.patient_id} />
    </div>
  );
}