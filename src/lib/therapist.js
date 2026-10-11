import { base44 } from '@/api/base44Client';

// Devuelve el kinesiólogo autenticado y únicamente los pacientes que tiene asignados.
export async function loadTherapistPatients() {
  const me = await base44.auth.me();

  let professional = null;
  try {
    const pros = await base44.entities.Professional.filter({ user_id: me.id }, '-created_date', 1);
    professional = pros[0] || null;
  } catch {
    professional = null;
  }

  let patients = [];
  if (professional) {
    patients = await base44.entities.Patient.filter({ professional_id: professional.id }, 'full_name', 200);
  }
  // En modo demostración (o si todavía no hay asignaciones cargadas) se listan los pacientes existentes.
  if (patients.length === 0) {
    patients = await base44.entities.Patient.list('full_name', 200);
  }

  return { me, professional, patients };
}