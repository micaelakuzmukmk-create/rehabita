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
    <div className="rounded-2xl border border-slate-200 bg-white flex flex-col h-[70vh] min-h-[420px]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-700" aria-label="Volver a amigos">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium shrink-0">
          {(friend?.full_name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">{friend?.full_name}</div>
          <div className="text-xs text-slate-500">En rehabilitación</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-10">
            Todavía no hay mensajes. Escribile para acompañarse en el proceso.
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.sender_patient_id === meId;
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={`text-[10px] mt-1 ${mine ? 'text-slate-300' : 'text-slate-400'}`}>
                    {message.created_date ? format(parseISO(message.created_date), 'dd/MM HH:mm') : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribí un mensaje…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}