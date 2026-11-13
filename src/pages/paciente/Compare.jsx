import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ds/PageHeader';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

  if (loading) return <LoadingState label="Cargando tus sesiones…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado.</div>;
  if (sessions.length < 2) return (
    <div className="text-sm text-muted-foreground">Necesitás al menos dos sesiones completadas para poder compararlas.</div>
  );

  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));
  const options = [...sessions].reverse();
  const sessionA = sessions.find(s => s.id === aId);
  const sessionB = sessions.find(s => s.id === bId);
  const metricsA = metricBySession[aId] || {};
  const metricsB = metricBySession[bId] || {};

  const label = (s) => `Sesión ${s.session_number} · ${format(parseISO(s.date), 'dd/MM/yyyy')}`;

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Comparar sesiones"
        subtitle="Elegí dos sesiones para ver cómo cambiaron tus variables."
      />

      {/* Selectores */}
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Sesión 1</label>
            <select value={aId} onChange={(e) => setAId(e.target.value)} className="input mt-1.5">
              {options.map(s => <option key={s.id} value={s.id}>{label(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Sesión 2</label>
            <select value={bId} onChange={(e) => setBId(e.target.value)} className="input mt-1.5">
              {options.map(s => <option key={s.id} value={s.id}>{label(s)}</option>)}
            </select>
          </div>
        </div>
        {aId !== bId && (
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <ArrowLeftRight className="h-3.5 w-3.5 text-brand-sky" />
            {sessionA && sessionB ? `${label(sessionA)} → ${label(sessionB)}` : ''}
          </div>
        )}
      </Card>

      {aId === bId ? (
        <div className="text-sm text-muted-foreground">Elegí dos sesiones distintas para comparar.</div>
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

            return (
              <Card key={v.key} className="p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-foreground">{v.label}</span>
                  <Chip tone={delta == null ? 'neutral' : equal ? 'neutral' : improved ? 'primary' : 'warning'}>
                    <Icon className="h-3 w-3" />
                    {delta == null ? 'Sin datos' : equal ? 'Igual' : `${delta > 0 ? '+' : ''}${delta}`}
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-xl bg-muted px-4 py-3 text-center">
                    <div className="font-heading text-lg font-semibold text-foreground tabular-nums">
                      {fmt(va)}<span className="ml-0.5 text-[11px] font-medium text-muted-foreground">{v.unit}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Sesión 1</div>
                  </div>
                  <div className="h-px w-4 shrink-0 bg-border" />
                  <div className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center">
                    <div className="font-heading text-lg font-semibold text-primary tabular-nums">
                      {fmt(vb)}<span className="ml-0.5 text-[11px] font-medium text-primary">{v.unit}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-primary">Sesión 2</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}