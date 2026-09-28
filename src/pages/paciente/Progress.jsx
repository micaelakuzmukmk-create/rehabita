import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ProgressRing from '@/components/paciente/ProgressRing';
import MuscleStrengthChart from '@/components/paciente/MuscleStrengthChart';
import InjuriousMovementsChart from '@/components/paciente/InjuriousMovementsChart';
import { ArrowLeft, Dumbbell, AlertTriangle, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_TOTAL_SESSIONS = 24;

export default function PatientProgress() {
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
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 100),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 100),
        base44.entities.RehabPlan.filter({ patient_id: p.id, status: 'activo' }, '-created_date', 5),
      ]);
      setSessions(s);
      setMetrics(m);
      setPlan(pl[0] || null);
    } catch (e) {
      toast.error('No se pudo cargar tu progreso');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado. Pedí a tu kinesiólogo que te asigne.</div>;

  const sessionsAsc = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));

  const completed = sessions.filter(s => s.status === 'completada').length;
  const total = plan?.total_sessions || DEFAULT_TOTAL_SESSIONS;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const chartData = sessionsAsc.map((s, i) => {
    const m = metricBySession[s.id] || {};
    return {
      label: `S${i + 1}`,
      strength_vastus_medialis: m.strength_vastus_medialis ?? null,
      strength_vastus_lateralis: m.strength_vastus_lateralis ?? null,
      strength_hamstrings: m.strength_hamstrings ?? null,
      injurious_movements: m.injurious_movements ?? 0,
    };
  });

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Mi progreso</h1>
        <p className="text-sm text-slate-500">Cómo venís avanzando en tu rehabilitación, sesión a sesión.</p>
      </div>

      {/* Sesiones realizadas de las totales a realizar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <CalendarCheck className="w-4 h-4 text-teal-600" /> Sesiones realizadas
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
          <ProgressRing value={pct} color="#0d9488" label="completadas" />
          <div className="text-center sm:text-left flex-1">
            <div className="text-2xl font-semibold text-slate-900">
              {completed} <span className="text-base font-normal text-slate-400">de {total} sesiones</span>
            </div>
            <div className="text-sm text-slate-500 mt-1">{plan ? `Plan: ${plan.title}` : 'Plan de rehabilitación'}</div>
            <div className="mt-3 w-full sm:w-72 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-teal-500 transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Fuerza por grupo muscular */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Dumbbell className="w-4 h-4 text-blue-600" /> Fuerza por grupo muscular
        </div>
        <p className="text-sm text-slate-500 mt-1 mb-3">Fuerza adquirida en cada sesión, por grupo muscular.</p>
        <MuscleStrengthChart data={chartData} />
      </div>

      {/* Movimientos lesivos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Movimientos lesivos
        </div>
        <p className="text-sm text-slate-500 mt-1 mb-3">Cantidad de movimientos lesivos registrados en cada sesión.</p>
        <InjuriousMovementsChart data={chartData} />
      </div>
    </div>
  );
}