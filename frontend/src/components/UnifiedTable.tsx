'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/enhanced-select';

export interface Column<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

export interface UnifiedTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

const UnifiedTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  searchPlaceholder = 'Rechercher...',
  filters = [],
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  onRowClick,
  emptyMessage = 'Aucune donnée disponible',
  className = '',
}: UnifiedTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search data
  const filteredData = useMemo(() => {
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    let result = [...safeData];

    // Apply search
    if (searchQuery && onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply filter
    if (activeFilter && onFilter) {
      onFilter(activeFilter);
    }

    return result;
  }, [data, searchQuery, activeFilter, onSearch, onFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortState.key];
      const bValue = b[sortState.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortState]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection: 'asc' | 'desc' = sortState?.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
    const newSortState = { key, direction: newDirection };
    
    setSortState(newSortState);
    if (onSort) {
      onSort(key, newDirection);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle filter
  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  return (
    <Card className={`card-modern ${className} animate-fade-in`}>
      {/* Table Header with Search and Filters */}
      {(searchable || filterable) && (
        <CardHeader className="enhanced-card-header">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors duration-200" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 focus-ring-modern transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            {filterable && filters.length > 0 && (
              <div className="flex-shrink-0">
                <Select value={activeFilter} onValueChange={handleFilter}>
                  <SelectTrigger className="w-[180px] focus-ring-modern transition-all duration-200">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tous les filtres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les filtres</SelectItem>
                    {filters.map((filter) => (
                      <SelectItem key={filter.key} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">

        {/* Professional Table */}
        <div className="overflow-x-auto">
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`
                      ${column.sortable && sortable ? 'cursor-pointer hover:bg-muted/50 transition-colors duration-200' : ''}
                      ${column.width ? column.width : ''}
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                    `}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-semibold">{column.header}</span>
                      {column.sortable && sortState?.key === column.key && (
                        <span className="transition-transform duration-200">
                          {sortState.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {emptyMessage}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`
                          ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                        `}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Professional Pagination */}
      {pagination && totalPages > 1 && (
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de {((currentPage - 1) * pageSize) + 1} à{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} sur{' '}
              {sortedData.length} résultats
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UnifiedTable; 