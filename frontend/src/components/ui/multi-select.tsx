'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  placeholder?: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  emptyText?: string;
}

export default function MultiSelect({
  placeholder = 'Sélectionner... ',
  value,
  onChange,
  options,
  disabled = false,
  className,
  searchable = true,
  emptyText = 'Aucune option trouvée'
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen]);

  const selectedMap = useMemo(() => new Set(value || []), [value]);
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(term));
  }, [options, searchable, searchTerm]);

  const toggleValue = (val: string) => {
    const set = new Set(selectedMap);
    if (set.has(val)) set.delete(val); else set.add(val);
    onChange(Array.from(set));
  };

  const clearOne = (val: string) => {
    const set = new Set(selectedMap);
    set.delete(val);
    onChange(Array.from(set));
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <div className="flex flex-wrap gap-1 items-center text-left">
          {value && value.length > 0 ? (
            value.map((val) => {
              const opt = options.find(o => o.value === val);
              return (
                <span key={val} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground">
                  <span className="truncate max-w-[180px]">{opt?.label ?? val}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); clearOne(val); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); clearOne(val); } }}
                    className="opacity-70 hover:opacity-100 cursor-pointer select-none"
                    aria-label="Retirer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-auto">
          {searchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div className="p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = selectedMap.has(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn('flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground', selected && 'bg-accent text-accent-foreground')}
                  >
                    <span>{option.label}</span>
                    {selected && <Check className="h-4 w-4" />}
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


