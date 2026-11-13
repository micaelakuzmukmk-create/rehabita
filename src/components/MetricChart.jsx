import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GRID_STROKE, AXIS_TICK, AXIS_LINE, TOOLTIP_STYLE, LEGEND_STYLE } from '@/lib/chartTheme';

export default function MetricChart({ data, metrics, height = 280 }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Sin datos para graficar</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
        <YAxis tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: AXIS_LINE }} />
        <Legend wrapperStyle={LEGEND_STYLE} iconType="plainline" iconSize={14} />
        {metrics.map(m => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            name={m.label}
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