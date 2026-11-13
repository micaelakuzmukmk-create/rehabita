import React from 'react';

export default function NavBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
      {count > 9 ? '9+' : count}
    </span>
  );
}