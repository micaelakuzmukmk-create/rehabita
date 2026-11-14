import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const SENSATIONS = [
  'Me sentí estable',
  'Me costó mantener el equilibrio',
  'Sentí inseguridad',
  'Sentí dolor',
  'Me resultó más fácil',
  'Noté una mejora',
];

function Scale({ label, value, onChange }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="micro-label">{label}</span>
        <span className="font-heading text-sm font-semibold tabular-nums text-foreground">
          {value == null ? '—' : value}<span className="text-[11px] font-medium text-muted-foreground"> /10</span>
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 flex-1 rounded-lg border text-[11px] font-medium transition-colors ${
              value === n
                ? 'border-area-accent bg-area-soft text-area-ink'
                : 'border-border bg-card text-muted-foreground hover:border-area-accent/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Devolución del paciente para una sesión puntual.
 * Se guarda como Perception asociada a la sesión (misma base de datos, sin cambios de esquema).
 */
export default function SessionFeedback({ sessionId, patientId, compact = false }) {
  const [pain, setPain] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [sensations, setSensations] = useState([]);
  const [comment, setComment] = useState('');
  const [existing, setExisting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    if (!sessionId) return;
    const rows = await base44.entities.Perception.filter({ session_id: sessionId }, '-date', 5);
    if (rows[0]) {
      setExisting(rows[0]);
      setPain(rows[0].pain_level ?? null);
      setConfidence(rows[0].confidence_level ?? null);
      setComment(rows[0].notes || '');
      setSaved(true);
    }
  }

  const toggleSensation = (s) =>
    setSensations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function submit() {
    const hasValues = pain != null || confidence != null || sensations.length > 0 || comment.trim();
    if (!hasValues) {
      toast.error('Contale algo a tu kinesiólogo antes de enviar.');
      return;
    }
    setSaving(true);
    try {
      const notes = [
        sensations.length > 0 ? `Sensación: ${sensations.join(', ')}.` : '',
        comment.trim(),
      ].filter(Boolean).join(' ');

      const payload = {
        patient_id: patientId,
        session_id: sessionId,
        date: new Date().toISOString(),
        pain_level: pain,
        confidence_level: confidence,
        notes: notes || undefined,
      };

      if (existing) await base44.entities.Perception.update(existing.id, payload);
      else setExisting(await base44.entities.Perception.create(payload));

      setSaved(true);
      toast.success('Tu devolución quedó enviada');
    } catch {
      toast.error('No se pudo enviar tu devolución');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`rounded-2xl border border-border bg-card ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow text-area-ink">¿Cómo te sentiste?</div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Tu devolución acompaña la lectura de tus datos. La ve tu kinesiólogo.
          </p>
        </div>
        {saved && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-area-soft px-2 py-1 text-[10px] font-semibold text-area-ink">
            <Check className="h-3 w-3" /> Enviada
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Scale label="Dolor" value={pain} onChange={setPain} />
        <Scale label="Confianza" value={confidence} onChange={setConfidence} />
      </div>

      <div className="mt-4">
        <div className="micro-label mb-1.5">Sensación general</div>
        <div className="flex flex-wrap gap-1.5">
          {SENSATIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSensation(s)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                sensations.includes(s)
                  ? 'border-area-accent bg-area-soft text-area-ink'
                  : 'border-border bg-card text-muted-foreground hover:border-area-accent/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="micro-label mb-1.5 block">Comentario para mi kinesiólogo</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Contale a tu kinesiólogo cómo te sentiste durante o después de la sesión."
          className="input resize-none"
        />
      </div>

      <Button onClick={submit} disabled={saving} className="mt-3 w-full sm:w-auto">
        <Send className="h-3.5 w-3.5" /> {saving ? 'Enviando…' : 'Enviar comentario'}
      </Button>
    </section>
  );
}