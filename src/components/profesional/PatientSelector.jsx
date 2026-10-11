import React from 'react';

export default function PatientSelector({ patients, value, onChange, disabled, hint }) {
  return (
    <div>
      <label className="text-xs text-slate-500">Paciente</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:border-slate-400"
      >
        <option value="">Seleccioná un paciente</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      {disabled && hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      {!disabled && patients.length === 0 && (
        <p className="text-[11px] text-amber-600 mt-1">No tenés pacientes asignados.</p>
      )}
    </div>
  );
}