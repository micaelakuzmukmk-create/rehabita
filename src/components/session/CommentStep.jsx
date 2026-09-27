import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CommentStep({ comment, setComment, notes, setNotes, saving, onSave, onBack }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-slate-700">Comentario profesional</div>
        <div className="text-xs text-slate-500 mt-0.5">Observaciones manuales sobre la sesión (opcional)</div>
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={4}
        placeholder="Ej.: Buena tolerancia al ejercicio, mejorar el control de carga sobre el miembro lesionado."
        className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:border-slate-400"
      />
      <div>
        <div className="text-sm text-slate-700">Notas internas de la sesión (opcional)</div>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas técnicas"
          className="input mt-1"
        />
      </div>
      <div className="flex justify-between items-center pt-1">
        <button onClick={onBack} className="text-sm text-slate-500 inline-flex items-center gap-1.5 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Atrás
        </button>
        <button onClick={onSave} disabled={saving} className="text-sm px-5 py-2.5 rounded-lg bg-emerald-600 text-white disabled:opacity-40 inline-flex items-center gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando…' : 'Guardar sesión'}
        </button>
      </div>
    </div>
  );
}