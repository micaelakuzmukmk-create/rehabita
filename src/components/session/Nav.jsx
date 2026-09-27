import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Nav({ onBack, onNext, nextLabel = 'Continuar', nextDisabled = false, children }) {
  return (
    <div className="flex justify-between items-center pt-3">
      {onBack ? (
        <button onClick={onBack} className="text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>
      ) : <span />}
      {children ?? (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          {nextLabel} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}