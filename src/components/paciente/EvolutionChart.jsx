import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { METRIC_MAP } from '@/lib/rehbaita';

// Normaliza cada serie a 0-100 (% de su valor máximo) para comparar tendencias en un mismo eje amigable.
export default function EvolutionChart({ data, keys, height = 240 }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400 py-10 text-center">Aún no hay sesiones para graficar</div>;
  }
  const series = keys.map(k => ({ key: k, m: METRIC_MAP[k] })).filter(s => s.m);
  const norm = data.map(row => {
    const r = { label: row.label };
    series.forEach(({ key, m }) => {
      if (row[key] != null) r[key] = Math.round((row[key] / m.max) * 100);
    });
    return r;
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={norm} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#e2e8f0" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#e2e8f0" unit="%" />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          formatter={(v, name) => [`${v}%`, METRIC_MAP[name]?.label || name]}
        />
        <Legend formatter={(v) => METRIC_MAP[v]?.label || v} wrapperStyle={{ fontSize: 12 }} />
        {series.map(({ key, m }) => (
          <Line key={key} type="monotone" dataKey={key} stroke={m.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}