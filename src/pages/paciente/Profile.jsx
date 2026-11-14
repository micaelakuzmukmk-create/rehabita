import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ds/PageHeader';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import { format, parseISO, differenceInYears } from 'date-fns';
import toast from 'react-hot-toast';
import { loadCurrentPatient } from '@/lib/currentPatient';
import { elapsedSince } from '@/lib/format';
import FigureGenderToggle from '@/components/paciente/FigureGenderToggle';
import useFigureGender from '@/hooks/useFigureGender';

const GENDER_LABELS = { masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro' };
const DEFAULT_INJURY = 'Ligamento cruzado anterior (LCA)';

export default function Profile() {
  const [patient, setPatient] = useState(null);
  const [rehabStart, setRehabStart] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { gender, setGender } = useFigureGender();

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

  if (loading) return <LoadingState label="Cargando tu perfil…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado.</div>;

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

  const DataList = ({ rows }) => (
    <dl className="divide-y divide-border">
      {rows.map(r => (
        <div key={r.label} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <dt className="text-[13px] text-muted-foreground">{r.label}</dt>
          <dd className="text-right text-[13px] font-medium text-foreground">{r.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Mi perfil"
        subtitle="Tus datos personales y el detalle de tu rehabilitación."
      />

      <Card className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-brand-soft blur-3xl" />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary font-heading text-2xl font-semibold text-primary">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="eyebrow">Paciente</div>
            <h2 className="mt-1 truncate font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              {patient.full_name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip tone="primary" dot>Rodilla {knee ? knee.toLowerCase() : '—'}</Chip>
              <Chip tone="neutral">{patient.injury_type || DEFAULT_INJURY}</Chip>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="section-title">Tus datos</h2>
          <div className="mt-4">
            <DataList rows={mainRows} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="section-title">Más datos</h2>
          <div className="mt-4">
            <DataList rows={extraRows} />
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="section-title">Preferencia de visualización corporal</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Elegí con qué silueta querés ver las animaciones de tus ejercicios.
            </p>
          </div>
          <FigureGenderToggle gender={gender} onChange={setGender} />
        </div>
      </Card>
    </div>
  );
}