import React from 'react';
import { format, parseISO } from 'date-fns';
import { Activity, Bluetooth, Clock, Cpu, User } from 'lucide-react';
import { MEASUREMENT_STATE_LABELS } from '@/lib/measurements';

const STATE_STYLES = {
  en_espera: 'bg-slate-100 text-slate-600 border-slate-200',
  midiendo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sin_datos: 'bg-amber-50 text-amber-700 border-amber-200',
  interrumpido: 'bg-rose-50 text-rose-700 border-rose-200',
};

function fmtDate(value) {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm:ss');
  } catch {
    return value;
  }
}

function Field({ icon: Icon, label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className={`text-sm font-medium text-slate-900 mt-1 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

export default function DeviceStatePanel({
  deviceName,
  connectionStatus,
  measurementState,
  patientName,
  startedAt,
  lastSampleAt,
  sampleCount,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Activity className="w-4 h-4" /> Estado de la medición
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full border ${STATE_STYLES[measurementState] || STATE_STYLES.en_espera}`}
        >
          {MEASUREMENT_STATE_LABELS[measurementState] || measurementState}
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field icon={Cpu} label="Wearable" value={deviceName || 'Rodilla_ESP32'} />
        <Field
          icon={Bluetooth}
          label="Estado Bluetooth"
          value={connectionStatus === 'conectado' ? 'Conectado' : connectionStatus === 'conectando' ? 'Conectando…' : 'Desconectado'}
        />
        <Field icon={User} label="Paciente seleccionado" value={patientName || 'Sin seleccionar'} />
        <Field icon={Clock} label="Inicio de la medición" value={fmtDate(startedAt)} />
        <Field
          icon={Clock}
          label="Última muestra recibida"
          value={lastSampleAt ? format(new Date(lastSampleAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
        />
        <Field icon={Activity} label="Muestras recibidas" value={String(sampleCount ?? 0)} />
      </dl>
    </div>
  );
}