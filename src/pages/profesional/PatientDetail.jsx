import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS, PHASE_LABELS } from '@/lib/rehbaita';
import MetricChart from '@/components/MetricChart';
import { ArrowLeft, Plus, FileText, ClipboardList, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const TABS = ['Resumen', 'Sesiones', 'Plan', 'Comentarios'];

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

  if (loading) return <div className="text-sm text-slate-400">Cargando ficha…</div>;
  if (!patient) return <div className="text-sm text-slate-400">Paciente no encontrado</div>;

  const plan = plans[0];

  return (
    <div>
      <Link to="/profesional" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{patient.full_name}</h1>
          <div className="text-sm text-slate-500 mt-0.5">
            Rodilla {patient.injury_side}
            {patient.injury_date && ` · lesión ${format(parseISO(patient.injury_date), 'dd/MM/yyyy')}`}
            {patient.birth_date && ` · ${format(parseISO(patient.birth_date), 'dd/MM/yyyy')}`}
          </div>
        </div>
        <Link
          to={`/profesional/paciente/${patientId}/sesion/nueva`}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" /> Nueva sesión
        </Link>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${tab === t ? 'border-slate-900 text-slate-900 font-medium' : 'border-transparent text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Resumen' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-medium text-slate-700 mb-1">Última sesión</div>
            {lastMetrics ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {METRICS.map(m => (
                  <div key={m.key} className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">{m.label}</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {lastMetrics[m.key] != null ? Math.round(lastMetrics[m.key] * 10) / 10 : '—'}
                      <span className="text-xs text-slate-400 ml-1">{m.unit}</span>
                    </div>
                    {prevMetrics && prevMetrics[m.key] != null && lastMetrics[m.key] != null && (
                      <div className={`text-xs mt-0.5 ${(m.higherBetter ? lastMetrics[m.key] >= prevMetrics[m.key] : lastMetrics[m.key] <= prevMetrics[m.key]) ? 'text-emerald-600' : 'text-rose-600'}`}>
                        vs anterior: {(lastMetrics[m.key] - prevMetrics[m.key]).toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <div className="text-sm text-slate-400">Sin mediciones registradas</div>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-medium text-slate-700 mb-3">Evolución por sesión</div>
            <MetricChart data={chartData} metrics={METRICS.slice(0, 4)} />
          </div>
        </div>
      )}

      {tab === 'Sesiones' && (
        <div className="space-y-2">
          {sessions.length === 0 && <div className="text-sm text-slate-400">Sin sesiones registradas</div>}
          {[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (
            <Link
              key={s.id}
              to={`/profesional/sesion/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">Sesión {s.session_number ?? sessions.length - i}</div>
                  <div className="text-xs text-slate-500">{format(parseISO(s.date), "dd/MM/yyyy HH:mm")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'completada' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{s.status}</span>
                <ChevronRightSmall />
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'Plan' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {plan ? (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">{plan.title}</h3>
                <Link to={`/profesional/paciente/${patientId}/plan`} className="text-sm text-blue-600 hover:underline">Editar plan</Link>
              </div>
              <p className="text-sm text-slate-600 mt-2">{plan.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-sm">
                <Info label="Fase actual" value={PHASE_LABELS[plan.current_phase] || plan.current_phase} />
                <Info label="Inicio" value={plan.start_date ? format(parseISO(plan.start_date), 'dd/MM/yyyy') : '—'} />
                <Info label="Objetivo" value={plan.target_end_date ? format(parseISO(plan.target_end_date), 'dd/MM/yyyy') : '—'} />
                <Info label="Estado" value={plan.status} />
              </div>
              {plan.goals && (
                <div className="mt-4">
                  <div className="text-xs text-slate-500 mb-1">Objetivos</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.goals}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-400 flex items-center justify-between">
              Sin plan de rehabilitación
              <Link to={`/profesional/paciente/${patientId}/plan`} className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white">
                <ClipboardList className="w-4 h-4" /> Crear plan
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === 'Comentarios' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Escribí un comentario para el paciente…"
              rows={3}
              className="w-full text-sm rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-slate-400 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={addComment}
                disabled={saving || !newComment.trim()}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40"
              >
                <MessageSquare className="w-4 h-4" /> {saving ? 'Guardando…' : 'Publicar comentario'}
              </button>
            </div>
          </div>
          {comments.length === 0 && <div className="text-sm text-slate-400">Sin comentarios</div>}
          {comments.map(c => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-400 mb-1">{format(parseISO(c.date), "dd/MM/yyyy HH:mm")}</div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-900 capitalize mt-0.5">{value}</div>
    </div>
  );
}

function ChevronRightSmall() {
  return <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>;
}