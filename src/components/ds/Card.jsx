import React from 'react';
import { cn } from '@/lib/utils';

export default function Card({ className, children, as: As = 'div', ...props }) {
  return (
    <As className={cn('card', className)} {...props}>
      {children}
    </As>
  );
}