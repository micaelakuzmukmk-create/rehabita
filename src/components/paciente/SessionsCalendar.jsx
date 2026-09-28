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
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(subMonths(month, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 transition" aria-label="Mes anterior">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="text-sm font-medium text-slate-700 capitalize">{format(month, 'MMMM yyyy', { locale: es })}</div>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 transition" aria-label="Mes siguiente">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-xs text-slate-400 py-1 text-center">{w}</div>
        ))}
        {days.map((d, i) => {
          const c = countOn(d);
          const inMonth = isSameMonth(d, month);
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm ${
                inMonth ? 'text-slate-700' : 'text-slate-300'
              } ${c ? 'bg-teal-50 border border-teal-200 font-medium text-teal-800' : ''}`}
            >
              <span>{format(d, 'd')}</span>
              {c > 0 && <span className="text-[10px] leading-none text-teal-600">{c} ses.</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}