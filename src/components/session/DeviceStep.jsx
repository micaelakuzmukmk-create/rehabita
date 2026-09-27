import React from 'react';
import { Check } from 'lucide-react';
import Nav from './Nav';

const STATUS = {
  disponible: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700' },
  en_uso: { label: 'En uso', cls: 'bg-amber-100 text-amber-700' },
  calibrando: { label: 'Calibrando', cls: 'bg-blue-100 text-blue-700' },
  mantenimiento: { label: 'Mantenimiento', cls: 'bg-rose-100 text-rose-700' },
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
      <div className="text-sm text-slate-700">Seleccioná el dispositivo y verificá su estado</div>
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
              className={`w-full text-left rounded-xl border p-4 transition ${on ? 'border-slate-900 bg-slate-50' : ok ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900">{d.name}</span>
                  <div className="text-xs text-slate-500 mt-0.5">{TYPE_LABEL[d.type] || d.type} · {d.serial_number || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  {on && <Check className="w-4 h-4 text-emerald-600" />}
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