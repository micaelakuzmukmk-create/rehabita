import React from 'react';
import StatTile from '@/components/ds/StatTile';
import { METRIC_MAP, qualitative, metricDelta } from '@/lib/rehbaita';

export default function StatCard({ metricKey, value, prev }) {
  const m = METRIC_MAP[metricKey];
  if (!m) return null;
  const d = metricDelta(metricKey, value, prev);
  const pct = m.max && value != null ? Math.min(100, (value / m.max) * 100) : undefined;

  return (
    <StatTile
      label={m.label}
      value={value}
      unit={m.unit}
      hint={qualitative(metricKey, value)}
      delta={d ? d.delta : null}
      deltaUnit={m.unit}
      improved={d ? d.improved : undefined}
      progress={pct}
    />
  );
}