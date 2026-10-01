import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import toast from 'react-hot-toast';

// Tiempo transcurrido desde una fecha, en lenguaje natural.
function elapsed(dateStr) {
  if (!dateStr) return null;
  const start = parseISO(dateStr);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 1) {
    const days = Math.max(0, Math.round((now - start) / 86400000));
    return `${days} día${days === 1 ? '' : 's'}`;
  }
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0) return `${y} año${y === 1 ? '' : 's'}${m ? ` y ${m} mes${m === 1 ? '' : 'es'}` : ''}`;
  return `${m} mes${m === 1 ? '' : 'es'}`;
}

const GENDER_LABELS = { masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro' };

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
      let patients = [];
      try { patients = await base44.entities.Patient.filter({ user_id: me.id }, '-created_date', 5); } catch (_) {}
      if (patients.length === 0) patients = await base44.entities.Patient.list('-created_date', 1);
      const p = patients[0];
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

  const fmtDate = (d) => (d ? format(parseISO(d), 'dd/MM/yyyy') : null);
  const injurySide = patient.injury_side ? `rodilla ${patient.injury_side}` : null;

  const rows = [
    { label: 'Nombre y apellido', value: patient.full_name },
    { label: 'Edad', value: patient.birth_date ? `${differenceInYears(new Date(), parseISO(patient.birth_date))} años` : null },
    { label: 'Género', value: GENDER_LABELS[patient.gender] || patient.gender },
    { label: 'Tipo de lesión', value: [patient.injury_type, injurySide].filter(Boolean).join(' · ') },
    { label: 'Fecha de la lesión', value: fmtDate(patient.injury_date) },
    { label: 'Tipo de operación', value: patient.surgery_type },
    { label: 'Fecha de la operación', value: fmtDate(patient.surgery_date) },
    { label: 'Fecha de hoy', value: fmtDate(new Date()) },
    { label: 'Tiempo de rehabilitación', value: elapsed(rehabStart) },
    { label: 'Tiempo desde la lesión', value: elapsed(patient.injury_date) },
    { label: 'Teléfono', value: patient.phone },
    { label: 'Mail', value: patient.email || userEmail },
    { label: 'Dirección', value: patient.address },
  ];

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-semibold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 text-lg truncate">{patient.full_name}</div>
          <div className="text-sm text-slate-500">
            Rodilla {patient.injury_side}
            {patient.injury_date ? ` · lesión ${format(parseISO(patient.injury_date), 'dd/MM/yyyy')}` : ''}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
        {rows.map(r => (
          <div key={r.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <span className="text-sm text-slate-500">{r.label}</span>
            <span className="text-sm text-slate-900 font-medium text-right">{r.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}