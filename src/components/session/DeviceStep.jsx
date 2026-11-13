import React from 'react';
import { Check } from 'lucide-react';
import Nav from './Nav';
import Chip from '@/components/ds/Chip';

const STATUS = {
  disponible: { label: 'Disponible', tone: 'success' },
  en_uso: { label: 'En uso', tone: 'warning' },
  calibrando: { label: 'Calibrando', tone: 'cyan' },
  mantenimiento: { label: 'Mantenimiento', tone: 'danger' },
};

const TYPE_LABEL = {
  sensor_inercial: 'Sensor inercial',
  plataforma_fuerza: 'Plataforma de fuerzas',
  goniometro: 'Goniómetro',
  electromiografo: 'Electromiógrafo',
};

export default function DeviceStep({ devices, deviceId, setDeviceId, onBack, onNext }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-foreground">Seleccioná el dispositivo y verificá su estado</div>
      <div className="space-y-2">
        {devices.map(d => {
          const on = deviceId === d.id;
          const ok = d.status === 'disponible';
          const st = STATUS[d.status] || STATUS.disponible;
          return (
            <button
              key={d.id}
              disabled={!ok}
              onClick={() => setDeviceId(d.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                on
                  ? 'border-brand-lavender bg-brand-soft'
                  : ok
                    ? 'border-border bg-card hover:border-slate-300'
                    : 'border-border bg-muted opacity-70 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className={`text-sm font-medium ${on ? 'text-primary' : 'text-foreground'}`}>{d.name}</span>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {TYPE_LABEL[d.type] || d.type} · {d.serial_number || '—'}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Chip tone={st.tone}>{st.label}</Chip>
                  {on && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Nav onBack={onBack} onNext={onNext} nextDisabled={!deviceId} />
    </div>
  );
}