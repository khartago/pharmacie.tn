'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="radio"
        className={cn(
          "h-4 w-4 border border-primary text-primary ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };

