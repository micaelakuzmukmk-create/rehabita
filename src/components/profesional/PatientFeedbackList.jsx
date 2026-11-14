import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import { UserRound } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Devoluciones que el paciente registró desde su reporte de sesión.
 * Se mantienen separadas de los comentarios del profesional.
 */
export default function PatientFeedbackList({ patientId }) {
  const [items, setItems] = useState([]);
  const [sessionNumbers, setSessionNumbers] = useState({});

  useEffect(() => { load(); }, [patientId]);

  async function load() {
    if (!patientId) return;
    const [perceptions, sessions] = await Promise.all([
      base44.entities.Perception.filter({ patient_id: patientId }, '-date', 60),
      base44.entities.Session.filter({ patient_id: patientId }, '-date', 200),
    ]);
    setItems(perceptions.filter(p => p.notes || p.pain_level != null || p.confidence_level != null));
    setSessionNumbers(Object.fromEntries(sessions.map(s => [s.id, s.session_number])));
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="eyebrow">Devoluciones del paciente</span>
      </div>

      {items.map((p) => (
        <Card key={p.id} className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip tone="cyan">
                {p.session_id && sessionNumbers[p.session_id] ? `Sesión ${sessionNumbers[p.session_id]}` : 'General'}
              </Chip>
              {p.pain_level != null && <Chip tone="neutral">Dolor {p.pain_level}/10</Chip>}
              {p.confidence_level != null && <Chip tone="neutral">Confianza {p.confidence_level}/10</Chip>}
            </div>
            <span className="text-[10px] text-muted-foreground">{format(parseISO(p.date), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          {p.notes && (
            <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{p.notes}</p>
          )}
        </Card>
      ))}
    </div>
  );
}