'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  [key: string]: any;
}

export interface UseFiltersReturn {
  filters: FilterState;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: FilterState) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  getFilterValue: (key: string) => any;
}

export function useFilters(
  initialFilters: FilterState = {},
  syncWithUrl: boolean = true
): UseFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFiltersState] = useState<FilterState>(() => {
    if (syncWithUrl) {
      const urlFilters: FilterState = {};
      searchParams.forEach((value, key) => {
        // Try to parse as JSON for complex values
        try {
          urlFilters[key] = JSON.parse(value);
        } catch {
          urlFilters[key] = value;
        }
      });
      return { ...initialFilters, ...urlFilters };
    }
    return initialFilters;
  });

  const setFilter = useCallback((key: string, value: any) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  }, []);

  // Sync filters with URL when they change
  useEffect(() => {
    if (syncWithUrl) {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      
      if (newUrl !== currentUrl) {
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [filters, syncWithUrl, router]);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(prev => {
      const mergedFilters = { ...prev, ...newFilters };
      return mergedFilters;
    });
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFiltersState(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== '' && value !== false
  );

  const getFilterValue = useCallback((key: string) => {
    return filters[key];
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    getFilterValue,
  };
}
