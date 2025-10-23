'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function FilterChip({
  label,
  value,
  onRemove,
  className,
  variant = 'default',
  size = 'md',
  removable = true,
  icon: Icon
}: FilterChipProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'secondary':
        return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200';
      case 'danger':
        return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border font-medium transition-colors',
      getVariantStyles(),
      getSizeStyles(),
      className
    )}>
      {Icon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
      {removable && (
        <button
          onClick={() => onRemove(value)}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// Filter chips container
interface FilterChipsProps {
  filters: Array<{
    label: string;
    value: string;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  onRemove: (value: string) => void;
  onClearAll?: () => void;
  className?: string;
  showClearAll?: boolean;
  maxVisible?: number;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
  showClearAll = true,
  maxVisible
}: FilterChipsProps) {
  const visibleFilters = maxVisible ? filters.slice(0, maxVisible) : filters;
  const hiddenCount = maxVisible ? filters.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleFilters.map((filter) => (
        <FilterChip
          key={filter.value}
          label={filter.label}
          value={filter.value}
          onRemove={onRemove}
          variant={filter.variant}
          icon={filter.icon}
        />
      ))}
      
      {hiddenCount > 0 && (
        <FilterChip
          label={`+${hiddenCount} autres`}
          value="more"
          onRemove={() => {}}
          removable={false}
          variant="secondary"
        />
      )}
      
      {showClearAll && filters.length > 0 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-gray-500 hover:text-gray-700"
        >
          Effacer tout
        </Button>
      )}
    </div>
  );
}

// Quick filter chips for common filters
export function QuickFilterChips({
  onFilterChange,
  activeFilters = {},
  className
}: {
  onFilterChange: (key: string, value: string | null) => void;
  activeFilters?: Record<string, string>;
  className?: string;
}) {
  const quickFilters = [
    { key: 'status', label: 'Statut', options: [
      { value: 'AVAILABLE', label: 'Disponible', variant: 'success' as const },
      { value: 'PENDING', label: 'En attente', variant: 'warning' as const },
      { value: 'EXPIRED', label: 'Expiré', variant: 'danger' as const }
    ]},
    { key: 'region', label: 'Région', options: [
      { value: 'TUNIS', label: 'Tunis', variant: 'primary' as const },
      { value: 'SOUSSE', label: 'Sousse', variant: 'secondary' as const },
      { value: 'SFAX', label: 'Sfax', variant: 'secondary' as const }
    ]},
    { key: 'type', label: 'Type', options: [
      { value: 'ANNOUNCEMENT', label: 'Annonce', variant: 'primary' as const },
      { value: 'REQUEST', label: 'Demande', variant: 'secondary' as const }
    ]}
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {quickFilters.map((filter) => (
        <div key={filter.key} className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{filter.label}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filter.options.map((option) => {
              const isActive = activeFilters[filter.key] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(filter.key, isActive ? null : option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Date range filter chips
export function DateRangeFilterChips({
  onDateRangeChange,
  activeRange,
  className
}: {
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  activeRange?: { start: Date | null; end: Date | null };
  className?: string;
}) {
  const quickRanges = [
    { label: 'Aujourd\'hui', days: 0 },
    { label: 'Cette semaine', days: 7 },
    { label: 'Ce mois', days: 30 },
    { label: 'Ce trimestre', days: 90 }
  ];

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateRangeChange({ start, end });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Période</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => handleQuickRange(range.days)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Status filter chips
export function StatusFilterChips({
  onStatusChange,
  activeStatus,
  className
}: {
  onStatusChange: (status: string | null) => void;
  activeStatus?: string;
  className?: string;
}) {
  const statuses = [
    { value: 'AVAILABLE', label: 'Disponible', variant: 'success' as const },
    { value: 'PENDING', label: 'En attente', variant: 'warning' as const },
    { value: 'ACCEPTED', label: 'Accepté', variant: 'primary' as const },
    { value: 'REJECTED', label: 'Refusé', variant: 'danger' as const },
    { value: 'EXPIRED', label: 'Expiré', variant: 'danger' as const }
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Statut</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(activeStatus === status.value ? null : status.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeStatus === status.value
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            )}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}

