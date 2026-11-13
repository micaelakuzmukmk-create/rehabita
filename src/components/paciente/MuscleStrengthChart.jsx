import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MUSCLE_GROUPS } from '@/lib/rehbaita';
import { GRID_STROKE, AXIS_TICK, AXIS_LINE, TOOLTIP_STYLE, LEGEND_STYLE } from '@/lib/chartTheme';

// Fuerza adquirida por grupo muscular en cada sesión.
export default function MuscleStrengthChart({ data, height = 260 }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Aún no hay sesiones para graficar</div>;
  }
  const labelFor = (key) => MUSCLE_GROUPS.find(g => g.key === key)?.label || key;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
        <YAxis domain={[0, 100]} tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: AXIS_LINE }}
          formatter={(v, name) => [`${v}%`, labelFor(name)]}
        />
        <Legend formatter={labelFor} wrapperStyle={LEGEND_STYLE} iconType="plainline" iconSize={14} />
        {MUSCLE_GROUPS.map(g => (
          <Line
            key={g.key}
            type="monotone"
            dataKey={g.key}
            stroke={g.color}
            strokeWidth={2.2}
            strokeLinecap="round"
            dot={{ r: 2.5, strokeWidth: 0, fill: g.color }}
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#FFFFFF' }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}