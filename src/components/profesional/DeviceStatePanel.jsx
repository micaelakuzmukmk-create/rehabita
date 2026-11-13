import React from 'react';
import { format, parseISO } from 'date-fns';
import { Activity, Bluetooth, Clock, Cpu, User } from 'lucide-react';
import { MEASUREMENT_STATE_LABELS } from '@/lib/measurements';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';

const STATE_TONES = {
  en_espera: 'neutral',
  midiendo: 'success',
  sin_datos: 'warning',
  interrumpido: 'danger',
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
    <div className="rounded-xl bg-muted p-3">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</div>
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
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="section-title flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-primary" /> Estado de la medición
        </h3>
        <Chip tone={STATE_TONES[measurementState] || 'neutral'} dot>
          {MEASUREMENT_STATE_LABELS[measurementState] || measurementState}
        </Chip>
      </div>

      <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
    </Card>
  );
}