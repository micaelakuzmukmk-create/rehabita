import React, { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import useBleDevice, {
  DEVICE_NAME,
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  isWebBluetoothSupported,
} from '@/hooks/useBleDevice';
import ConnectionStatus from '@/components/device/ConnectionStatus';
import PatientSelector from '@/components/profesional/PatientSelector';
import DeviceStatePanel from '@/components/profesional/DeviceStatePanel';
import { loadTherapistPatients } from '@/lib/therapist';
import { summarizeSamples, SAMPLE_STALE_MS } from '@/lib/measurements';
import { AlertTriangle, Bluetooth, Play, Smartphone, Square, Unlink } from 'lucide-react';
import toast from 'react-hot-toast';

const FLUSH_MS = 3000;
const MAX_BATCH = 500;

export default function DeviceConnection() {
  const [patients, setPatients] = useState([]);
  const [professional, setProfessional] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [lastSampleAt, setLastSampleAt] = useState(null);
  const [sampleCount, setSampleCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const bufferRef = useRef([]);
  const sessionRef = useRef(null);
  const startTsRef = useRef(null);
  const losingRef = useRef(false);

  const {
    status,
    error,
    deviceName,
    connect,
    disconnect,
    sendCommand,
  } = useBleDevice({ onNotification: handleNotification });

  // Asocia cada muestra recibida a la sesión y al paciente activos.
  function handleNotification({ text, time, sample }) {
    const session = sessionRef.current;
    if (!session || session.status !== 'activa' || !session.patient_id) return;

    if (!sample) {
      // Mensajes que no son muestras (confirmaciones del wearable) quedan como registro crudo.
      base44.entities.BluetoothMeasurement.create({
        received_at: time.toISOString(),
        device_name: deviceName || DEVICE_NAME,
        message: text,
        session_id: session.id,
        data_type: 'device_message',
      }).catch(() => {});
      return;
    }

    const startedAt = startTsRef.current || new Date(session.started_at).getTime();
    bufferRef.current.push({
      session_id: session.id,
      patient_id: session.patient_id,
      received_at: time.toISOString(),
      elapsed_ms: Math.max(0, time.getTime() - startedAt),
      isquio: sample.isquio,
      vasto_interno: sample.vasto_interno,
      vasto_externo: sample.vasto_externo,
      simulated: sample.simulated,
    });
    setLastSampleAt(time.getTime());
  }

  // Las muestras se acumulan y se guardan en bloque para no sobrecargar la base de datos.
  const flushBuffer = useCallback(async () => {
    if (bufferRef.current.length === 0) return;
    const batch = bufferRef.current.slice(0, MAX_BATCH);
    bufferRef.current = bufferRef.current.slice(batch.length);
    try {
      await base44.entities.MuscleMeasurement.bulkCreate(batch);
      setSampleCount((c) => c + batch.length);
    } catch {
      bufferRef.current = [...batch, ...bufferRef.current];
      setNotice('No se pudieron guardar algunas muestras. Se reintentará automáticamente.');
    }
  }, []);

  const connected = status === 'conectado';
  const connecting = status === 'conectando';
  const sessionActive = activeSession?.status === 'activa';
  const sessionInterrupted = activeSession?.status === 'interrumpida';
  const recent = !!lastSampleAt && now - lastSampleAt < SAMPLE_STALE_MS;

  let measurementState = 'en_espera';
  if (sessionInterrupted) measurementState = 'interrumpido';
  else if (sessionActive) {
    if (!connected) measurementState = 'interrumpido';
    else if (recent) measurementState = 'midiendo';
    else measurementState = 'sin_datos';
  }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { professional: pro, patients: list } = await loadTherapistPatients();
      setProfessional(pro);
      setPatients(list);

      const query = pro ? { therapist_id: pro.id, status: 'activa' } : { status: 'activa' };
      const actives = await base44.entities.MeasurementSession.filter(query, '-started_at', 5);
      const current = actives[0];
      if (current) {
        sessionRef.current = current;
        setActiveSession(current);
        setPatientId(current.patient_id || '');
        startTsRef.current = current.started_at ? new Date(current.started_at).getTime() : Date.now();
        setSampleCount(current.sample_count || 0);
      }
    } catch {
      setNotice('No se pudo cargar la información de pacientes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!sessionActive) return;
    const t = setInterval(() => { flushBuffer(); }, FLUSH_MS);
    return () => clearInterval(t);
  }, [sessionActive, flushBuffer]);

  // Al perderse la conexión, la sesión se cierra como interrumpida conservando las muestras.
  useEffect(() => {
    const session = sessionRef.current;
    if (status !== 'desconectado' || !session || session.status !== 'activa' || losingRef.current) return;
    losingRef.current = true;
    (async () => {
      try {
        const updated = await finalizeSession(session, 'interrumpida');
        sessionRef.current = updated;
        setActiveSession(updated);
        setNotice('Se perdió la conexión con el wearable. La sesión quedó marcada como interrumpida y las muestras recibidas se conservaron.');
      } catch {
        setNotice('Se perdió la conexión y no se pudieron guardar los resultados de la sesión.');
      } finally {
        losingRef.current = false;
      }
    })();
  }, [status]);

  async function finalizeSession(session, finalStatus) {
    await flushBuffer();
    const samples = await base44.entities.MuscleMeasurement.filter({ session_id: session.id }, 'received_at', 1000);
    const summary = summarizeSamples(samples);

    const existing = await base44.entities.SessionSummary.filter({ session_id: session.id }, '-created_date', 1);
    const payload = { session_id: session.id, patient_id: session.patient_id, ...summary, simulated: true };
    if (existing[0]) await base44.entities.SessionSummary.update(existing[0].id, payload);
    else await base44.entities.SessionSummary.create(payload);

    return base44.entities.MeasurementSession.update(session.id, {
      status: finalStatus,
      ended_at: new Date().toISOString(),
      sample_count: summary.sample_count,
    });
  }

  async function startMeasurement() {
    if (!connected || !patientId || sessionActive || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const startedAt = new Date();
      const created = await base44.entities.MeasurementSession.create({
        patient_id: patientId,
        therapist_id: professional?.id || '',
        device_name: deviceName || DEVICE_NAME,
        started_at: startedAt.toISOString(),
        status: 'activa',
        simulated: true,
        sample_count: 0,
      });

      bufferRef.current = [];
      startTsRef.current = startedAt.getTime();
      sessionRef.current = created;
      setActiveSession(created);
      setSampleCount(0);
      setLastSampleAt(null);

      try {
        await sendCommand('START');
        toast.success('Medición iniciada · comando START enviado');
      } catch {
        setNotice('La sesión se creó, pero no se pudo enviar el comando START al wearable. Verificá que el dispositivo admita escritura BLE.');
      }
    } catch {
      setNotice('No se pudo iniciar la medición.');
    } finally {
      setBusy(false);
    }
  }

  async function finishMeasurement() {
    const session = sessionRef.current;
    if (!session || session.status !== 'activa' || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      let stopFailed = false;
      try {
        await sendCommand('STOP');
      } catch {
        stopFailed = true;
      }
      await finalizeSession(session, 'finalizada');
      sessionRef.current = null;
      setActiveSession(null);
      setLastSampleAt(null);
      toast.success('Medición finalizada y resultados guardados');
      if (stopFailed) setNotice('No se pudo enviar el comando STOP al wearable. La sesión se guardó igualmente.');
    } catch {
      setNotice('No se pudo finalizar la medición. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  async function handleUnbind() {
    setBusy(true);
    setNotice(null);
    try {
      const session = sessionRef.current;
      if (session && session.status === 'activa') {
        try {
          await sendCommand('STOP');
        } catch {
          /* la sesión se cierra igualmente */
        }
        await finalizeSession(session, 'finalizada');
      }
      sessionRef.current = null;
      setActiveSession(null);
      setLastSampleAt(null);
      await disconnect();
    } catch {
      setNotice('No se pudo desvincular el wearable.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;

  const supported = isWebBluetoothSupported();
  const patientName = patients.find((p) => p.id === patientId)?.full_name;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-slate-500" />
          <h1 className="text-xl font-semibold text-slate-900">Dispositivo</h1>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Datos simulados
        </span>
      </div>
      <p className="text-sm text-slate-500">
        Vinculá el wearable <span className="font-medium text-slate-700">{DEVICE_NAME}</span> por Bluetooth Low Energy
        (BLE) desde Google Chrome en Android, seleccioná el paciente e iniciá la medición.
      </p>

      {!supported && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <div className="font-medium">Este navegador no admite Web Bluetooth</div>
            <p className="mt-1">
              Abrí la aplicación con <span className="font-medium">Google Chrome en Android</span> sobre una conexión
              segura (HTTPS) y volvé a intentarlo.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <ConnectionStatus status={status} deviceName={deviceName} />

        <DeviceStatePanel
          deviceName={deviceName}
          connectionStatus={status}
          measurementState={measurementState}
          patientName={patientName}
          startedAt={activeSession?.started_at}
          lastSampleAt={lastSampleAt}
          sampleCount={sampleCount}
        />

        <PatientSelector
          patients={patients}
          value={patientId}
          onChange={setPatientId}
          disabled={sessionActive || busy}
          hint="No se puede cambiar de paciente mientras hay una medición en curso."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={connect}
            disabled={!supported || connecting || connected || busy}
            className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
          >
            {connecting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Bluetooth className="w-4 h-4" />
            )}
            Conectar wearable
          </button>

          <button
            onClick={startMeasurement}
            disabled={!connected || !patientId || sessionActive || busy}
            className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <Play className="w-4 h-4" /> Iniciar medición
          </button>

          <button
            onClick={finishMeasurement}
            disabled={!sessionActive || busy}
            className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
          >
            <Square className="w-4 h-4" /> Finalizar medición
          </button>

          <button
            onClick={handleUnbind}
            disabled={(!connected && !sessionActive) || busy}
            className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Unlink className="w-4 h-4" /> Desvincular
          </button>
        </div>

        {!connected && patientId && !sessionActive && (
          <p className="text-xs text-slate-500">Conectá el wearable para habilitar el inicio de la medición.</p>
        )}
        {connected && !patientId && (
          <p className="text-xs text-slate-500">Seleccioná un paciente para habilitar el inicio de la medición.</p>
        )}

        {error && (
          <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-800">{error}</div>
          </div>
        )}

        {notice && (
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">{notice}</div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
            <Smartphone className="w-3.5 h-3.5" /> Parámetros de conexión
          </div>
          <dl className="space-y-1 text-[11px] font-mono text-slate-500 break-all">
            <div>Dispositivo: {DEVICE_NAME}</div>
            <div>Service UUID: {SERVICE_UUID}</div>
            <div>Characteristic UUID: {CHARACTERISTIC_UUID}</div>
            <div>Comandos: START / STOP</div>
          </dl>
        </div>
      </div>
    </div>
  );
}