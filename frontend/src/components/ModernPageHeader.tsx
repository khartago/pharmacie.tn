'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchBar from './SearchBar';
import { cn } from '@/lib/utils';

export interface ModernPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
  };
  filters?: React.ReactNode;
  className?: string;
}

export default function ModernPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  search,
  filters,
  className
}: ModernPageHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>

      {/* Search and Filters Section */}
      {(search || filters) && (
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 max-w-md">
            {search && (
              <SearchBar
                placeholder={search.placeholder}
                value={search.value}
                onChange={search.onChange}
                onClear={search.onClear}
              />
            )}
          </div>
          {filters && (
            <div className="flex items-center space-x-2">
              {filters}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
