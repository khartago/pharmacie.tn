'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required = false,
  error,
  description,
  children,
  className
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Re-export form components for convenience
export { Input } from './ui/input';
export { Textarea } from './ui/textarea';
export { Select } from './ui/select';
export { Checkbox } from './ui/checkbox';
export { Radio } from './ui/radio';