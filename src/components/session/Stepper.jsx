import React from 'react';

export default function Stepper({ labels, current }) {
  const total = labels.length;
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100;
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow">Paso {current + 1} de {total}</span>
        <span className="text-[13px] font-medium text-primary">{labels[current]}</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2.5 flex justify-between">
        {labels.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i < current ? 'bg-brand-lavender' : i === current ? 'bg-brand-cyan' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}