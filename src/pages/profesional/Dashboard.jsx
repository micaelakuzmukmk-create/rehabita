import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, ChevronRight, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ds/PageHeader';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { Button } from '@/components/ui/button';

const STATUS_TONE = { activo: 'success', pausa: 'warning', alta: 'primary' };
const STATUS_LABEL = { activo: 'Activo', pausa: 'Pausa', alta: 'Finalizado' };

export default function ProfessionalDashboard() {
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

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

  const filtered = patients.filter(p => p.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Área Kinesiólogo"
        title="Pacientes"
        subtitle="Seguimiento de rehabilitación de LCA"
        actions={
          <Link to="/kinesiologo/sesion/nueva">
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" /> Nueva sesión
            </Button>
          </Link>
        }
      />

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar paciente por nombre"
          className="input pl-10"
        />
      </div>

      {loading ? (
        <LoadingState label="Cargando pacientes…" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No hay pacientes" description="No encontramos pacientes con ese nombre." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-surface">
          <div className="hidden items-center gap-4 border-b border-border px-5 py-2.5 md:flex">
            <span className="eyebrow flex-1">Paciente</span>
            <span className="eyebrow w-40">Etapa</span>
            <span className="eyebrow w-32">Sesiones</span>
            <span className="eyebrow w-28">Última sesión</span>
            <span className="eyebrow w-24 text-right">Estado</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map(p => {
              const last = lastByPatient[p.id];
              const count = countByPatient[p.id] || 0;
              const plan = planByPatient[p.id];
              return (
                <Link
                  key={p.id}
                  to={`/kinesiologo/paciente/${p.id}`}
                  className="group flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-muted sm:px-5 md:flex-row md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-[13px] font-semibold text-primary">
                      {p.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-heading text-[15px] font-semibold tracking-tight text-foreground">
                        {p.full_name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Rodilla {p.injury_side}
                        {p.injury_type ? ` · ${p.injury_type}` : ' · Rehabilitación LCA'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 md:contents">
                    <div className="text-[11px] text-muted-foreground md:w-40">
                      <span className="md:hidden">Etapa: </span>
                      <span className="text-foreground">{PHASE_LABELS[plan?.current_phase] || '—'}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground md:w-32">
                      <span className="font-medium text-foreground tabular-nums">{count}</span> sesión{count !== 1 ? 'es' : ''}
                    </div>
                    <div className="text-[11px] text-muted-foreground md:w-28">
                      {last ? format(parseISO(last.date), 'dd/MM/yyyy') : '—'}
                    </div>
                    <div className="md:w-24 md:text-right">
                      <Chip tone={STATUS_TONE[p.status] || 'neutral'} dot>{STATUS_LABEL[p.status] || p.status}</Chip>
                    </div>
                  </div>

                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-primary md:block" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}