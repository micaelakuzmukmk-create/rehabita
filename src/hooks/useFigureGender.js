import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadCurrentPatient } from '@/lib/currentPatient';

/**
 * Preferencia de representación corporal de las animaciones (mujer / hombre).
 *
 * Se guarda en el paciente (figure_gender) para que se mantenga entre sesiones
 * y se refleja al instante en todas las animaciones abiertas.
 */
const STORAGE_KEY = 'rehabita:figure-gender';
const listeners = new Set();

const readStored = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'mujer' || value === 'hombre' ? value : null;
  } catch {
    return null;
  }
};

const store = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* preferencia solo en memoria */
  }
};

let current = readStored() || 'hombre';
let patientId = null;
let requested = false;

const publish = () => listeners.forEach((fn) => fn(current));

const genderFromPatient = (patient) => {
  if (patient?.figure_gender === 'mujer' || patient?.figure_gender === 'hombre') return patient.figure_gender;
  if (patient?.gender === 'femenino') return 'mujer';
  if (patient?.gender === 'masculino') return 'hombre';
  return null;
};

export default function useFigureGender() {
  const [gender, setGender] = useState(current);

  useEffect(() => {
    listeners.add(setGender);

    if (!requested) {
      requested = true;
      loadCurrentPatient()
        .then((patient) => {
          if (!patient) return;
          patientId = patient.id;
          const saved = genderFromPatient(patient);
          if (saved && saved !== current) {
            current = saved;
            store(saved);
            publish();
          }
        })
        .catch(() => {});
    }

    return () => {
      listeners.delete(setGender);
    };
  }, []);

  const change = useCallback((value) => {
    current = value;
    store(value);
    publish();
    if (patientId) {
      base44.entities.Patient.update(patientId, { figure_gender: value }).catch(() => {});
    }
  }, []);

  return { gender, setGender: change };
}