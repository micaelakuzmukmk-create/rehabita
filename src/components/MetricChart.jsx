import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MetricChart({ data, metrics, height = 280 }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400 py-10 text-center">Sin datos para graficar</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {metrics.map(m => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            name={m.label}
            stroke={m.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}