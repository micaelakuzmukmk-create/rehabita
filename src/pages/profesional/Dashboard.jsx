import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ds/PageHeader';
import SectionHead from '@/components/ds/SectionHead';
import LoadingState from '@/components/ds/LoadingState';
import ClinicSummaryCard from '@/components/profesional/ClinicSummaryCard';
import FollowUpList from '@/components/profesional/FollowUpList';
import RecentSessions from '@/components/profesional/RecentSessions';
import PatientDirectory from '@/components/profesional/PatientDirectory';
import { Button } from '@/components/ui/button';

export default function ProfessionalDashboard() {
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [p, s, pl] = await Promise.all([
        base44.entities.Patient.list('-created_date', 100),
        base44.entities.Session.list('-date', 300),
        base44.entities.RehabPlan.list('-created_date', 200),
      ]);
      setPatients(p);
      setSessions(s);
      setPlans(pl);
    } catch (e) {
      toast.error('No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  }

  const lastByPatient = {};
  sessions.forEach(s => {
    if (!lastByPatient[s.patient_id]) lastByPatient[s.patient_id] = s;
  });
  const countByPatient = {};
  sessions.forEach(s => { countByPatient[s.patient_id] = (countByPatient[s.patient_id] || 0) + 1; });
  const planByPatient = {};
  plans.forEach(pl => { if (!planByPatient[pl.patient_id]) planByPatient[pl.patient_id] = pl; });
  const nameById = {};
  patients.forEach(p => { nameById[p.id] = p.full_name; });

  const activePatients = patients.filter(p => (p.status || 'activo') === 'activo');
  const sessionsToday = sessions.filter(s => s.date && isToday(parseISO(s.date))).length;
  const following = new Set(plans.filter(pl => pl.status === 'activo').map(pl => pl.patient_id)).size;

  // Los pacientes activos con más días sin sesión son los que requieren atención.
  const followUp = [...activePatients]
    .sort((a, b) => {
      const ta = lastByPatient[a.id] ? new Date(lastByPatient[a.id].date).getTime() : 0;
      const tb = lastByPatient[b.id] ? new Date(lastByPatient[b.id].date).getTime() : 0;
      return ta - tb;
    })
    .slice(0, 3)
    .map(p => ({ patient: p, sessionCount: countByPatient[p.id] || 0, lastSession: lastByPatient[p.id] }));

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="space-y-9">
      <PageHeader
        eyebrow="Área Kinesiólogo"
        title="Pacientes"
        subtitle="Seguimiento de rehabilitación de LCA"
        actions={
          <Link to="/kinesiologo/sesion/nueva">
            <Button size="lg">
              <Plus className="h-4 w-4" /> Nueva sesión
            </Button>
          </Link>
        }
      />

      {loading ? (
        <LoadingState label="Cargando pacientes…" />
      ) : (
        <>
          <ClinicSummaryCard
            title="Pacientes activos"
            value={activePatients.length}
            details={[
              { label: 'Sesiones hoy', value: sessionsToday },
              { label: 'En seguimiento', value: following },
            ]}
          />

          <section>
            <SectionHead
              title="Continuar seguimiento"
              description="Pacientes activos con más días desde su última sesión."
            />
            <FollowUpList items={followUp} />
          </section>

          <section>
            <SectionHead
              title="Actividad reciente"
              description="Últimas sesiones registradas en la plataforma."
            />
            <RecentSessions sessions={recentSessions} nameById={nameById} />
          </section>

          <PatientDirectory
            patients={patients}
            lastByPatient={lastByPatient}
            countByPatient={countByPatient}
            planByPatient={planByPatient}
          />
        </>
      )}
    </div>
  );
}