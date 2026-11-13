import React from 'react';
import { Bluetooth, BluetoothConnected, Loader2, Radio, CircleSlash } from 'lucide-react';
import Chip from '@/components/ds/Chip';

const STYLES = {
  desconectado: { label: 'Desconectado', icon: CircleSlash, tone: 'neutral' },
  conectando: { label: 'Conectando…', icon: Loader2, tone: 'warning' },
  conectado: { label: 'Conectado', icon: BluetoothConnected, tone: 'success' },
};

export default function ConnectionStatus({ status, deviceName }) {
  const s = STYLES[status] || STYLES.desconectado;
  const Icon = s.icon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
          <Bluetooth className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <div className="micro-label">Estado de la conexión</div>
          <div className="truncate font-heading text-sm font-medium text-foreground">
            {deviceName || 'Sin dispositivo'}
          </div>
        </div>
      </div>
      <Chip tone={s.tone} className="shrink-0">
        <Icon className={`h-3.5 w-3.5 ${status === 'conectando' ? 'animate-spin' : ''}`} />
        {s.label}
      </Chip>
    </div>
  );
}

export function ReceptionIndicator({ receiving, connected }) {
  if (!connected) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        Sin conexión
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 text-[11px] ${receiving ? 'text-primary' : 'text-amber-700'}`}>
      <span className={`h-2 w-2 rounded-full ${receiving ? 'bg-brand-cyan animate-pulse' : 'bg-amber-500'}`} />
      {receiving ? (
        <>
          <Radio className="h-3.5 w-3.5" /> Recibiendo datos
        </>
      ) : (
        'Esperando datos'
      )}
    </div>
  );
}