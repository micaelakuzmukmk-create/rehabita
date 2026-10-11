import React, { useEffect, useState } from 'react';
import useBleDevice, {
  isWebBluetoothSupported,
  DEVICE_NAME,
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
} from '@/hooks/useBleDevice';
import ConnectionStatus, { ReceptionIndicator } from '@/components/device/ConnectionStatus';
import LastMessageCard from '@/components/device/LastMessageCard';
import MessageLog from '@/components/device/MessageLog';
import { AlertTriangle, Bluetooth, BluetoothOff, MessageSquareDot, Smartphone } from 'lucide-react';

export default function DeviceConnection() {
  const {
    status,
    error,
    deviceName,
    messages,
    receivedCount,
    lastReceivedAt,
    connect,
    disconnect,
    clearMessages,
  } = useBleDevice();

  const supported = isWebBluetoothSupported();
  const connected = status === 'conectado';
  const connecting = status === 'conectando';

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const receiving = connected && !!lastReceivedAt && now - lastReceivedAt < 5000;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Bluetooth className="w-5 h-5 text-slate-500" />
        <h1 className="text-xl font-semibold text-slate-900">Conexión con dispositivo</h1>
      </div>
      <p className="text-sm text-slate-500">
        Vinculá el wearable <span className="font-medium text-slate-700">{DEVICE_NAME}</span> por Bluetooth Low Energy
        (BLE) desde Google Chrome en Android y visualizá los datos en tiempo real.
      </p>

      {!supported && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <div className="font-medium">Este navegador no admite Web Bluetooth</div>
            <p className="mt-1">
              La conexión BLE requiere la Web Bluetooth API. Abrí la aplicación con{' '}
              <span className="font-medium">Google Chrome en Android</span> (versión 56 o superior) sobre una conexión
              segura (HTTPS) y volvé a intentarlo. En computadoras de escritorio, Web Bluetooth solo está disponible en
              Chrome para Windows, macOS y Linux.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <ConnectionStatus status={status} deviceName={deviceName} />

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={connect}
            disabled={!supported || connecting || connected}
            className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
          >
            {connecting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Bluetooth className="w-4 h-4" />
            )}
            Conectar Wereable
          </button>
          <button
            onClick={disconnect}
            disabled={!connected}
            className="inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <BluetoothOff className="w-4 h-4" /> Desconectar
          </button>
        </div>

        {error && (
          <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500 mb-2">Recepción de datos</div>
            <ReceptionIndicator receiving={receiving} connected={connected} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500 mb-2">Mensajes recibidos</div>
            <div className="flex items-center gap-2">
              <MessageSquareDot className="w-4 h-4 text-slate-400" />
              <span className="text-2xl font-semibold text-slate-900">{receivedCount}</span>
            </div>
          </div>
        </div>

        <LastMessageCard message={messages[0]} />

        <MessageLog messages={messages} onClear={clearMessages} />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
            <Smartphone className="w-3.5 h-3.5" /> Parámetros de conexión
          </div>
          <dl className="space-y-1 text-[11px] font-mono text-slate-500 break-all">
            <div>Dispositivo: {DEVICE_NAME}</div>
            <div>Service UUID: {SERVICE_UUID}</div>
            <div>Characteristic UUID: {CHARACTERISTIC_UUID}</div>
          </dl>
        </div>
      </div>
    </div>
  );
}