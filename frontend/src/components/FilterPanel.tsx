'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  className?: string;
  title?: string;
}

export default function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className,
  title = "Filtres"
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderFilter = (filter: FilterOption) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || filter.label}
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(val) => onChange(filter.key, val)}
            placeholder={filter.placeholder || filter.label}
            options={filter.options}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={filter.key}
              checked={value || false}
              onCheckedChange={(checked) => onChange(filter.key, checked)}
            />
            <label htmlFor={filter.key} className="text-sm font-medium">
              {filter.label}
            </label>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(values).some(value => 
    value !== undefined && value !== '' && value !== false
  );

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2",
          hasActiveFilters && "border-primary text-primary"
        )}
      >
        <Filter className="h-4 w-4" />
        <span>Filtres</span>
        {hasActiveFilters && (
          <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {filter.label}
                </label>
                {renderFilter(filter)}
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={!hasActiveFilters}
              >
                Effacer
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Appliquer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
