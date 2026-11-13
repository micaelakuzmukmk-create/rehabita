import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function SessionsCalendar({ dates = [] }) {
  const sessionDates = dates.map((d) => parseISO(d));
  const [month, setMonth] = useState(
    sessionDates.length ? startOfMonth(sessionDates[sessionDates.length - 1]) : startOfMonth(new Date())
  );

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }

  const countOn = (d) => sessionDates.filter((s) => isSameDay(s, d)).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="rounded-xl border border-border p-1.5 text-muted-foreground transition-colors hover:border-brand-lavender hover:text-primary"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-heading text-sm font-medium capitalize text-foreground">
          {format(month, 'MMMM yyyy', { locale: es })}
        </div>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="rounded-xl border border-border p-1.5 text-muted-foreground transition-colors hover:border-brand-lavender hover:text-primary"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          const c = countOn(d);
          const inMonth = isSameMonth(d, month);
          return (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-[13px] transition-colors ${
                c
                  ? 'border border-brand-lavender bg-secondary font-semibold text-primary'
                  : inMonth
                    ? 'text-foreground'
                    : 'text-slate-300'
              }`}
            >
              <span>{format(d, 'd')}</span>
              {c > 0 && <span className="text-[9px] leading-none text-primary">{c} ses.</span>}
              {c > 0 && <span className="mt-1 h-[3px] w-[3px] rounded-full bg-brand-cyan" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}