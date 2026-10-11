import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export const DEVICE_NAME = 'Rodilla_ESP32';
export const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
export const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef';

const MAX_MESSAGES = 50;

export const isWebBluetoothSupported = () =>
  typeof navigator !== 'undefined' && typeof navigator.bluetooth !== 'undefined';

function describeError(err) {
  switch (err?.name) {
    case 'NotFoundError':
      return 'No se seleccionó ningún dispositivo.';
    case 'SecurityError':
      return 'Permiso denegado. Verificá que la página se sirva por HTTPS y que hayas aceptado el permiso de Bluetooth.';
    case 'NotSupportedError':
      return 'El dispositivo no expone el servicio BLE esperado.';
    case 'NetworkError':
      return 'Se perdió la conexión con el dispositivo.';
    case 'InvalidStateError':
      return 'El adaptador Bluetooth no está disponible en este momento.';
    default:
      return err?.message ? `Error: ${err.message}` : 'Ocurrió un error inesperado.';
  }
}

function decodeValue(value) {
  const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
  let text = '';
  try {
    text = new TextDecoder().decode(bytes);
  } catch {
    text = '';
  }
  const clean = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  return { text: clean, hex };
}

export default function useBleDevice() {
  const [status, setStatus] = useState('desconectado');
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [lastReceivedAt, setLastReceivedAt] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);

  const handleValue = useCallback((event) => {
    const { text, hex } = decodeValue(event.target.value);
    setMessages((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          text,
          hex,
          time: new Date(),
        },
        ...prev,
      ].slice(0, MAX_MESSAGES)
    );
    setReceivedCount((c) => c + 1);
    setLastReceivedAt(Date.now());
  }, []);

  const handleDisconnected = useCallback(() => {
    characteristicRef.current = null;
    deviceRef.current = null;
    setStatus('desconectado');
    setDeviceName(null);
    setError('El dispositivo se desconectó.');
  }, []);

  const cleanup = useCallback(async () => {
    const characteristic = characteristicRef.current;
    if (characteristic) {
      try {
        characteristic.removeEventListener('characteristicvaluechanged', handleValue);
      } catch {
        /* noop */
      }
      try {
        await characteristic.stopNotifications();
      } catch {
        /* noop */
      }
    }
    const device = deviceRef.current;
    if (device) {
      try {
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
      } catch {
        /* noop */
      }
      try {
        if (device.gatt?.connected) device.gatt.disconnect();
      } catch {
        /* noop */
      }
    }
    characteristicRef.current = null;
    deviceRef.current = null;
  }, [handleValue, handleDisconnected]);

  const connect = useCallback(async () => {
    if (!isWebBluetoothSupported()) {
      setError(
        'Este navegador no admite Web Bluetooth. Usá Google Chrome en Android (versión 56 o superior) sobre una conexión HTTPS.'
      );
      return;
    }

    setError(null);
    setStatus('conectando');

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: DEVICE_NAME }],
        optionalServices: [SERVICE_UUID],
      });

      deviceRef.current = device;
      setDeviceName(device.name || DEVICE_NAME);
      device.addEventListener('gattserverdisconnected', handleDisconnected);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      characteristicRef.current = characteristic;

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleValue);

      setStatus('conectado');
      toast.success('Dispositivo conectado');
    } catch (e) {
      await cleanup();
      setStatus('desconectado');
      setDeviceName(null);
      setError(describeError(e));
    }
  }, [cleanup, handleDisconnected, handleValue]);

  const disconnect = useCallback(async () => {
    await cleanup();
    setStatus('desconectado');
    setDeviceName(null);
    setError(null);
    toast.success('Dispositivo desconectado');
  }, [cleanup]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setReceivedCount(0);
    setLastReceivedAt(null);
  }, []);

  useEffect(() => () => { cleanup(); }, [cleanup]);

  return {
    status,
    error,
    deviceName,
    messages,
    receivedCount,
    lastReceivedAt,
    connect,
    disconnect,
    clearMessages,
  };
}