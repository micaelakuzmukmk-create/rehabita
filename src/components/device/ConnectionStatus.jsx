import React from 'react';
import { Bluetooth, BluetoothConnected, Loader2, Radio, CircleSlash } from 'lucide-react';

const STYLES = {
  desconectado: {
    label: 'Desconectado',
    icon: CircleSlash,
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  conectando: {
    label: 'Conectando…',
    icon: Loader2,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  conectado: {
    label: 'Conectado',
    icon: BluetoothConnected,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export default function ConnectionStatus({ status, deviceName }) {
  const s = STYLES[status] || STYLES.desconectado;
  const Icon = s.icon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
          <Bluetooth className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500">Estado de la conexión</div>
          <div className="text-sm font-medium text-slate-900 truncate">
            {deviceName || 'Sin dispositivo'}
          </div>
        </div>
      </div>
      <span className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${s.badge} shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${status === 'conectando' ? 'animate-spin' : ''}`} />
        {s.label}
      </span>
    </div>
  );
}

export function ReceptionIndicator({ receiving, connected }) {
  if (!connected) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        Sin conexión
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 text-xs ${receiving ? 'text-emerald-600' : 'text-amber-600'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${receiving ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      {receiving ? (
        <>
          <Radio className="w-3.5 h-3.5" /> Recibiendo datos
        </>
      ) : (
        'Esperando datos'
      )}
    </div>
  );
}