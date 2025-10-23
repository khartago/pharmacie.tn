'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardGradientProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon: LucideIcon;
  gradient?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCardGradient({
  title,
  value,
  change,
  icon: Icon,
  gradient = 'green',
  size = 'md',
  className,
  onClick,
  loading = false
}: StatCardGradientProps) {
  const getGradientStyles = () => {
    switch (gradient) {
      case 'green':
        return 'from-green-50 to-green-100 border-green-200';
      case 'blue':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'purple':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'orange':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'red':
        return 'from-red-50 to-red-100 border-red-200';
      case 'gray':
        return 'from-gray-50 to-gray-100 border-gray-200';
      default:
        return 'from-green-50 to-green-100 border-green-200';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'h-5 w-5',
          title: 'text-xs',
          value: 'text-lg',
          change: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'h-8 w-8',
          title: 'text-base',
          value: 'text-3xl',
          change: 'text-sm'
        };
      default:
        return {
          container: 'p-6',
          icon: 'h-6 w-6',
          title: 'text-sm',
          value: 'text-2xl',
          change: 'text-xs'
        };
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    if (change.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (change.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    if (change.value > 0) return 'text-green-600';
    if (change.value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const sizeStyles = getSizeStyles();

  if (loading) {
    return (
      <div className={cn(
        'bg-gradient-to-br rounded-lg border-2 animate-pulse',
        getGradientStyles(),
        sizeStyles.container,
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-20" />
            <div className="h-8 bg-gray-300 rounded w-16" />
          </div>
          <div className="h-6 w-6 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        getGradientStyles(),
        sizeStyles.container,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className={cn('font-medium text-gray-600', sizeStyles.title)}>
            {title}
          </p>
          <p className={cn('font-bold text-gray-900', sizeStyles.value)}>
            {value}
          </p>
          {change && (
            <div className={cn('flex items-center gap-1', sizeStyles.change)}>
              {getChangeIcon()}
              <span className={getChangeColor()}>
                {Math.abs(change.value)}% {change.period}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <Icon className={cn('text-gray-600', sizeStyles.icon)} />
        </div>
      </div>
    </div>
  );
}

// Grid of stat cards
interface StatCardGridProps {
  cards: Array<{
    title: string;
    value: string | number;
    change?: {
      value: number;
      period: string;
    };
    icon: LucideIcon;
    gradient?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
    onClick?: () => void;
  }>;
  columns?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
}

export function StatCardGrid({
  cards,
  columns = 4,
  size = 'md',
  className,
  loading = false
}: StatCardGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-4';
    }
  };

  if (loading) {
    return (
      <div className={cn('grid gap-4', getGridCols(), className)}>
        {Array.from({ length: columns }).map((_, index) => (
          <StatCardGradient
            key={index}
            title=""
            value=""
            icon={TrendingUp}
            loading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>
      {cards.map((card, index) => (
        <StatCardGradient
          key={index}
          {...card}
          size={size}
        />
      ))}
    </div>
  );
}

// Specific stat cards for common metrics
export function AnnouncementStatCard({
  count,
  change,
  onClick
}: {
  count: number;
  change?: { value: number; period: string };
  onClick?: () => void;
}) {
  return (
    <StatCardGradient
      title="Annonces actives"
      value={count}
      change={change}
      icon={TrendingUp}
      gradient="green"
      onClick={onClick}
    />
  );
}

export function RequestStatCard({
  count,
  change,
  onClick
}: {
  count: number;
  change?: { value: number; period: string };
  onClick?: () => void;
}) {
  return (
    <StatCardGradient
      title="Demandes ouvertes"
      value={count}
      change={change}
      icon={TrendingUp}
      gradient="blue"
      onClick={onClick}
    />
  );
}

export function InterestStatCard({
  count,
  change,
  onClick
}: {
  count: number;
  change?: { value: number; period: string };
  onClick?: () => void;
}) {
  return (
    <StatCardGradient
      title="Intérêts en attente"
      value={count}
      change={change}
      icon={TrendingUp}
      gradient="purple"
      onClick={onClick}
    />
  );
}

export function NotificationStatCard({
  count,
  change,
  onClick
}: {
  count: number;
  change?: { value: number; period: string };
  onClick?: () => void;
}) {
  return (
    <StatCardGradient
      title="Notifications"
      value={count}
      change={change}
      icon={TrendingUp}
      gradient="orange"
      onClick={onClick}
    />
  );
}

export function ExpiredStatCard({
  count,
  change,
  onClick
}: {
  count: number;
  change?: { value: number; period: string };
  onClick?: () => void;
}) {
  return (
    <StatCardGradient
      title="Expirés"
      value={count}
      change={change}
      icon={TrendingUp}
      gradient="red"
      onClick={onClick}
    />
  );
}

export function SuccessRateStatCard({
  rate,
  change,
  onClick
}: {
  rate: number;
  change?: { value: number; period: string };
  onClick?: () => void;
}) {
  return (
    <StatCardGradient
      title="Taux de succès"
      value={`${rate}%`}
      change={change}
      icon={TrendingUp}
      gradient="green"
      onClick={onClick}
    />
  );
}

