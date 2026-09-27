import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { METRICS } from '@/lib/rehbaita';
import { ArrowLeft, Check, Dumbbell, Gauge, Play, Square, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STEPS = ['Ejercicios', 'Calibración', 'Sesión', 'Mediciones'];

export default function SessionCreate() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [device, setDevice] = useState('');
  const [calibration, setCalibration] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const [session, setSession] = useState(null);
  const [metrics, setMetrics] = useState(() => Object.fromEntries(METRICS.map(m => [m.key, ''])));
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [patientId]);

  async function load() {
    try {
      const [p, ex, dv, ss] = await Promise.all([
        base44.entities.Patient.get(patientId),
        base44.entities.Exercise.list('-created_date', 50),
        base44.entities.Device.list('-created_date', 20),
        base44.entities.Session.filter({ patient_id: patientId }, '-date', 200),
      ]);
      setPatient(p);
      setExercises(ex);
      setDevices(dv);
      setSessionsCount(ss.length);
      if (dv[0]) setDevice(dv[0].id);
    } catch (e) {
      toast.error('No se pudo cargar la información');
    }
  }

  function toggleExercise(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  function runCalibration() {
    setCalibrating(true);
    setTimeout(() => {
      setCalibration({
        baseline_symmetry: 60 + Math.random() * 15,
        baseline_stability: 55 + Math.random() * 15,
        baseline_load: 58 + Math.random() * 12,
        status: 'exitosa',
      });
      setCalibrating(false);
      toast.success('Calibración exitosa');
    }, 1400);
  }

  async function startSession() {
    try {
      const created = await base44.entities.Session.create({
        patient_id: patientId,
        date: new Date().toISOString(),
        session_number: sessionsCount + 1,
        status: 'en_progreso',
        exercises: selected,
        device_id: device,
      });
      const cal = await base44.entities.Calibration.create({
        device_id: device,
        session_id: created.id,
        date: new Date().toISOString(),
        baseline_symmetry: calibration.baseline_symmetry,
        baseline_stability: calibration.baseline_stability,
        baseline_load: calibration.baseline_load,
        status: 'exitosa',
      });
      await base44.entities.Session.update(created.id, { calibration_id: cal.id });
      setSession({ ...created, calibration_id: cal.id });
      setStep(2);
      toast.success('Sesión iniciada');
    } catch (e) {
      toast.error('No se pudo iniciar la sesión');
    }
  }

  function simulateMetrics() {
    const next = {};
    METRICS.forEach(m => {
      if (m.key === 'reaction_time') next[m.key] = Math.round(380 + Math.random() * 220);
      else if (m.key === 'knee_flexion_angle') next[m.key] = Math.round(95 + Math.random() * 35);
      else if (m.key === 'pain_perceived') next[m.key] = Math.round(Math.random() * 5 * 10) / 10;
      else next[m.key] = Math.round((40 + Math.random() * 50) * 10) / 10;
    });
    setMetrics(next);
    toast('Mediciones simuladas');
  }

  async function finishSession() {
    setSaving(true);
    try {
      const payload = { session_id: session.id, patient_id: patientId };
      METRICS.forEach(m => {
        const v = metrics[m.key];
        payload[m.key] = v === '' ? null : Number(v);
      });
      await base44.entities.SessionMetrics.create(payload);
      await base44.entities.Session.update(session.id, { status: 'completada', duration_min: 45 });
      toast.success('Sesión finalizada');
      navigate(`/profesional/sesion/${session.id}`);
    } catch (e) {
      toast.error('No se pudo guardar la sesión');
    } finally {
      setSaving(false);
    }
  }

  if (!patient) return <div className="text-sm text-slate-400">Cargando…</div>;

  return (
    <div>
      <Link to={`/profesional/paciente/${patientId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a la ficha
      </Link>
      <h1 className="text-xl font-semibold text-slate-900">Nueva sesión · {patient.full_name}</h1>

      <div className="flex items-center gap-2 mt-4 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 0: Ejercicios */}
      {step === 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700"><Dumbbell className="w-4 h-4" /> Seleccioná los ejercicios de la sesión</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {exercises.map(ex => {
              const on = selected.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className={`text-left rounded-xl border p-3 transition ${on ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-slate-900">{ex.name}</span>
                    {on && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 capitalize">{ex.category} · {ex.difficulty}</div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-3">
            <div className="text-sm text-slate-500">Dispositivo:</div>
            <select value={device} onChange={e => setDevice(e.target.value)} className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white">
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(1)} disabled={selected.length === 0} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40">
              Continuar a calibración
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Calibración */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700"><Gauge className="w-4 h-4" /> Calibración inicial del dispositivo</div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            {!calibration && !calibrating && (
              <button onClick={runCalibration} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white">
                Iniciar calibración
              </button>
            )}
            {calibrating && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                Calibrando sensores…
              </div>
            )}
            {calibration && (
              <div>
                <div className="grid grid-cols-3 gap-3">
                  <Baseline label="Simetría base" value={calibration.baseline_symmetry} unit="%" />
                  <Baseline label="Estabilidad base" value={calibration.baseline_stability} unit="" />
                  <Baseline label="Carga base" value={calibration.baseline_load} unit="%" />
                </div>
                <div className="text-xs text-emerald-600 mt-3 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Calibración exitosa</div>
              </div>
            )}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(0)} className="text-sm text-slate-500">Atrás</button>
            <button onClick={startSession} disabled={!calibration} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40 inline-flex items-center gap-1.5">
              <Play className="w-4 h-4" /> Iniciar sesión
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Sesión en progreso */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-sm text-emerald-700">
            <Play className="w-4 h-4" /> Sesión en progreso · {selected.length} ejercicios seleccionados
          </div>
          <button onClick={() => setStep(3)} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white inline-flex items-center gap-1.5">
            <Square className="w-4 h-4" /> Registrar mediciones y finalizar
          </button>
        </div>
      )}

      {/* Step 3: Mediciones */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-slate-700 text-sm">Registrá las mediciones de la sesión</div>
            <button onClick={simulateMetrics} className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500" /> Simular medición
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {METRICS.map(m => (
              <div key={m.key} className="rounded-xl border border-slate-200 bg-white p-3">
                <label className="text-xs text-slate-500">{m.label} ({m.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={metrics[m.key]}
                  onChange={e => setMetrics(s => ({ ...s, [m.key]: e.target.value }))}
                  className="w-full mt-1 text-sm rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-none focus:border-slate-400"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="text-sm text-slate-500">Atrás</button>
            <button onClick={finishSession} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-40 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {saving ? 'Guardando…' : 'Finalizar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Baseline({ label, value, unit }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{Math.round(value * 10) / 10}<span className="text-xs text-slate-400 ml-1">{unit}</span></div>
    </div>
  );
}