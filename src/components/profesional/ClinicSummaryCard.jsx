import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/* Descending dot arrow: 4 / 3 / 2 / 1 dots, right aligned — decorative accent. */
const DOTS = [
  [14, 14, 0.54], [38, 14, 0.36], [62, 14, 0.18], [86, 14, 0],
  [38, 38, 0.54], [62, 38, 0.36], [86, 38, 0.18],
  [62, 62, 0.54], [86, 62, 0.36],
  [86, 86, 0.54],
];

function DotAccent({ revealed }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-12 w-12 shrink-0 fill-brand-lavender sm:h-14 sm:w-14">
      {DOTS.map(([cx, cy, delay]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="9"
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            transition: `opacity .45s ease ${delay}s, transform .45s cubic-bezier(.22,1,.36,1) ${delay}s`,
            opacity: revealed ? 1 : 0.3,
            transform: revealed ? 'scale(1)' : 'scale(0.82)',
          }}
        />
      ))}
    </svg>
  );
}

/*
  Nivel 2 de jerarquía de la home clínica: un único dato protagonista.
  La información secundaria vive al pie, en pares etiqueta/valor de menor peso.
*/
export default function ClinicSummaryCard({ title, value, suffix, details = [], className }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      setShown(target);
      return;
    }

    setShown(0);
    const el = ref.current;
    if (!el) return undefined;

    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setRevealed(true);

        const start = performance.now();
        const duration = 1100;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(Math.round(eased * target));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      });
    }, { threshold: 0.25 });

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex min-h-[186px] flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-surface sm:p-7',
        className
      )}
      style={{
        backgroundImage:
          'radial-gradient(125% 125% at 100% 0%, hsl(var(--brand-violet) / 0.13) 0%, hsl(var(--brand-violet) / 0.05) 32%, hsl(var(--brand-violet) / 0) 62%)',
      }}
    >
      {/* Textura sutil en la esquina del acento — decorativa */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16] mix-blend-multiply"
        style={{
          maskImage: 'radial-gradient(125% 125% at 100% 0%, black 0%, black 22%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(125% 125% at 100% 0%, black 0%, black 22%, transparent 72%)',
        }}
      >
        <filter id="rehabita-grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#rehabita-grain)" />
      </svg>

      <div className="relative flex items-start justify-between gap-4">
        <h3 className="min-w-0 font-heading text-[19px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
          {title}
        </h3>
        <DotAccent revealed={revealed} />
      </div>

      <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-[52px] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums">
            {shown}
          </span>
          {suffix && <span className="font-heading text-base font-medium text-muted-foreground">{suffix}</span>}
        </div>

        {details.length > 0 && (
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            {details.map((detail) => (
              <div key={detail.label} className="min-w-0">
                <dt className="micro-label">{detail.label}</dt>
                <dd className="mt-1 font-heading text-[15px] font-medium text-foreground tabular-nums">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}