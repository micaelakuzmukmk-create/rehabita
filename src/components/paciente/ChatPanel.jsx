import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ChatPanel({ friend, messages, meId, onSend, onBack, sending }) {
  const [text, setText] = useState('');

  async function submit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    await onSend(value);
  }

  return (
    <div className="flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Volver a amigos"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-semibold text-primary">
          {(friend?.full_name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{friend?.full_name}</div>
          <div className="text-[11px] text-muted-foreground">En rehabilitación</div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Todavía no hay mensajes. Escribile para acompañarse en el proceso.
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.sender_patient_id === meId;
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  <div className={`mt-1 text-[10px] ${mine ? 'text-slate-300' : 'text-muted-foreground'}`}>
                    {message.created_date ? format(parseISO(message.created_date), 'dd/MM HH:mm') : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border px-3 py-3">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribí un mensaje…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}