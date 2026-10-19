import React from 'react';

export default function NavBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[11px] leading-[18px] text-center font-medium">
      {count > 9 ? '9+' : count}
    </span>
  );
}