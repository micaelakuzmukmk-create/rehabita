import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import Chip from '@/components/ds/Chip';
import EmptyState from '@/components/ds/EmptyState';
import SectionHead from '@/components/ds/SectionHead';
import { PHASE_LABELS } from '@/lib/rehbaita';
import { format, parseISO } from 'date-fns';

const STATUS_TONE = { activo: 'success', pausa: 'warning', alta: 'primary' };
const STATUS_LABEL = { activo: 'Activo', pausa: 'Pausa', alta: 'Finalizado' };

/**
 * Nivel 4 de jerarquía: el directorio completo, visible cuando hace falta.
 */
export default function PatientDirectory({ patients = [], lastByPatient = {}, countByPatient = {}, planByPatient = {} }) {
  const [q, setQ] = useState('');
  const filtered = patients.filter((p) => (p.full_name || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <section>
      <SectionHead
        title="Todos los pacientes"
        description={`${patients.length} ${patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'}`}
      />

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar paciente por nombre"
          className="input pl-10"
        />
      </div>

      {filtered.length === 0 ? (
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
            {filtered.map((p) => {
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
                      {p.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
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
    </section>
  );
}