import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const COMPARE_VARS = [
  { key: 'pain_perceived', label: 'Dolor percibido', unit: '/10', higherBetter: false },
  { key: 'confidence_perceived', label: 'Estado de ánimo', unit: '', higherBetter: true },
  { key: 'strength_hamstrings', label: 'Activación isquiotibiales', unit: '', higherBetter: true },
  { key: 'strength_vastus_medialis', label: 'Cuádriceps vasto interno', unit: '', higherBetter: true },
  { key: 'strength_vastus_lateralis', label: 'Cuádriceps vasto externo', unit: '', higherBetter: true },
  { key: 'injurious_movements', label: 'Movimientos lesivos', unit: '', higherBetter: false },
];

const fmt = (v) => (v == null || v === '' ? '—' : Math.round(Number(v) * 10) / 10);

export default function Compare() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');
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

      const [s, m] = await Promise.all([
        base44.entities.Session.filter({ patient_id: p.id, status: 'completada' }, '-date', 200),
        base44.entities.SessionMetrics.filter({ patient_id: p.id }, '-created_date', 200),
      ]);
      const asc = [...s].sort((x, y) => new Date(x.date) - new Date(y.date));
      setSessions(asc);
      setMetrics(m);
      if (asc.length >= 1) setAId(asc[Math.max(0, asc.length - 2)].id);
      if (asc.length >= 2) setBId(asc[asc.length - 1].id);
      else if (asc.length === 1) setBId(asc[0].id);
    } catch (e) {
      toast.error('No se pudieron cargar tus sesiones');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado.</div>;
  if (sessions.length < 2) return (
    <div className="text-sm text-slate-400">Necesitás al menos dos sesiones completadas para poder compararlas.</div>
  );

  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));
  const options = [...sessions].reverse();
  const sessionA = sessions.find(s => s.id === aId);
  const sessionB = sessions.find(s => s.id === bId);
  const metricsA = metricBySession[aId] || {};
  const metricsB = metricBySession[bId] || {};

  const label = (s) => `Sesión ${s.session_number} · ${format(parseISO(s.date), 'dd/MM/yyyy')}`;

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Comparar sesiones</h1>
        <p className="text-sm text-slate-500">Elegí dos sesiones para ver cómo cambiaron tus variables.</p>
      </div>

      {/* Selectores */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Sesión 1</label>
          <select value={aId} onChange={(e) => setAId(e.target.value)} className="input">
            {options.map(s => <option key={s.id} value={s.id}>{label(s)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Sesión 2</label>
          <select value={bId} onChange={(e) => setBId(e.target.value)} className="input">
            {options.map(s => <option key={s.id} value={s.id}>{label(s)}</option>)}
          </select>
        </div>
      </div>

      {aId === bId ? (
        <div className="text-sm text-slate-400">Elegí dos sesiones distintas para comparar.</div>
      ) : (
        <div className="space-y-3">
          {COMPARE_VARS.map((v) => {
            const va = metricsA[v.key];
            const vb = metricsB[v.key];
            const hasBoth = va != null && vb != null;
            const delta = hasBoth ? Math.round((Number(vb) - Number(va)) * 10) / 10 : null;
            const improved = delta == null ? null : (v.higherBetter ? delta >= 0 : delta <= 0);
            const equal = delta === 0;
            const Icon = equal ? Minus : improved ? TrendingUp : TrendingDown;
            const tone = equal
              ? 'text-slate-500 bg-slate-100'
              : improved
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-rose-700 bg-rose-50';

            return (
              <div key={v.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-medium text-slate-700 mb-3">{v.label}</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-center flex-1">
                    <div className="text-lg font-semibold text-slate-900">
                      {fmt(va)}<span className="text-xs text-slate-400 ml-0.5">{v.unit}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Sesión 1</div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${tone}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {delta == null ? 'Sin datos' : equal ? 'Igual' : `${delta > 0 ? '+' : ''}${delta}`}
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-lg font-semibold text-slate-900">
                      {fmt(vb)}<span className="text-xs text-slate-400 ml-0.5">{v.unit}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Sesión 2</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}