import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CommentStep({ comment, setComment, notes, setNotes, saving, onSave, onBack }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-foreground">Comentario profesional</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">Observaciones manuales sobre la sesión (opcional)</div>
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={4}
        placeholder="Ej.: Buena tolerancia al ejercicio, mejorar el control de carga sobre el miembro lesionado."
        className="input resize-none"
      />
      <div>
        <div className="field-label">Notas internas de la sesión (opcional)</div>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas técnicas"
          className="input mt-1.5"
        />
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando…' : 'Guardar sesión'}
        </Button>
      </div>
    </div>
  );
}