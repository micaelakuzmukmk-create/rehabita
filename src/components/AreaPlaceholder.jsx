import React from 'react';

export default function AreaPlaceholder({ title, description, icon: Icon }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="text-sm font-medium text-slate-500">Sección en desarrollo</div>
        <p className="text-sm text-slate-500 mt-1">
          Esta pantalla formará parte del área y estará disponible próximamente dentro de ReHabita.
        </p>
      </div>
    </div>
  );
}