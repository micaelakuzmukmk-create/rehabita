import React from 'react';

/**
 * Interpolación SMIL de una transformación: `rotate` (con pivote) o `translate`.
 * Todos los movimientos comparten duración, tiempos y curvas de suavizado,
 * por lo que el ritmo de animación es idéntico entre ejercicios.
 */
export default function Anim({ type = 'rotate', values, dur, keyTimes, splines, pivot = [0, 0] }) {
  const vals = values
    .map((v) => (type === 'rotate'
      ? `${Number(v).toFixed(2)} ${pivot[0]} ${pivot[1]}`
      : `${Number(v[0]).toFixed(2)} ${Number(v[1]).toFixed(2)}`))
    .join(';');

  return (
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type={type}
      dur={`${dur}s`}
      values={vals}
      keyTimes={keyTimes.join(';')}
      keySplines={splines}
      calcMode="spline"
      repeatCount="indefinite"
    />
  );
}