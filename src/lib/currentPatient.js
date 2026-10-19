import { base44 } from '@/api/base44Client';

// Devuelve el paciente vinculado al usuario autenticado.
// En modo demostración (sin vinculación cargada) se toma el primer paciente existente.
export async function loadCurrentPatient() {
  const me = await base44.auth.me();

  let patients = [];
  try {
    patients = await base44.entities.Patient.filter({ user_id: me.id }, '-created_date', 5);
  } catch {
    patients = [];
  }
  if (patients.length === 0) patients = await base44.entities.Patient.list('-created_date', 1);

  return patients[0] || null;
}