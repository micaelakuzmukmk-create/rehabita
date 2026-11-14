import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRIC_MAP, qualitative } from '@/lib/rehbaita';
import MiniSpark from '@/components/paciente/MiniSpark';
import PageHeader from '@/components/ds/PageHeader';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import { ArrowUpRight, ArrowDownRight, FileText, MessageSquare, Minus, Stethoscope } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { refreshBadges } from '@/hooks/usePatientBadges';

const CARD_KEYS = ['symmetry', 'pain_perceived', 'confidence_perceived'];
const round1 = (v) => (v == null ? '—' : Math.round(Number(v) * 10) / 10);

export default function Reports() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [comments, setComments] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
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

      const [ss, cm, mm, pc] = await Promise.all([
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 200),
        base44.entities.ProfessionalComment.filter({ patient_id: p.id }, '-date', 200),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 200),
        base44.entities.Perception.filter({ patient_id: p.id }, '-date', 200),
      ]);
      setSessions(ss);
      setComments(cm);
      setMetrics(mm);
      setPerceptions(pc);

      // Al abrir los reportes quedan vistos: se apaga la notificación.
      const unseen = cm.filter(c => !p.reports_seen_at || new Date(c.date) > new Date(p.reports_seen_at));
      if (unseen.length > 0) {
        await base44.entities.Patient.update(p.id, { reports_seen_at: new Date().toISOString() });
        refreshBadges();
      }
    } catch (e) {
      toast.error('No se pudieron cargar tus reportes');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState label="Cargando tus reportes…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado.</div>;

  const metricsBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));
  const perceptionsBySession = Object.fromEntries(perceptions.filter(p => p.session_id).map(p => [p.session_id, p]));
  const commentsBySession = {};
  comments.forEach((c) => {
    const key = c.session_id || 'general';
    (commentsBySession[key] ||= []).push(c);
  });

  // Serie cronológica para los micrográficos.
  const asc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const trend = asc.map((s, i) => {
    const m = metricsBySession[s.id] || {};
    const row = { label: `S${s.session_number ?? i + 1}` };
    CARD_KEYS.forEach(k => { if (m[k] != null) row[k] = m[k]; });
    return row;
  });
  const idxBySession = Object.fromEntries(asc.map((s, i) => [s.id, i]));

  const reports = [...sessions]
    .filter(s => s.status === 'completada' || commentsBySession[s.id] || metricsBySession[s.id])
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const generalComments = commentsBySession.general || [];

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Reportes"
        subtitle="Tus resultados sesión a sesión, con la devolución de tu kinesiólogo y la tuya."
      />

      {reports.length === 0 && generalComments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Todavía no hay reportes"
          description="Cuando tu kinesiólogo registre una sesión, va a aparecer acá con sus métricas."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((s) => {
            const m = metricsBySession[s.id] || {};
            const i = idxBySession[s.id];
            const prev = i > 0 ? metricsBySession[asc[i - 1].id] || {} : {};
            const sessionComments = commentsBySession[s.id] || [];
            const myFeedback = perceptionsBySession[s.id];

            return (
              <Card key={s.id} className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
                  <div>
                    <div className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                      Sesión {s.session_number}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{format(parseISO(s.date), 'dd/MM/yyyy')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {myFeedback && <Chip tone="cyan">Devolución enviada</Chip>}
                    <Link
                      to={`/paciente/sesion/${s.id}`}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-area-ink hover:underline"
                    >
                      Ver reporte <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Métricas + micrográfico */}
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  {CARD_KEYS.map((key) => {
                    const metric = METRIC_MAP[key];
                    const value = m[key];
                    const delta = value != null && prev[key] != null ? Math.round((value - prev[key]) * 10) / 10 : null;
                    const improved = delta == null ? null : metric.higherBetter ? delta >= 0 : delta <= 0;
                    const DeltaIcon = delta == null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
                    return (
                      <div key={key} className="p-3.5 sm:p-4">
                        <div className="micro-label truncate">{metric.label.replace(' percibida', '').replace(' percibido', '')}</div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="font-heading text-[19px] font-semibold leading-none text-foreground tabular-nums">
                            {round1(value)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{value == null ? '' : metric.unit}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          {delta != null && (
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${
                                delta === 0 ? 'text-muted-foreground' : improved ? 'text-area-ink' : 'text-warning'
                              }`}
                            >
                              <DeltaIcon className="h-3 w-3" />
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          )}
                          <span className="truncate text-[10px] text-muted-foreground">{qualitative(key, value)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-1 pt-1">
                  <MiniSpark data={trend.slice(0, i + 1)} dataKey="symmetry" color="#2CB1D2" height={46} />
                </div>

                <div className="space-y-3 p-4 pt-2 sm:p-5 sm:pt-2">
                  {sessionComments.length > 0 && (
                    <div className="rounded-xl bg-area-soft/60 p-3.5">
                      <div className="eyebrow flex items-center gap-1.5 text-area-ink">
                        <Stethoscope className="h-3 w-3" /> Tu kinesiólogo
                      </div>
                      {sessionComments.map(c => (
                        <p key={c.id} className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                          {c.content}
                        </p>
                      ))}
                    </div>
                  )}

                  {myFeedback && (
                    <div className="rounded-xl border border-border p-3.5">
                      <div className="eyebrow flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3" /> Tu devolución
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        {myFeedback.pain_level != null && <span>Dolor {myFeedback.pain_level}/10</span>}
                        {myFeedback.confidence_level != null && <span>Confianza {myFeedback.confidence_level}/10</span>}
                      </div>
                      {myFeedback.notes && (
                        <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{myFeedback.notes}</p>
                      )}
                    </div>
                  )}

                  {!myFeedback && (
                    <Link
                      to={`/paciente/sesion/${s.id}`}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-area-ink hover:underline"
                    >
                      Contale cómo te sentiste <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}

          {generalComments.length > 0 && (
            <Card className="p-4 sm:p-5">
              <div className="eyebrow mb-3">Comentarios generales</div>
              <div className="space-y-3">
                {generalComments.map(c => (
                  <div key={c.id}>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{c.content}</p>
                    <div className="mt-1 text-[10px] text-muted-foreground">{format(parseISO(c.date), 'dd/MM/yyyy')}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}