import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { parseSample } from '@/lib/measurements';

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
  // No se recorta el texto: el salto de línea "\n" cierra cada mensaje JSON.
  const clean = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return { text: clean, hex };
}

// Conexión BLE bidireccional con el wearable: NOTIFY para recibir y WRITE para enviar comandos.
export default function useBleDevice({ onNotification } = {}) {
  const [status, setStatus] = useState('desconectado');
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [lastReceivedAt, setLastReceivedAt] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const bufferRef = useRef('');
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  // La ESP32 fragmenta cada JSON en bloques de hasta 20 bytes y lo cierra con "\n".
  const handleValue = useCallback((event) => {
    const { text, hex } = decodeValue(event.target.value);
    const time = new Date();

    bufferRef.current += text;
    // Fragmento incompleto: se acumula sin interpretarlo como error.
    if (!bufferRef.current.includes('\n')) return;

    const parts = bufferRef.current.split('\n');
    bufferRef.current = parts.pop() ?? '';

    const complete = parts.map((p) => p.trim()).filter(Boolean);
    if (complete.length === 0) return;

    setMessages((prev) =>
      [
        ...complete.map((line, i) => ({
          id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
          text: line,
          hex,
          time,
        })),
        ...prev,
      ].slice(0, MAX_MESSAGES)
    );
    setReceivedCount((c) => c + complete.length);
    setLastReceivedAt(Date.now());

    complete.forEach((line) => {
      onNotificationRef.current?.({ text: line, hex, time, sample: parseSample(line) });
    });
  }, []);

  const handleDisconnected = useCallback(() => {
    characteristicRef.current = null;
    deviceRef.current = null;
    bufferRef.current = '';
    setStatus('desconectado');
    setDeviceName(null);
    setError('El dispositivo se desconectó.');
  }, []);

  const cleanup = useCallback(async () => {
    bufferRef.current = '';
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
    bufferRef.current = '';

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

      // El wearable no transmite hasta recibir el comando START.
      setStatus('conectado');
      toast.success('Wearable conectado');
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
    toast.success('Wearable desvinculado');
  }, [cleanup]);

  // Envía un comando de texto (START / STOP) a la característica BLE.
  const sendCommand = useCallback(async (command) => {
    const characteristic = characteristicRef.current;
    if (!characteristic) throw new Error('No hay un wearable conectado.');

    const data = new TextEncoder().encode(command);
    if (typeof characteristic.writeValueWithoutResponse === 'function') {
      try {
        await characteristic.writeValueWithoutResponse(data);
        return;
      } catch (e) {
        if (e?.name !== 'NotSupportedError') throw e;
      }
    }
    await characteristic.writeValue(data);
  }, []);

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
    sendCommand,
    clearMessages,
  };
}