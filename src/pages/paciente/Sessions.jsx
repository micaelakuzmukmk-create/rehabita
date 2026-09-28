import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SessionsCalendar from '@/components/paciente/SessionsCalendar';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Frown, Smile, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_TOTAL_SESSIONS = 24;

export default function PatientSessions() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [plan, setPlan] = useState(null);
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
      const [s, m, pl] = await Promise.all([
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 200),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 200),
        base44.entities.RehabPlan.filter({ patient_id: p.id, status: 'activo' }, '-created_date', 5),
      ]);
      setSessions(s);
      setMetrics(m);
      setPlan(pl[0] || null);
    } catch (e) {
      toast.error('No se pudieron cargar tus sesiones');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado. Pedí a tu kinesiólogo que te asigne.</div>;

  const sessionsAsc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));

  const total = plan?.total_sessions || DEFAULT_TOTAL_SESSIONS;
  const completed = sessions.filter(s => s.status === 'completada');
  const abandoned = sessions.filter(s => s.status === 'cancelada');
  const remaining = Math.max(0, total - completed.length);

  const withPain = completed.filter(s => (metricBySession[s.id]?.pain_perceived ?? 0) > 0).length;
  const withoutPain = completed.length - withPain;

  const stats = [
    { label: 'Realizadas', value: `${completed.length} / ${total}`, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Por realizar', value: remaining, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Abandonadas', value: abandoned.length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Con dolor', value: withPain, icon: Frown, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sin dolor', value: withoutPain, icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const sessionDates = sessionsAsc.map(s => s.date);

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Mis sesiones</h1>
        <p className="text-sm text-slate-500">Resumen de tus sesiones de rehabilitación.</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className={`w-8 h-8 rounded-lg ${st.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${st.color}`} />
              </div>
              <div className="text-xl font-semibold text-slate-900">{st.value}</div>
              <div className="text-xs text-slate-500">{st.label}</div>
            </div>
          );
        })}
      </div>

      {/* Calendario de sesiones */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
          <CalendarDays className="w-4 h-4 text-slate-500" /> Fechas de tus sesiones
        </div>
        <p className="text-sm text-slate-500 mb-3">Los días marcados son las fechas en las que realizaste sesiones.</p>
        <SessionsCalendar dates={sessionDates} />
      </div>
    </div>
  );
}