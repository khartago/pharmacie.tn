'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
  showPercentage?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export default function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 3,
  color = 'green',
  showPercentage = true,
  label,
  className,
  animated = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    switch (color) {
      case 'green':
        return '#22c55e';
      case 'blue':
        return '#3b82f6';
      case 'purple':
        return '#8b5cf6';
      case 'orange':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
      case 'gray':
        return '#6b7280';
      default:
        return '#22c55e';
    }
  };

  const getBackgroundColor = () => {
    switch (color) {
      case 'green':
        return '#dcfce7';
      case 'blue':
        return '#dbeafe';
      case 'purple':
        return '#ede9fe';
      case 'orange':
        return '#fef3c7';
      case 'red':
        return '#fee2e2';
      case 'gray':
        return '#f3f4f6';
      default:
        return '#dcfce7';
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getBackgroundColor()}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-1000 ease-out',
            animated && 'animate-pulse'
          )}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-xs font-semibold" style={{ color: getColor() }}>
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-500 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// Countdown progress ring
interface CountdownProgressRingProps {
  remaining: number; // in seconds
  total: number; // in seconds
  size?: number;
  strokeWidth?: number;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
  showTime?: boolean;
  label?: string;
  className?: string;
  urgentThreshold?: number; // seconds
}

export function CountdownProgressRing({
  remaining,
  total,
  size = 40,
  strokeWidth = 3,
  color = 'green',
  showTime = true,
  label,
  className,
  urgentThreshold = 3600 // 1 hour
}: CountdownProgressRingProps) {
  const progress = (remaining / total) * 100;
  const isUrgent = remaining <= urgentThreshold;
  
  const getColor = () => {
    if (isUrgent) return 'red';
    if (remaining <= urgentThreshold * 2) return 'orange';
    return color;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      color={getColor()}
      showPercentage={false}
      label={showTime ? formatTime(remaining) : label}
      className={className}
      animated={isUrgent}
    />
  );
}

// Multi-segment progress ring
interface MultiSegmentProgressRingProps {
  segments: Array<{
    value: number;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
    label?: string;
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
}

export function MultiSegmentProgressRing({
  segments,
  size = 40,
  strokeWidth = 3,
  className,
  showLabels = true
}: MultiSegmentProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  let currentOffset = 0;

  const getColor = (color: string) => {
    switch (color) {
      case 'green':
        return '#22c55e';
      case 'blue':
        return '#3b82f6';
      case 'purple':
        return '#8b5cf6';
      case 'orange':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
      case 'gray':
        return '#6b7280';
      default:
        return '#22c55e';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Segments */}
        {segments.map((segment, index) => {
          const segmentProgress = (segment.value / total) * 100;
          const segmentCircumference = (segmentProgress / 100) * circumference;
          const segmentOffset = circumference - segmentCircumference;
          
          const segmentElement = (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getColor(segment.color)}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={segmentOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
          
          currentOffset += segmentCircumference;
          return segmentElement;
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">
          {total}
        </span>
        {showLabels && (
          <div className="mt-1 space-y-1">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getColor(segment.color) }}
                />
                <span className="text-xs text-gray-600">
                  {segment.label || `${segment.value}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Status progress ring
interface StatusProgressRingProps {
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function StatusProgressRing({
  status,
  size = 40,
  strokeWidth = 3,
  className,
  label
}: StatusProgressRingProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { progress: 25, color: 'orange' as const, label: 'En attente' };
      case 'in-progress':
        return { progress: 50, color: 'blue' as const, label: 'En cours' };
      case 'completed':
        return { progress: 100, color: 'green' as const, label: 'Terminé' };
      case 'error':
        return { progress: 0, color: 'red' as const, label: 'Erreur' };
      default:
        return { progress: 0, color: 'gray' as const, label: 'Inconnu' };
    }
  };

  const config = getStatusConfig();

  return (
    <ProgressRing
      progress={config.progress}
      size={size}
      strokeWidth={strokeWidth}
      color={config.color}
      label={label || config.label}
      className={className}
      animated={status === 'in-progress'}
    />
  );
}

