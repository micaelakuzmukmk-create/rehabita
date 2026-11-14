import React from 'react';

export default function PatientSelector({ patients, value, onChange, disabled, hint }) {
  return (
    <div>
      <label className="field-label">Paciente</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input mt-1.5"
      >
        <option value="">Seleccioná un paciente</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      {disabled && hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {!disabled && patients.length === 0 && (
        <p className="mt-1 text-[11px] text-warning">No tenés pacientes asignados.</p>
      )}
    </div>
  );
}