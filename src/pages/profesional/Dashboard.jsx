import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfessionalDashboard() {
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [p, s] = await Promise.all([
        base44.entities.Patient.list('-created_date', 100),
        base44.entities.Session.list('-date', 300),
      ]);
      setPatients(p);
      setSessions(s);
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

  const filtered = patients.filter(p => p.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pacientes</h1>
          <p className="text-sm text-slate-500">Seguimiento de rehabilitación de LCA</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar paciente por nombre"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400 py-10 text-center">No hay pacientes</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => {
            const last = lastByPatient[p.id];
            const count = countByPatient[p.id] || 0;
            return (
              <Link
                key={p.id}
                to={`/kinesiologo/paciente/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                    {p.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{p.full_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Rodilla {p.injury_side} · {count} sesión{count !== 1 ? 'es' : ''}
                      {last && ` · última ${format(parseISO(last.date), 'dd/MM/yyyy')}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'activo' ? 'bg-emerald-50 text-emerald-700' : p.status === 'pausa' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}