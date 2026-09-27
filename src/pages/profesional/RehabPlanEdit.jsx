import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RehabPlanEdit() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', start_date: '', target_end_date: '', goals: '',
    current_phase: 'proteccion', status: 'activo',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [patientId]);

  async function load() {
    try {
      const [p, plans] = await Promise.all([
        base44.entities.Patient.get(patientId),
        base44.entities.RehabPlan.filter({ patient_id: patientId }, '-created_date', 5),
      ]);
      setPatient(p);
      const pl = plans[0];
      if (pl) {
        setPlan(pl);
        setForm({
          title: pl.title || '', description: pl.description || '',
          start_date: (pl.start_date || '').slice(0, 10), target_end_date: (pl.target_end_date || '').slice(0, 10),
          goals: pl.goals || '', current_phase: pl.current_phase || 'proteccion', status: pl.status || 'activo',
        });
      }
    } catch (e) {
      toast.error('No se pudo cargar el plan');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      if (plan) {
        await base44.entities.RehabPlan.update(plan.id, form);
      } else {
        await base44.entities.RehabPlan.create({ ...form, patient_id: patientId });
      }
      toast.success('Plan guardado');
      navigate(`/profesional/paciente/${patientId}`);
    } catch (e) {
      toast.error('No se pudo guardar el plan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return null;

  return (
    <div>
      <Link to={`/profesional/paciente/${patientId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a la ficha
      </Link>
      <h1 className="text-xl font-semibold text-slate-900 mb-5">Plan de rehabilitación · {patient.full_name}</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 max-w-2xl">
        <Field label="Título">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" />
        </Field>
        <Field label="Descripción">
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Inicio">
            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="input" />
          </Field>
          <Field label="Objetivo de fin">
            <input type="date" value={form.target_end_date} onChange={e => setForm({ ...form, target_end_date: e.target.value })} className="input" />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Fase actual">
            <select value={form.current_phase} onChange={e => setForm({ ...form, current_phase: e.target.value })} className="input">
              {Object.entries(PHASE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input">
              <option value="activo">Activo</option>
              <option value="pausa">Pausa</option>
              <option value="completado">Completado</option>
            </select>
          </Field>
        </div>
        <Field label="Objetivos">
          <textarea value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} rows={3} className="input resize-none" />
        </Field>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40">
          <Save className="w-4 h-4" /> {saving ? 'Guardando…' : 'Guardar plan'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}