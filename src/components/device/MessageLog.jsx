import React from 'react';
import { format } from 'date-fns';
import { Eraser } from 'lucide-react';
import Card from '@/components/ds/Card';
import { Button } from '@/components/ui/button';

export default function MessageLog({ messages, onClear }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="section-title">Historial reciente</h3>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>
            <Eraser className="h-3.5 w-3.5" /> Limpiar
          </Button>
        )}
      </div>
      {messages.length === 0 ? (
        <div className="text-sm text-muted-foreground">Sin mensajes registrados</div>
      ) : (
        <ul className="max-h-72 divide-y divide-border overflow-y-auto">
          {messages.slice(0, 20).map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 py-2">
              <span className="break-all font-mono text-[13px] text-foreground">
                {m.text || '(binario)'}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {format(m.time, 'HH:mm:ss')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}