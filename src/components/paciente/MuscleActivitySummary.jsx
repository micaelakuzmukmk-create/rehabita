import React from 'react';
import { format, parseISO } from 'date-fns';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Info } from 'lucide-react';
import { MUSCLE_SERIES } from '@/lib/measurements';

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
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{series.label}</span>
        <span className="font-medium text-slate-900">{typeof value === 'number' ? value : '—'}</span>
      </div>
      <div className="mt-1 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: series.color }} />
      </div>
    </div>
  );
}

export default function MuscleActivitySummary({ sessions, summaries }) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-300 p-5">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <div className="text-sm text-slate-500">
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
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          Datos simulados: los índices corresponden a señales generadas por el dispositivo y no a mediciones clínicas
          de fuerza muscular.
        </p>
      </div>

      {rows.map(({ session, summary }) => (
        <div key={session.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-medium text-slate-900">{fmtDate(session.started_at)}</div>
            <div className="flex items-center gap-2">
              {session.simulated !== false && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Datos simulados
                </span>
              )}
              {session.status === 'interrumpida' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Interrumpida
                </span>
              )}
            </div>
          </div>

          {summary ? (
            <div className="grid gap-3">
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
            <div className="text-sm text-slate-400">Sin resumen calculado para esta sesión.</div>
          )}
        </div>
      ))}

      {evolution.length >= 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-3">
            <Activity className="w-4 h-4 text-teal-600" /> Evolución entre sesiones
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {MUSCLE_SERIES.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}