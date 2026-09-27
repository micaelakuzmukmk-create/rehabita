import React from 'react';

export default function Stepper({ labels, current }) {
  const total = labels.length;
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-900">Paso {current + 1} de {total}</span>
        <span className="text-sm text-slate-500">{labels[current]}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-slate-900 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-2">
        {labels.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i < current ? 'bg-emerald-500' : i === current ? 'bg-slate-900' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
}