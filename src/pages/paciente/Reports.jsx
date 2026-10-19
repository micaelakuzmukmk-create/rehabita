import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { refreshBadges } from '@/hooks/usePatientBadges';

export default function Reports() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const me = await base44.auth.me();
      let patients = [];
      try { patients = await base44.entities.Patient.filter({ user_id: me.id }, '-created_date', 5); } catch (_) {}
      if (patients.length === 0) patients = await base44.entities.Patient.list('-created_date', 1);
      const p = patients[0];
      if (!p) { setLoading(false); return; }
      setPatient(p);

      const [ss, cm] = await Promise.all([
        base44.entities.Session.filter({ patient_id: p.id }, '-date', 200),
        base44.entities.ProfessionalComment.filter({ patient_id: p.id }, '-date', 200),
      ]);
      setSessions(ss);
      setComments(cm);

      // Al abrir los reportes quedan vistos: se apaga la notificación.
      const unseen = cm.filter(c => !p.reports_seen_at || new Date(c.date) > new Date(p.reports_seen_at));
      if (unseen.length > 0) {
        await base44.entities.Patient.update(p.id, { reports_seen_at: new Date().toISOString() });
        refreshBadges();
      }
    } catch (e) {
      toast.error('No se pudieron cargar tus reportes');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Cargando…</div>;
  if (!patient) return <div className="text-sm text-slate-400">No tenés un paciente vinculado.</div>;

  const sessionById = Object.fromEntries(sessions.map(s => [s.id, s]));

  // Agrupa las devoluciones por sesión (las más recientes primero).
  const grouped = {};
  comments.forEach(c => {
    const key = c.session_id || 'general';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'general') return 1;
    if (b === 'general') return -1;
    const sa = sessionById[a];
    const sb = sessionById[b];
    if (!sa || !sb) return 0;
    return new Date(sb.date) - new Date(sa.date);
  });

  return (
    <div className="space-y-5">
      <Link to="/paciente" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-500">Las devoluciones de tu kinesiólogo, sesión a sesión.</p>
      </div>

      {groupKeys.length === 0 ? (
        <div className="text-sm text-slate-400">Todavía no tenés devoluciones de tu kinesiólogo.</div>
      ) : (
        <div className="space-y-4">
          {groupKeys.map(key => {
            const s = sessionById[key];
            const items = grouped[key];
            return (
              <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {s ? `Sesión ${s.session_number}` : 'Comentarios generales'}
                    </div>
                    {s && <div className="text-xs text-slate-500">{format(parseISO(s.date), 'dd/MM/yyyy')}</div>}
                  </div>
                  {s && (
                    <Link to={`/paciente/sesion/${s.id}`} className="text-xs text-teal-700 hover:underline whitespace-nowrap">
                      Ver sesión
                    </Link>
                  )}
                </div>
                <div className="space-y-3">
                  {items.map(c => (
                    <div key={c.id} className="flex items-start gap-2 text-sm text-slate-700">
                      <MessageSquare className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                      <div>
                        <p>{c.content}</p>
                        <div className="text-[11px] text-slate-400 mt-0.5">{format(parseISO(c.date), 'dd/MM/yyyy HH:mm')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}