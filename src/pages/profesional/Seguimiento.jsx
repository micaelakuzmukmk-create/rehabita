import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PatientSelector from '@/components/profesional/PatientSelector';
import MeasurementSessionList from '@/components/profesional/MeasurementSessionList';
import ActivityChart from '@/components/profesional/ActivityChart';
import { loadTherapistPatients } from '@/lib/therapist';
import { MUSCLE_SERIES, formatElapsed } from '@/lib/measurements';
import PageHeader from '@/components/ds/PageHeader';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Seguimiento() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [samples, setSamples] = useState([]);
  const [visible, setVisible] = useState({ isquio: true, vasto_interno: true, vasto_externo: true });
  const [loading, setLoading] = useState(true);
  const [loadingSamples, setLoadingSamples] = useState(false);

  useEffect(() => { loadPatients(); }, []);
  useEffect(() => { if (patientId) loadSessions(patientId); }, [patientId]);
  useEffect(() => { if (selectedId) loadSamples(selectedId); }, [selectedId]);

  async function loadPatients() {
    try {
      const { patients: list } = await loadTherapistPatients();
      setPatients(list);
      if (list[0]) setPatientId(list[0].id);
    } catch {
      toast.error('No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions(id) {
    try {
      const list = await base44.entities.MeasurementSession.filter({ patient_id: id }, '-started_at', 100);
      setSessions(list);
      setSelectedId(list[0]?.id || '');
    } catch {
      toast.error('No se pudieron cargar las mediciones');
    }
  }

  async function loadSamples(sessionId) {
    setLoadingSamples(true);
    try {
      const list = await base44.entities.MuscleMeasurement.filter({ session_id: sessionId }, 'received_at', 1000);
      setSamples(list);
    } catch {
      toast.error('No se pudieron cargar las muestras');
    } finally {
      setLoadingSamples(false);
    }
  }

  const selected = sessions.find((s) => s.id === selectedId) || null;

  // Mientras la sesión está en curso, el gráfico se actualiza en tiempo real.
  useEffect(() => {
    if (!selected || selected.status !== 'activa') return;
    const t = setInterval(async () => {
      try {
        const list = await base44.entities.MuscleMeasurement.filter({ session_id: selected.id }, 'received_at', 1000);
        setSamples(list);
      } catch {
        /* se reintenta en el próximo ciclo */
      }
    }, 2500);
    return () => clearInterval(t);
  }, [selected?.id, selected?.status]);

  const startedTs = selected?.started_at ? new Date(selected.started_at).getTime() : null;

  const chartData = samples.map((s) => {
    const elapsed = s.elapsed_ms != null
      ? s.elapsed_ms
      : startedTs != null
        ? new Date(s.received_at).getTime() - startedTs
        : 0;
    return {
      time: formatElapsed(elapsed),
      isquio: s.isquio ?? null,
      vasto_interno: s.vasto_interno ?? null,
      vasto_externo: s.vasto_externo ?? null,
    };
  });

  const toggleSeries = (key) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  if (loading) return <LoadingState label="Cargando seguimiento…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Área Kinesiólogo"
        title="Seguimiento"
        subtitle="Actividad muscular registrada por el wearable, sesión por sesión."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-4 sm:p-5">
            <PatientSelector patients={patients} value={patientId} onChange={setPatientId} />
          </Card>

          <Card className="p-4 sm:p-5">
            <h2 className="section-title mb-3">Sesiones de medición</h2>
            <MeasurementSessionList sessions={sessions} selectedId={selectedId} onSelect={setSelectedId} />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-title">Actividad muscular</span>
                {selected?.status === 'activa' && <Chip tone="success" dot>En vivo</Chip>}
                {selected?.simulated !== false && selected && <Chip tone="warning">Datos simulados</Chip>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MUSCLE_SERIES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSeries(s.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      visible[s.key]
                        ? 'border-secondary bg-secondary font-medium text-primary'
                        : 'border-border text-muted-foreground hover:border-brand-lavender'
                    }`}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: visible[s.key] ? s.color : '#D8D6E2' }}
                    />
                    {s.short}
                  </button>
                ))}
              </div>
            </div>

            {!selected ? (
              <EmptyState
                icon={Activity}
                title="Sin sesión seleccionada"
                description="Seleccioná una sesión para ver sus curvas de actividad."
              />
            ) : loadingSamples ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Cargando muestras…</div>
            ) : chartData.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Esta sesión no tiene muestras registradas.
              </div>
            ) : (
              <ActivityChart data={chartData} visible={visible} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}