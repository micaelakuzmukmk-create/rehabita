import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PatientSelector from '@/components/profesional/PatientSelector';
import MeasurementSessionList from '@/components/profesional/MeasurementSessionList';
import ActivityChart from '@/components/profesional/ActivityChart';
import { loadTherapistPatients } from '@/lib/therapist';
import { MUSCLE_SERIES, formatElapsed } from '@/lib/measurements';
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

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-slate-500" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Seguimiento</h1>
          <p className="text-sm text-slate-500">Actividad muscular registrada por el wearable, sesión por sesión.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <PatientSelector patients={patients} value={patientId} onChange={setPatientId} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-medium text-slate-700 mb-3">Sesiones de medición</div>
            <MeasurementSessionList sessions={sessions} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                Actividad muscular
                {selected?.status === 'activa' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    En vivo
                  </span>
                )}
                {selected?.simulated !== false && selected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Datos simulados
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MUSCLE_SERIES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSeries(s.key)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                      visible[s.key] ? 'text-slate-900 border-slate-300 bg-slate-50' : 'text-slate-400 border-slate-200'
                    }`}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: visible[s.key] ? s.color : '#cbd5e1' }}
                    />
                    {s.short}
                  </button>
                ))}
              </div>
            </div>

            {!selected ? (
              <div className="text-sm text-slate-400 py-16 text-center">
                Seleccioná una sesión para ver sus curvas de actividad.
              </div>
            ) : loadingSamples ? (
              <div className="text-sm text-slate-400 py-16 text-center">Cargando muestras…</div>
            ) : chartData.length === 0 ? (
              <div className="text-sm text-slate-400 py-16 text-center">
                Esta sesión no tiene muestras registradas.
              </div>
            ) : (
              <ActivityChart data={chartData} visible={visible} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}