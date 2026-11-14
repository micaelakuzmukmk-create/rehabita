import React from 'react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

/** Micrográfico dentro de una tarjeta: tendencia sin ejes. */
export default function MiniSpark({ data, dataKey, color = '#2CB1D2', height = 44, domain }) {
  const rows = (data || []).filter((d) => d[dataKey] != null);
  if (rows.length < 2) {
    return <div className="flex h-11 items-center text-[10px] text-muted-foreground">Sin tendencia aún</div>;
  }
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={rows} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
          <YAxis hide domain={domain || ['dataMin - 4', 'dataMax + 4']} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}