import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRIC_MAP } from '@/lib/rehbaita';
import CompareMetric from '@/components/paciente/CompareMetric';
import PageHeader from '@/components/ds/PageHeader';
import SectionHead from '@/components/ds/SectionHead';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowLeftRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const MAIN_KEYS = ['symmetry', 'stability', 'knee_flexion_angle', 'confidence_perceived', 'pain_perceived'];
const EXTRA_KEYS = ['load_distribution', 'movement_control', 'strength_hamstrings', 'strength_vastus_medialis', 'strength_vastus_lateralis', 'injurious_movements'];

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

  if (sessions.length < 2) {
    return (
      <div className="space-y-5">
        <PageHeader back={{ to: '/paciente/progreso', label: 'Volver' }} eyebrow="Área Paciente" title="Comparar sesiones" />
        <Card className="p-6 text-sm text-muted-foreground">
          Necesitás al menos dos sesiones completadas para compararlas.
        </Card>
      </div>
    );
  }

  const metricBySession = Object.fromEntries(metrics.map(m => [m.session_id, m]));
  const options = [...sessions].reverse();
  const sessionA = sessions.find(s => s.id === aId);
  const sessionB = sessions.find(s => s.id === bId);
  const metricsA = metricBySession[aId] || {};
  const metricsB = metricBySession[bId] || {};

  const label = (s) => `Sesión ${s.session_number} · ${format(parseISO(s.date), 'dd/MM/yyyy')}`;
  const isLatestPair = sessionB && sessions[sessions.length - 1]?.id === sessionB.id;

  const sparkData = sessions.map((s, i) => {
    const m = metricBySession[s.id] || {};
    const row = { label: `S${s.session_number ?? i + 1}` };
    MAIN_KEYS.concat(EXTRA_KEYS).forEach(k => { if (m[k] != null) row[k] = m[k]; });
    return row;
  });

  const comparable = MAIN_KEYS.filter(k => metricsA[k] != null && metricsB[k] != null);
  const improved = comparable.filter(k => {
    const d = Number(metricsB[k]) - Number(metricsA[k]);
    return METRIC_MAP[k].higherBetter ? d >= 0 : d <= 0;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente/progreso', label: 'Mi progreso' }}
        eyebrow="Mi progreso · nivel 2"
        title="Comparar sesiones"
        subtitle="El detalle de tu evolución: qué cambió entre una sesión y otra."
        actions={
          <Link to="/paciente/progreso">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al resumen
            </Button>
          </Link>
        }
      />

      {/* Selectores */}
      <Card className="p-4 sm:p-5">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className="field-label">Sesión A</label>
            <select value={aId} onChange={(e) => setAId(e.target.value)} className="input mt-1.5">
              {options.map(s => <option key={s.id} value={s.id}>{label(s)}</option>)}
            </select>
          </div>
          <div className="flex h-10 items-center justify-center">
            <ArrowLeftRight className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <label className="field-label">Sesión B</label>
            <select value={bId} onChange={(e) => setBId(e.target.value)} className="input mt-1.5">
              {options.map(s => <option key={s.id} value={s.id}>{label(s)}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Chip tone="neutral">{isLatestPair ? 'Última sesión vs. anterior' : 'Comparación personalizada'}</Chip>
          {sessionB && (
            <Link to={`/paciente/sesion/${sessionB.id}`} className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-area-ink hover:underline">
              Ver reporte de la sesión B <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </Card>

      {aId === bId ? (
        <Card className="p-6 text-sm text-muted-foreground">Elegí dos sesiones distintas para comparar.</Card>
      ) : (
        <>
          <div className="flex items-center gap-2.5 rounded-2xl border border-area-accent/40 bg-area-soft/70 px-4 py-3">
            <TrendingUp className="h-4 w-4 shrink-0 text-area-ink" />
            <p className="text-[13px] text-foreground">
              <span className="font-semibold">{improved} de {comparable.length}</span> variables mejoraron entre la sesión A y la B.
            </p>
          </div>

          <section>
            <SectionHead title="Indicadores principales" description="Antes y ahora, con la diferencia entre ambas sesiones." />
            <div className="grid gap-3 sm:grid-cols-2">
              {MAIN_KEYS.map((key) => (
                <CompareMetric
                  key={key}
                  metricKey={key}
                  a={metricsA[key]}
                  b={metricsB[key]}
                  labelA={sessionA ? `Sesión ${sessionA.session_number}` : 'Sesión A'}
                  labelB={sessionB ? `Sesión ${sessionB.session_number}` : 'Sesión B'}
                  sparkData={sparkData}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHead title="Fuerza y control" description="Grupos musculares y seguridad del movimiento." />
            <div className="grid gap-3 sm:grid-cols-2">
              {EXTRA_KEYS.map((key) => (
                <CompareMetric
                  key={key}
                  metricKey={key}
                  a={metricsA[key]}
                  b={metricsB[key]}
                  labelA={sessionA ? `Sesión ${sessionA.session_number}` : 'Sesión A'}
                  labelB={sessionB ? `Sesión ${sessionB.session_number}` : 'Sesión B'}
                  sparkData={sparkData}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}