import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MUSCLE_SERIES } from '@/lib/measurements';
import { GRID_STROKE, AXIS_TICK, AXIS_LINE, TOOLTIP_STYLE, LEGEND_STYLE } from '@/lib/chartTheme';

export default function ActivityChart({ data, visible }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="time"
            tick={AXIS_TICK}
            stroke={AXIS_LINE}
            tickLine={false}
            minTickGap={24}
            label={{ value: 'Tiempo de medición', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#8A8699' }}
          />
          <YAxis domain={[0, 100]} tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: AXIS_LINE }}
            labelFormatter={(v) => `Tiempo: ${v}`}
          />
          <Legend wrapperStyle={LEGEND_STYLE} iconType="plainline" iconSize={14} />
          {MUSCLE_SERIES.filter((s) => visible[s.key]).map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}