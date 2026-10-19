import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadCurrentPatient } from '@/lib/currentPatient';

// Avisa a las notificaciones de la navegación que deben recalcularse.
export function refreshBadges() {
  window.dispatchEvent(new Event('rehabita:badges'));
}

// Contadores de la navegación del paciente: Amigos (solicitudes + mensajes sin leer)
// y Reportes (devoluciones nuevas del kinesiólogo).
export function usePatientBadges(enabled) {
  const [counts, setCounts] = useState({ amigos: 0, reportes: 0 });
  const patientRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setCounts({ amigos: 0, reportes: 0 });
      return;
    }

    let active = true;

    async function load() {
      try {
        const patient = patientRef.current || (await loadCurrentPatient());
        patientRef.current = patient;
        if (!patient || !active) return;

        const reportsQuery = patient.reports_seen_at
          ? { patient_id: patient.id, created_date: { $gt: patient.reports_seen_at } }
          : { patient_id: patient.id };

        const [requests, unread, comments] = await Promise.all([
          base44.entities.Friendship.count({ addressee_patient_id: patient.id, status: 'pendiente' }),
          base44.entities.FriendMessage.count({ recipient_patient_id: patient.id, read: false }),
          base44.entities.ProfessionalComment.count(reportsQuery),
        ]);

        if (active) setCounts({ amigos: requests + unread, reportes: comments });
      } catch {
        // Si no se pueden calcular, la navegación queda sin notificaciones.
      }
    }

    const onChange = () => {
      patientRef.current = null;
      load();
    };

    load();
    window.addEventListener('rehabita:badges', onChange);
    const unsubscribers = [
      base44.entities.Friendship.subscribe(onChange),
      base44.entities.FriendMessage.subscribe(onChange),
      base44.entities.ProfessionalComment.subscribe(onChange),
    ];

    return () => {
      active = false;
      window.removeEventListener('rehabita:badges', onChange);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [enabled]);

  return counts;
}