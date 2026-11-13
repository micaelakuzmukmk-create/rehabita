import React from 'react';

export default function Field({ label, hint, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}