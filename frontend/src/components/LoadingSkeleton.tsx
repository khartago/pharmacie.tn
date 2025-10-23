'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: LoadingSkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const getAnimationStyles = () => {
    switch (animation) {
      case 'wave':
        return 'shimmer';
      case 'none':
        return 'bg-gray-200';
      default:
        return 'animate-pulse bg-gray-200';
    }
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={cn(
        getVariantStyles(),
        getAnimationStyles(),
        className
      )}
      style={style}
    />
  );
}

// Skeleton for table rows
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <LoadingSkeleton variant="text" className="h-4" />
        </td>
      ))}
    </tr>
  );
}

// Skeleton for table
export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}: { 
  rows?: number; 
  columns?: number; 
  showHeader?: boolean; 
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <LoadingSkeleton variant="text" className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <SkeletonTableRow key={rowIndex} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Skeleton for cards
export function SkeletonCard({ 
  showAvatar = true, 
  showActions = true 
}: { 
  showAvatar?: boolean; 
  showActions?: boolean; 
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <LoadingSkeleton variant="circular" className="h-10 w-10" />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="h-4 w-3/4" />
          <LoadingSkeleton variant="text" className="h-3 w-1/2" />
          <LoadingSkeleton variant="text" className="h-3 w-2/3" />
        </div>
      </div>
      {showActions && (
        <div className="mt-4 flex space-x-2">
          <LoadingSkeleton variant="rounded" className="h-8 w-20" />
          <LoadingSkeleton variant="rounded" className="h-8 w-20" />
        </div>
      )}
    </div>
  );
}

// Skeleton for stat cards
export function SkeletonStatCard() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" className="h-4 w-24" />
          <LoadingSkeleton variant="text" className="h-8 w-16" />
        </div>
        <LoadingSkeleton variant="circular" className="h-8 w-8" />
      </div>
    </div>
  );
}

// Skeleton for stat cards grid
export function SkeletonStats({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, index) => (
        <SkeletonStatCard key={index} />
      ))}
    </div>
  );
}

// Skeleton for list items
export function SkeletonListItem({ 
  showAvatar = true, 
  showActions = false 
}: { 
  showAvatar?: boolean; 
  showActions?: boolean; 
}) {
  return (
    <div className="flex items-center space-x-3 p-3 border-b border-gray-200">
      {showAvatar && (
        <LoadingSkeleton variant="circular" className="h-8 w-8" />
      )}
      <div className="flex-1 space-y-1">
        <LoadingSkeleton variant="text" className="h-4 w-1/3" />
        <LoadingSkeleton variant="text" className="h-3 w-1/2" />
      </div>
      {showActions && (
        <LoadingSkeleton variant="rounded" className="h-6 w-16" />
      )}
    </div>
  );
}

// Skeleton for list
export function SkeletonList({ 
  items = 5, 
  showAvatar = true, 
  showActions = false 
}: { 
  items?: number; 
  showAvatar?: boolean; 
  showActions?: boolean; 
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonListItem 
          key={index} 
          showAvatar={showAvatar} 
          showActions={showActions} 
        />
      ))}
    </div>
  );
}

// Skeleton for form
export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <LoadingSkeleton variant="text" className="h-4 w-20" />
          <LoadingSkeleton variant="rounded" className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <LoadingSkeleton variant="rounded" className="h-10 w-24" />
        <LoadingSkeleton variant="rounded" className="h-10 w-24" />
      </div>
    </div>
  );
}

// Skeleton for profile
export function SkeletonProfile() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="circular" className="h-16 w-16" />
        <div className="space-y-2">
          <LoadingSkeleton variant="text" className="h-6 w-32" />
          <LoadingSkeleton variant="text" className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <LoadingSkeleton variant="text" className="h-4 w-full" />
        <LoadingSkeleton variant="text" className="h-4 w-3/4" />
        <LoadingSkeleton variant="text" className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Skeleton for kanban columns
export function SkeletonKanbanColumn() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <LoadingSkeleton variant="text" className="h-4 w-24" />
      </div>
      <div className="flex-1 p-3 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
            <LoadingSkeleton variant="text" className="h-4 w-3/4 mb-2" />
            <LoadingSkeleton variant="text" className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for kanban board
export function SkeletonKanbanBoard({ columns = 3 }: { columns?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-80">
          <SkeletonKanbanColumn />
        </div>
      ))}
    </div>
  );
}

// Skeleton for dashboard
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <LoadingSkeleton variant="text" className="h-8 w-48" />
        <LoadingSkeleton variant="rounded" className="h-10 w-32" />
      </div>
      
      <SkeletonStats cards={4} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonTable rows={5} columns={3} />
        <SkeletonList items={5} showAvatar={true} showActions={true} />
      </div>
    </div>
  );
}
