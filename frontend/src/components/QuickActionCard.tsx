'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  badge?: string | number;
  gradient?: boolean;
}

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  badge,
  gradient = false
}: QuickActionCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          description: 'text-green-600'
        };
      case 'secondary':
        return {
          container: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          description: 'text-blue-600'
        };
      case 'success':
        return {
          container: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200',
          icon: 'text-emerald-600',
          title: 'text-emerald-800',
          description: 'text-emerald-600'
        };
      case 'warning':
        return {
          container: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          description: 'text-orange-600'
        };
      case 'danger':
        return {
          container: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          description: 'text-red-600'
        };
      default:
        return {
          container: 'bg-white border-gray-200 hover:bg-gray-50',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          description: 'text-gray-600'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-5 w-5',
          title: 'text-sm font-semibold',
          description: 'text-xs',
          badge: 'text-xs px-2 py-1'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'h-8 w-8',
          title: 'text-lg font-semibold',
          description: 'text-sm',
          badge: 'text-sm px-3 py-1'
        };
      default:
        return {
          container: 'p-4',
          icon: 'h-6 w-6',
          title: 'text-base font-semibold',
          description: 'text-sm',
          badge: 'text-xs px-2 py-1'
        };
    }
  };

  const styles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-auto flex flex-col items-center text-center rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        styles.container,
        sizeStyles.container,
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        gradient && 'bg-gradient-to-br',
        className
      )}
    >
      <div className="relative">
        <Icon className={cn(styles.icon, sizeStyles.icon)} />
        {badge && (
          <span className={cn(
            'absolute -top-2 -right-2 bg-red-500 text-white rounded-full font-bold',
            sizeStyles.badge
          )}>
            {badge}
          </span>
        )}
      </div>
      
      <div className="mt-2 space-y-1">
        <h3 className={cn(styles.title, sizeStyles.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn(styles.description, sizeStyles.description)}>
            {description}
          </p>
        )}
      </div>
    </Button>
  );
}

// Grid of Quick Action Cards
interface QuickActionGridProps {
  actions: Array<{
    title: string;
    description?: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    disabled?: boolean;
    badge?: string | number;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActionGrid({
  actions,
  columns = 3,
  className
}: QuickActionGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 4:
        return 'grid-cols-4';
      default:
        return 'grid-cols-3';
    }
  };

  return (
    <div className={cn(
      'grid gap-4',
      getGridCols(),
      className
    )}>
      {actions.map((action, index) => (
        <QuickActionCard
          key={index}
          {...action}
        />
      ))}
    </div>
  );
}

// Floating Action Button
interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  className
}: FloatingActionButtonProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-12 w-12';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-14 w-14';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50';
      default:
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5';
      case 'lg':
        return 'h-7 w-7';
      default:
        return 'h-6 w-6';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95',
        getPositionStyles(),
        getSizeStyles(),
        getVariantStyles(),
        className
      )}
    >
      <Icon className={getIconSize()} />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </Button>
  );
}

