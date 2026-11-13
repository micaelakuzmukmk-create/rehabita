import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PHASE_LABELS } from '@/lib/rehbaita';
import PageHeader from '@/components/ds/PageHeader';
import Card from '@/components/ds/Card';
import Field from '@/components/ds/Field';
import LoadingState from '@/components/ds/LoadingState';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
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
      navigate(`/kinesiologo/paciente/${patientId}`);
    } catch (e) {
      toast.error('No se pudo guardar el plan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Cargando plan…" />;
  if (!patient) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: `/kinesiologo/paciente/${patientId}`, label: 'Volver a la ficha' }}
        eyebrow="Plan de rehabilitación"
        title={patient.full_name}
        subtitle="Definí objetivos, etapa y duración del plan."
      />

      <Card className="max-w-2xl p-5 sm:p-6">
        <div className="space-y-5">
          <Field label="Título">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" />
          </Field>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inicio">
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="input" />
            </Field>
            <Field label="Objetivo de fin">
              <input type="date" value={form.target_end_date} onChange={e => setForm({ ...form, target_end_date: e.target.value })} className="input" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="border-t border-border pt-4">
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar plan'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}