import React from 'react';
import { Cpu } from 'lucide-react';
import useDeviceStatus from '@/hooks/useDeviceStatus';

/**
 * Módulo discreto: recuerda que la plataforma está acompañando al wearable.
 * Solo aparece cuando hay una conexión activa.
 */
export default function DeviceStatusPill() {
  const device = useDeviceStatus();
  if (!device.connected) return null;

  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 sm:flex"
      title={`${device.name || 'Dispositivo REHBAITA'} · conectado`}
    >
      <Cpu className="h-3.5 w-3.5 text-brand-blue" />
      <span className="text-[11px] font-medium text-foreground">{device.name || 'Dispositivo REHBAITA'}</span>
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
        {device.active ? 'Midiendo' : 'Conectado'}
      </span>
    </div>
  );
}