// Estado liviano del wearable para mostrarlo en toda la plataforma.
// No gestiona la conexión BLE: solo refleja lo que informa la pantalla Dispositivo.
const state = { name: null, connected: false, active: false };
const listeners = new Set();

export function setDeviceStatus(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn({ ...state }));
}

export function getDeviceStatus() {
  return { ...state };
}

export function subscribeDeviceStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}