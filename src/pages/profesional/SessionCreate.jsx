import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Stepper from '@/components/session/Stepper';
import PatientStep from '@/components/session/PatientStep';
import PhaseStep from '@/components/session/PhaseStep';
import ExerciseStep from '@/components/session/ExerciseStep';
import DeviceStep from '@/components/session/DeviceStep';
import CalibrationStep from '@/components/session/CalibrationStep';
import StartStep from '@/components/session/StartStep';
import LiveMeasureStep from '@/components/session/LiveMeasureStep';
import FinalizarStep from '@/components/session/FinalizarStep';
import ResultsStep from '@/components/session/ResultsStep';
import CommentStep from '@/components/session/CommentStep';

const STEP_LABELS = ['Paciente', 'Etapa', 'Ejercicio', 'Dispositivo', 'Calibración', 'Inicio', 'Medición', 'Finalizar', 'Resultados', 'Guardar'];
const REST_KEYS = ['reaction_time', 'movement_control', 'strength', 'pain_perceived', 'confidence_perceived'];
const LIVE_KEYS = ['symmetry', 'load_distribution', 'stability', 'knee_flexion_angle'];

export default function SessionCreate() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [prevMetrics, setPrevMetrics] = useState(null);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('proteccion');
  const [selected, setSelected] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [calibration, setCalibration] = useState(null);
  const [session, setSession] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [duration, setDuration] = useState(0);
  const [resultMetrics, setResultMetrics] = useState(() => Object.fromEntries(REST_KEYS.map(k => [k, ''])));
  const [comment, setComment] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

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
      const avail = dv.find(d => d.status === 'disponible');
      if (avail) setDeviceId(avail.id);
      else if (dv[0]) setDeviceId(dv[0].id);
      const plans = await base44.entities.RehabPlan.filter({ patient_id: patientId, status: 'activo' }, '-created_date', 5);
      if (plans[0]) { setPlan(plans[0]); setPhase(plans[0].current_phase || 'proteccion'); }
      const prev = ss.find(s => s.status === 'completada');
      if (prev) {
        const pm = await base44.entities.SessionMetrics.filter({ session_id: prev.id });
        if (pm[0]) setPrevMetrics(pm[0]);
      }
    } catch (e) {
      toast.error('No se pudo cargar la información');
    }
  }

  function toggleExercise(id) {
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  }

  async function startSession() {
    setStarting(true);
    try {
      const created = await base44.entities.Session.create({
        patient_id: patientId,
        date: new Date().toISOString(),
        session_number: sessionsCount + 1,
        status: 'en_progreso',
        exercises: selected,
        device_id: deviceId,
        phase,
        rehab_plan_id: plan?.id,
      });
      const cal = await base44.entities.Calibration.create({
        device_id: deviceId,
        session_id: created.id,
        date: new Date().toISOString(),
        baseline_symmetry: calibration.baseline_symmetry,
        baseline_stability: calibration.baseline_stability,
        baseline_load: calibration.baseline_load,
        status: 'exitosa',
      });
      await base44.entities.Session.update(created.id, { calibration_id: cal.id });
      try { await base44.entities.Device.update(deviceId, { status: 'en_uso' }); } catch {}
      setSession({ ...created, calibration_id: cal.id });
      setStep(6);
      toast.success('Sesión iniciada');
    } catch (e) {
      toast.error('No se pudo iniciar la sesión');
    } finally {
      setStarting(false);
    }
  }

  function handleLiveFinal(vals, secs) {
    setLiveMetrics(vals);
    setDuration(secs);
    setStep(7);
  }

  async function saveSession() {
    setSaving(true);
    try {
      const payload = { session_id: session.id, patient_id: patientId };
      LIVE_KEYS.forEach(k => { const v = liveMetrics[k]; payload[k] = v == null ? null : Number(v); });
      REST_KEYS.forEach(k => { const v = resultMetrics[k]; payload[k] = v === '' || v == null ? null : Number(v); });
      await base44.entities.SessionMetrics.create(payload);
      if (comment.trim()) {
        await base44.entities.ProfessionalComment.create({
          patient_id: patientId,
          session_id: session.id,
          professional_id: patient?.professional_id || plan?.professional_id || '',
          content: comment.trim(),
          date: new Date().toISOString(),
        });
      }
      if (plan && phase !== plan.current_phase) {
        try { await base44.entities.RehabPlan.update(plan.id, { current_phase: phase }); } catch {}
      }
      await base44.entities.Session.update(session.id, {
        status: 'completada',
        duration_min: Math.max(1, Math.round(duration / 60)),
        notes: notes || undefined,
      });
      try { await base44.entities.Device.update(deviceId, { status: 'disponible' }); } catch {}
      toast.success('Sesión guardada');
      navigate(`/profesional/sesion/${session.id}`);
    } catch (e) {
      toast.error('No se pudo guardar la sesión');
    } finally {
      setSaving(false);
    }
  }

  if (!patient) return <div className="text-sm text-slate-400">Cargando…</div>;

  const selectedNames = exercises.filter(e => selected.includes(e.id)).map(e => e.name);
  const device = devices.find(d => d.id === deviceId);

  let content;
  switch (step) {
    case 0: content = <PatientStep patient={patient} plan={plan} sessionsCount={sessionsCount} onBack={() => navigate(`/profesional/paciente/${patientId}`)} onNext={() => setStep(1)} />; break;
    case 1: content = <PhaseStep phase={phase} setPhase={setPhase} plan={plan} onBack={() => setStep(0)} onNext={() => setStep(2)} />; break;
    case 2: content = <ExerciseStep exercises={exercises} selected={selected} toggle={toggleExercise} phase={phase} onBack={() => setStep(1)} onNext={() => setStep(3)} />; break;
    case 3: content = <DeviceStep devices={devices} deviceId={deviceId} setDeviceId={setDeviceId} onBack={() => setStep(2)} onNext={() => setStep(4)} />; break;
    case 4: content = <CalibrationStep calibration={calibration} setCalibration={setCalibration} onBack={() => setStep(3)} onNext={() => setStep(5)} />; break;
    case 5: content = <StartStep patient={patient} phase={phase} exerciseNames={selectedNames} device={device} calibration={calibration} starting={starting} onStart={startSession} onBack={() => setStep(4)} />; break;
    case 6: content = <LiveMeasureStep calibration={calibration} exerciseNames={selectedNames} onFinal={handleLiveFinal} onBack={() => setStep(5)} />; break;
    case 7: content = <FinalizarStep liveMetrics={liveMetrics} durationSec={duration} onBack={() => setStep(6)} onNext={() => setStep(8)} />; break;
    case 8: content = <ResultsStep liveMetrics={liveMetrics} prevMetrics={prevMetrics} resultMetrics={resultMetrics} setResultMetrics={setResultMetrics} onBack={() => setStep(7)} onNext={() => setStep(9)} />; break;
    case 9: content = <CommentStep comment={comment} setComment={setComment} notes={notes} setNotes={setNotes} saving={saving} onSave={saveSession} onBack={() => setStep(8)} />; break;
    default: content = null;
  }

  return (
    <div>
      <Link to={`/profesional/paciente/${patientId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a la ficha
      </Link>
      <h1 className="text-xl font-semibold text-slate-900">Nueva sesión · {patient.full_name}</h1>
      <Stepper labels={STEP_LABELS} current={step} />
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {content}
      </div>
    </div>
  );
}