'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusFlowDiagramProps {
  currentStatus: string;
  statuses: Array<{
    key: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  className?: string;
  showArrows?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusFlowDiagram({
  currentStatus,
  statuses,
  className,
  showArrows = true,
  size = 'md'
}: StatusFlowDiagramProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-2',
          step: 'p-2',
          icon: 'h-4 w-4',
          text: 'text-xs',
          arrow: 'h-3 w-3'
        };
      case 'lg':
        return {
          container: 'gap-4',
          step: 'p-4',
          icon: 'h-6 w-6',
          text: 'text-base',
          arrow: 'h-5 w-5'
        };
      default:
        return {
          container: 'gap-3',
          step: 'p-3',
          icon: 'h-5 w-5',
          text: 'text-sm',
          arrow: 'h-4 w-4'
        };
    }
  };

  const getStatusIndex = (status: string) => {
    return statuses.findIndex(s => s.key === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  const getStepStyles = (index: number, status: any) => {
    const isActive = index === currentIndex;
    const isCompleted = index < currentIndex;
    const isPending = index > currentIndex;

    if (isCompleted) {
      return {
        container: 'bg-green-50 border-green-200 text-green-700',
        icon: 'text-green-500',
        text: 'text-green-700 font-semibold'
      };
    }

    if (isActive) {
      return {
        container: 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-200',
        icon: 'text-blue-500',
        text: 'text-blue-700 font-semibold'
      };
    }

    return {
      container: 'bg-gray-50 border-gray-200 text-gray-500',
      icon: 'text-gray-400',
      text: 'text-gray-500'
    };
  };

  const getDefaultIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'available':
        return Clock;
      case 'accepted':
      case 'completed':
        return CheckCircle;
      case 'rejected':
      case 'refused':
        return XCircle;
      case 'expired':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className={cn('flex items-center', sizeStyles.container, className)}>
      {statuses.map((status, index) => {
        const IconComponent = status.icon || getDefaultIcon(status.key);
        const styles = getStepStyles(index, status);
        const isLast = index === statuses.length - 1;

        return (
          <React.Fragment key={status.key}>
            <div className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 transition-all duration-300',
              styles.container,
              sizeStyles.step
            )}>
              <IconComponent className={cn(styles.icon, sizeStyles.icon)} />
              <span className={cn(styles.text, sizeStyles.text)}>
                {status.label}
              </span>
            </div>
            
            {!isLast && showArrows && (
              <ArrowRight className={cn(
                'text-gray-400 flex-shrink-0',
                sizeStyles.arrow
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Specific flow diagrams for common use cases
export function RequestStatusFlow({ 
  currentStatus, 
  className 
}: { 
  currentStatus: string; 
  className?: string; 
}) {
  return (
    <StatusFlowDiagram
      currentStatus={currentStatus}
      statuses={[
        { key: 'OPEN', label: 'Ouverte', icon: Clock },
        { key: 'ACCEPTED', label: 'Acceptée', icon: CheckCircle },
        { key: 'CLOSED', label: 'Fermée', icon: XCircle },
        { key: 'EXPIRED', label: 'Expirée', icon: AlertTriangle }
      ]}
      className={className}
    />
  );
}

export function InterestStatusFlow({ 
  currentStatus, 
  className 
}: { 
  currentStatus: string; 
  className?: string; 
}) {
  return (
    <StatusFlowDiagram
      currentStatus={currentStatus}
      statuses={[
        { key: 'PENDING', label: 'En attente', icon: Clock },
        { key: 'ACCEPTED', label: 'Accepté', icon: CheckCircle },
        { key: 'REFUSED', label: 'Refusé', icon: XCircle }
      ]}
      className={className}
    />
  );
}

export function AnnouncementStatusFlow({ 
  currentStatus, 
  className 
}: { 
  currentStatus: string; 
  className?: string; 
}) {
  return (
    <StatusFlowDiagram
      currentStatus={currentStatus}
      statuses={[
        { key: 'AVAILABLE', label: 'Disponible', icon: Clock },
        { key: 'RESERVED', label: 'Réservée', icon: AlertTriangle },
        { key: 'EXPIRED', label: 'Expirée', icon: XCircle }
      ]}
      className={className}
    />
  );
}

export function SupportTicketStatusFlow({ 
  currentStatus, 
  className 
}: { 
  currentStatus: string; 
  className?: string; 
}) {
  return (
    <StatusFlowDiagram
      currentStatus={currentStatus}
      statuses={[
        { key: 'OPEN', label: 'Ouvert', icon: Clock },
        { key: 'IN_PROGRESS', label: 'En cours', icon: AlertTriangle },
        { key: 'RESOLVED', label: 'Résolu', icon: CheckCircle }
      ]}
      className={className}
    />
  );
}

