import React from 'react';
import { Info, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MUSCLE_SERIES } from '@/lib/measurements';
import Card from '@/components/ds/Card';
import Chip from '@/components/ds/Chip';
import { GRID_STROKE, AXIS_TICK, AXIS_LINE, TOOLTIP_STYLE, LEGEND_STYLE } from '@/lib/chartTheme';

function fmtDate(value) {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm');
  } catch {
    return value;
  }
}

function MaxBar({ series, value }) {
  const pct = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: series.color }} />
          {series.label}
        </span>
        <span className="font-heading font-semibold text-foreground tabular-nums">
          {typeof value === 'number' ? value : '—'}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: series.color }}
        />
      </div>
    </div>
  );
}

export default function MuscleActivitySummary({ sessions, summaries }) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="text-sm leading-relaxed text-muted-foreground">
          Todavía no hay mediciones con el wearable registradas. Cuando tu kinesiólogo realice una medición, vas a ver
          acá los índices máximos de actividad de cada grupo muscular.
        </div>
      </div>
    );
  }

  const rows = sessions.map((s) => ({ session: s, summary: summaries[s.id] || null }));

  const evolution = [...rows]
    .filter((r) => r.summary)
    .sort((a, b) => new Date(a.session.started_at) - new Date(b.session.started_at))
    .map((r, i) => ({
      label: `S${i + 1}`,
      isquio: r.summary.max_isquio,
      vasto_interno: r.summary.max_vasto_interno,
      vasto_externo: r.summary.max_vasto_externo,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-[11px] leading-relaxed text-amber-800">
          Datos simulados: los índices corresponden a señales generadas por el dispositivo y no a mediciones clínicas
          de fuerza muscular.
        </p>
      </div>

      {rows.map(({ session, summary }) => (
        <Card key={session.id} className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="font-heading text-[13px] font-medium text-foreground">{fmtDate(session.started_at)}</div>
            <div className="flex items-center gap-2">
              {session.simulated !== false && <Chip tone="warning">Datos simulados</Chip>}
              {session.status === 'interrumpida' && <Chip tone="danger">Interrumpida</Chip>}
            </div>
          </div>

          {summary ? (
            <div className="grid gap-3.5">
              {MUSCLE_SERIES.map((series) => (
                <MaxBar
                  key={series.key}
                  series={series}
                  value={
                    series.key === 'isquio'
                      ? summary.max_isquio
                      : series.key === 'vasto_interno'
                        ? summary.max_vasto_interno
                        : summary.max_vasto_externo
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sin resumen calculado para esta sesión.</div>
          )}
        </Card>
      ))}

      {evolution.length >= 2 && (
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-primary">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <span className="section-title">Evolución entre sesiones</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
                <XAxis dataKey="label" tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
                <YAxis domain={[0, 100]} tick={AXIS_TICK} stroke={AXIS_LINE} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: AXIS_LINE }} />
                <Legend wrapperStyle={LEGEND_STYLE} iconType="plainline" iconSize={14} />
                {MUSCLE_SERIES.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 2.5, strokeWidth: 0, fill: s.color }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}