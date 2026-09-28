import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MUSCLE_GROUPS } from '@/lib/rehbaita';

// Fuerza adquirida por grupo muscular en cada sesión.
export default function MuscleStrengthChart({ data, height = 260 }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400 py-10 text-center">Aún no hay sesiones para graficar</div>;
  }
  const labelFor = (key) => MUSCLE_GROUPS.find(g => g.key === key)?.label || key;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#e2e8f0" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#e2e8f0" unit="%" />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          formatter={(v, name) => [`${v}%`, labelFor(name)]}
        />
        <Legend formatter={labelFor} wrapperStyle={{ fontSize: 12 }} />
        {MUSCLE_GROUPS.map(g => (
          <Line
            key={g.key}
            type="monotone"
            dataKey={g.key}
            stroke={g.color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}