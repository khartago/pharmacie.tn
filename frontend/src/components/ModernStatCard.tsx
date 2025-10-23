'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';

export interface ModernStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  loading?: boolean;
  className?: string;
  description?: string;
  onClick?: () => void;
}

export default function ModernStatCard({
  title,
  value,
  icon: Icon,
  trend,
  loading = false,
  className,
  description,
  onClick
}: ModernStatCardProps) {
  if (loading) {
    return (
      <Card className={cn("hover:shadow-lg transition-all duration-200", className)}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer",
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                {trend.period && (
                  <span className="text-xs text-muted-foreground">
                    {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
