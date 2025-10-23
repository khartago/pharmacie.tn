'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse-slow';
      case 'wave':
        return 'animate-skeleton-wave bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-size-200';
      case 'none':
        return '';
      default:
        return 'animate-pulse-slow';
    }
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-muted ${getVariantClasses()} ${getAnimationClasses()}
        ${className}
      `}
      style={style}
    />
  );
};

// Skeleton for table rows
const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              className="flex-1 h-4"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Skeleton for cards
const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
}) => {
  return (
    <div className={`bg-background rounded-lg shadow-sm border border-border p-6 ${className}`}>
      <div className="space-y-4">
        {/* Image */}
        {showImage && (
          <Skeleton
            variant="rectangular"
            className="w-full h-48 rounded-lg"
          />
        )}
        
        {/* Title */}
        {showTitle && (
          <Skeleton
            variant="text"
            className="h-6 w-3/4"
          />
        )}
        
        {/* Description */}
        {showDescription && (
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-4/6" />
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-4">
            <Skeleton variant="rounded" className="h-8 w-20" />
            <Skeleton variant="rounded" className="h-8 w-24" />
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton for list items
export interface SkeletonListProps {
  items?: number;
  className?: string;
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showDescription?: boolean;
}

const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  className = '',
  showAvatar = true,
  showTitle = true,
  showSubtitle = true,
  showDescription = true,
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex space-x-4">
          {/* Avatar */}
          {showAvatar && (
            <Skeleton
              variant="circular"
              className="w-12 h-12 flex-shrink-0"
            />
          )}
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            {showTitle && (
              <Skeleton variant="text" className="h-4 w-1/3" />
            )}
            
            {showSubtitle && (
              <Skeleton variant="text" className="h-3 w-1/4" />
            )}
            
            {showDescription && (
              <div className="space-y-1">
                <Skeleton variant="text" className="h-3 w-full" />
                <Skeleton variant="text" className="h-3 w-5/6" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for form fields
export interface SkeletonFormProps {
  fields?: number;
  className?: string;
  showLabels?: boolean;
}

const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  className = '',
  showLabels = true,
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          {showLabels && (
            <Skeleton variant="text" className="h-4 w-24" />
          )}
          <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// Skeleton for dashboard stats
export interface SkeletonStatsProps {
  cards?: number;
  className?: string;
}

const SkeletonStats: React.FC<SkeletonStatsProps> = ({
  cards = 4,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="bg-background rounded-lg shadow-sm border border-border p-6">
          <div className="space-y-3">
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="text" className="h-8 w-1/3" />
            <Skeleton variant="text" className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export {
  Skeleton,
  SkeletonTable,
  SkeletonCard,
  SkeletonList,
  SkeletonForm,
  SkeletonStats,
}; 