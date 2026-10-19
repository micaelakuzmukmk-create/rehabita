import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import toast from 'react-hot-toast';
import { loadCurrentPatient } from '@/lib/currentPatient';
import { elapsedSince } from '@/lib/format';

const GENDER_LABELS = { masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro' };
const DEFAULT_INJURY = 'Ligamento cruzado anterior (LCA)';

export default function Profile() {
  const [patient, setPatient] = useState(null);
  const [rehabStart, setRehabStart] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const me = await base44.auth.me();
      setUserEmail(me.email);

      const p = await loadCurrentPatient();
      if (!p) { setLoading(false); return; }
      setPatient(p);

      // Tiempo de rehabilitación: desde el inicio del plan o la primera sesión.
      const [plans, ss] = await Promise.all([
        base44.entities.RehabPlan.filter({ patient_id: p.id }, '-created_date', 5),
        base44.entities.Session.filter({ patient_id: p.id }, 'date', 100),
      ]);
      const planStart = plans.map(x => x.start_date).filter(Boolean).sort()[0];
      const sessionStart = ss.map(x => x.date).filter(Boolean).sort()[0];
      setRehabStart(p.rehab_start_date || planStart || sessionStart || null);
    } catch (e) {
      toast.error('No se pudieron cargar tus datos');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado.</div>;

  const initial = (patient.full_name || 'P').charAt(0).toUpperCase();
  const fmtDate = (d) => (d ? format(d instanceof Date ? d : parseISO(d), 'dd/MM/yyyy') : null);
  const knee = patient.injury_side
    ? patient.injury_side.charAt(0).toUpperCase() + patient.injury_side.slice(1)
    : null;

  const mainRows = [
    { label: 'Edad', value: patient.birth_date ? `${differenceInYears(new Date(), parseISO(patient.birth_date))} años` : null },
    { label: 'Teléfono', value: patient.phone },
    { label: 'Dirección', value: patient.address },
    { label: 'Tipo de lesión', value: patient.injury_type || DEFAULT_INJURY },
    { label: 'Rodilla afectada', value: knee },
  ];

  const extraRows = [
    { label: 'Género', value: GENDER_LABELS[patient.gender] || patient.gender },
    { label: 'Fecha de la lesión', value: fmtDate(patient.injury_date) },
    { label: 'Tipo de operación', value: patient.surgery_type },
    { label: 'Fecha de la operación', value: fmtDate(patient.surgery_date) },
    { label: 'Tiempo de rehabilitación', value: elapsedSince(rehabStart) },
    { label: 'Tiempo desde la lesión', value: elapsedSince(patient.injury_date) },
    { label: 'Mail', value: patient.email || userEmail },
    { label: 'Fecha de hoy', value: fmtDate(new Date()) },
  ];

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-semibold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 truncate">
            {patient.full_name}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {[knee ? `Rodilla ${knee.toLowerCase()}` : null, patient.injury_type || DEFAULT_INJURY].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Tus datos</div>
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {mainRows.map(r => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
              <span className="text-sm text-slate-500">{r.label}</span>
              <span className="text-sm text-slate-900 font-medium text-right">{r.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Más datos</div>
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {extraRows.map(r => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
              <span className="text-sm text-slate-500">{r.label}</span>
              <span className="text-sm text-slate-900 font-medium text-right">{r.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}