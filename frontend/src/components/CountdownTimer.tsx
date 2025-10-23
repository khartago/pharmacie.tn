'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiryDate: string | Date;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'urgent' | 'warning' | 'success';
}

export default function CountdownTimer({
  expiryDate,
  className,
  showIcon = true,
  size = 'md',
  variant = 'default'
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, total: difference };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  const getVariantStyles = () => {
    if (isExpired) {
      return {
        container: 'bg-red-50 border-red-200 text-red-700',
        icon: 'text-red-500',
        text: 'text-red-700',
        ring: 'text-red-500'
      };
    }

    const totalHours = timeLeft.hours + timeLeft.minutes / 60;

    if (totalHours <= 6) {
      return {
        container: 'bg-red-50 border-red-200 text-red-700',
        icon: 'text-red-500',
        text: 'text-red-700',
        ring: 'text-red-500'
      };
    } else if (totalHours <= 12) {
      return {
        container: 'bg-orange-50 border-orange-200 text-orange-700',
        icon: 'text-orange-500',
        text: 'text-orange-700',
        ring: 'text-orange-500'
      };
    } else {
      return {
        container: 'bg-green-50 border-green-200 text-green-700',
        icon: 'text-green-500',
        text: 'text-green-700',
        ring: 'text-green-500'
      };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-3 text-lg',
          icon: 'h-5 w-5',
          text: 'text-lg'
        };
      default:
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'h-4 w-4',
          text: 'text-sm'
        };
    }
  };

  const getIcon = () => {
    if (isExpired) return <AlertTriangle className={getSizeStyles().icon} />;
    if (timeLeft.total <= 6 * 60 * 60 * 1000) return <AlertTriangle className={getSizeStyles().icon} />;
    return <Clock className={getSizeStyles().icon} />;
  };

  const styles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (isExpired) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 rounded-lg border font-medium',
        styles.container,
        sizeStyles.container,
        className
      )}>
        {showIcon && getIcon()}
        <span className={cn('font-semibold', styles.text, sizeStyles.text)}>
          Expiré
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-lg border font-medium',
      styles.container,
      sizeStyles.container,
      className
    )}>
      {showIcon && getIcon()}
      <div className="flex items-center gap-1">
        {timeLeft.hours > 0 && (
          <span className={cn('font-semibold', styles.text, sizeStyles.text)}>
            {timeLeft.hours}h
          </span>
        )}
        <span className={cn('font-semibold', styles.text, sizeStyles.text)}>
          {timeLeft.minutes}m
        </span>
        <span className={cn('font-semibold', styles.text, sizeStyles.text)}>
          {timeLeft.seconds}s
        </span>
      </div>
    </div>
  );
}

// Circular Progress Ring Component
interface CircularCountdownProps {
  expiryDate: string | Date;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularCountdown({
  expiryDate,
  size = 40,
  strokeWidth = 3,
  className
}: CircularCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, total: difference };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate progress (0-1) based on 24 hours
  const totalHours = timeLeft.hours + timeLeft.minutes / 60;
  const progress = Math.max(0, Math.min(1, totalHours / 24));
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const getColor = () => {
    if (isExpired) return '#ef4444'; // red-500
    if (totalHours <= 6) return '#ef4444'; // red-500
    if (totalHours <= 12) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  };

  if (isExpired) {
    return (
      <div className={cn('relative', className)}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={0}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-semibold" style={{ color: getColor() }}>
            {timeLeft.hours > 0 ? `${timeLeft.hours}h` : `${timeLeft.minutes}m`}
          </div>
        </div>
      </div>
    </div>
  );
}