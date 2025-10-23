'use client';

import { useState, useCallback, useEffect } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function usePagination(
  initialPage: number = 1,
  initialLimit: number = 21
): UsePaginationReturn {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setTotal = useCallback((total: number) => {
    setPagination(prev => ({
      ...prev,
      total,
      totalPages: Math.ceil(total / prev.limit),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const goToLastPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.totalPages }));
  }, []);

  const canGoNext = pagination.page < pagination.totalPages;
  const canGoPrev = pagination.page > 1;

  // Update totalPages when total or limit changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(prev.total / prev.limit),
    }));
  }, [pagination.total, pagination.limit]);

  return {
    pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev,
  };
}
