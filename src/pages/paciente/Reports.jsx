import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ds/PageHeader';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import LoadingState from '@/components/ds/LoadingState';
import EmptyState from '@/components/ds/EmptyState';
import { MessageSquare, ArrowUpRight, FileText } from 'lucide-react';
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

  if (loading) return <LoadingState label="Cargando tus reportes…" />;
  if (!patient) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado.</div>;

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
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Reportes"
        subtitle="Las devoluciones de tu kinesiólogo, sesión a sesión."
      />

      {groupKeys.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Todavía no hay devoluciones"
          description="Cuando tu kinesiólogo registre un comentario de una sesión, lo vas a encontrar acá."
        />
      ) : (
        <div className="space-y-4">
          {groupKeys.map(key => {
            const s = sessionById[key];
            const items = grouped[key];
            return (
              <Card key={key} className="p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                      {s ? `Sesión ${s.session_number}` : 'Comentarios generales'}
                    </div>
                    {s && <div className="mt-0.5 text-[11px] text-muted-foreground">{format(parseISO(s.date), 'dd/MM/yyyy')}</div>}
                  </div>
                  {s && (
                    <Link
                      to={`/paciente/sesion/${s.id}`}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                    >
                      Ver sesión <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <div className="space-y-3">
                  {items.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-sm leading-relaxed text-foreground">{c.content}</p>
                        <div className="mt-1 text-[10px] text-muted-foreground">{format(parseISO(c.date), 'dd/MM/yyyy HH:mm')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}