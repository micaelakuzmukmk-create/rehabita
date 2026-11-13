import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { METRIC_MAP } from '@/lib/rehbaita';
import { GRID_STROKE, AXIS_TICK, AXIS_LINE, TOOLTIP_STYLE, LEGEND_STYLE } from '@/lib/chartTheme';

// Normaliza cada serie a 0-100 (% de su valor máximo) para comparar tendencias en un mismo eje amigable.
export default function EvolutionChart({ data, keys, height = 240 }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Aún no hay sesiones para graficar</div>;
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
      <LineChart data={norm} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
        <YAxis domain={[0, 100]} tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: AXIS_LINE }}
          formatter={(v, name) => [`${v}%`, METRIC_MAP[name]?.label || name]}
        />
        <Legend formatter={(v) => METRIC_MAP[v]?.label || v} wrapperStyle={LEGEND_STYLE} iconType="plainline" iconSize={14} />
        {series.map(({ key, m }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={m.color}
            strokeWidth={2.2}
            strokeLinecap="round"
            dot={{ r: 2.5, strokeWidth: 0, fill: m.color }}
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#FFFFFF' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}