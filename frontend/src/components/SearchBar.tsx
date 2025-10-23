'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function SearchBar({
  placeholder = "Rechercher...",
  value,
  onChange,
  onClear,
  className,
  disabled = false
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Effacer</span>
          </Button>
        )}
      </div>
    </div>
  );
}
