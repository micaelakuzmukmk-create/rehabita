import { parseISO } from 'date-fns';

// Tiempo transcurrido desde una fecha, en lenguaje natural.
export function elapsedSince(dateStr) {
  if (!dateStr) return null;
  const start = parseISO(dateStr);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 1) {
    const days = Math.max(0, Math.round((now - start) / 86400000));
    return `${days} día${days === 1 ? '' : 's'}`;
  }
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0) return `${y} año${y === 1 ? '' : 's'}${m ? ` y ${m} mes${m === 1 ? '' : 'es'}` : ''}`;
  return `${m} mes${m === 1 ? '' : 'es'}`;
}