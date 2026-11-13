import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, GRID_STROKE, AXIS_TICK, AXIS_LINE, TOOLTIP_STYLE } from '@/lib/chartTheme';

// Cantidad de movimientos lesivos registrados en cada sesión.
export default function InjuriousMovementsChart({ data, height = 240 }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Aún no hay sesiones para graficar</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: '#F7F7FA' }}
          formatter={(v) => [v, 'Movimientos lesivos']}
        />
        <Bar dataKey="injurious_movements" fill={CHART_COLORS.warning} radius={[6, 6, 2, 2]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  );
}