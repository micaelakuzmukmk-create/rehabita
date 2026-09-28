import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Cantidad de movimientos lesivos registrados en cada sesión.
export default function InjuriousMovementsChart({ data, height = 240 }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400 py-10 text-center">Aún no hay sesiones para graficar</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#e2e8f0" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#e2e8f0" />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          formatter={(v) => [v, 'Movimientos lesivos']}
        />
        <Bar dataKey="injurious_movements" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}