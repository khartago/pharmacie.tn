'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  // Handle undefined/null status
  if (!status) {
    return (
      <Badge variant="outline" className={cn('font-medium', className)}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span>Non défini</span>
        </div>
      </Badge>
    );
  }

  // Status display text
  const getStatusText = (status: string) => {
    if (!status) return 'Non défini';
    
    const statusMap: Record<string, string> = {
      ACTIVE: 'Actif',
      PENDING: 'En attente',
      ARCHIVED: 'Archivé',
      REFUSED: 'Refusé',
      EXPIRED: 'Expiré',
      AVAILABLE: 'Disponible',
      RESERVED: 'Réservé',
      OPEN: 'Ouvert',
      ACCEPTED: 'Accepté',
      CLOSED: 'Fermé',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      RETURN_PENDING: 'Retour en attente',
      RETURN_ACCEPTED: 'Retour accepté',
      RETURN_REFUSED: 'Retour refusé',
      INACTIVE: 'Inactif',
      SUSPENDED: 'Suspendu',
    };

    return statusMap[status.toUpperCase()] || status;
  };

  // Get variant based on status
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!status) return 'outline';
    const upperStatus = status.toUpperCase();
    
    // Success states - green (default variant with green styling)
    if (['ACTIVE', 'ACCEPTED', 'RESOLVED', 'AVAILABLE', 'RETURN_ACCEPTED'].includes(upperStatus)) {
      return 'default';
    }
    
    // Warning/pending states - amber
    if (['PENDING', 'IN_PROGRESS', 'RESERVED', 'RETURN_PENDING', 'OPEN'].includes(upperStatus)) {
      return 'secondary';
    }
    
    // Error/negative states - red
    if (['REFUSED', 'EXPIRED', 'CLOSED', 'RETURN_REFUSED', 'INACTIVE', 'SUSPENDED'].includes(upperStatus)) {
      return 'destructive';
    }
    
    // Default - neutral
    return 'outline';
  };

  // Get custom color classes for specific statuses
  const getCustomClasses = (status: string) => {
    if (!status) return '';
    const upperStatus = status.toUpperCase();
    
    // Success states - green
    if (['ACTIVE', 'ACCEPTED', 'RESOLVED', 'AVAILABLE', 'RETURN_ACCEPTED'].includes(upperStatus)) {
      return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
    }
    
    // Warning/pending states - amber
    if (['PENDING', 'IN_PROGRESS', 'RESERVED', 'RETURN_PENDING', 'OPEN'].includes(upperStatus)) {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
    }
    
    // Error states - red
    if (['REFUSED', 'EXPIRED', 'CLOSED', 'RETURN_REFUSED', 'INACTIVE', 'SUSPENDED'].includes(upperStatus)) {
      return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
    }
    
    // Archived - gray
    if (['ARCHIVED'].includes(upperStatus)) {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
    }
    
    return '';
  };

  const variant = getStatusVariant(status);
  const customClasses = getCustomClasses(status);
  const upperStatus = status?.toUpperCase() || '';

  return (
    <Badge 
      variant={variant}
      className={cn(
        'font-medium transition-all duration-200 hover:scale-105',
        customClasses,
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {/* Status indicator dot */}
        <div className={cn(
          'w-1.5 h-1.5 rounded-full',
          // Success states - green dot
          (['ACTIVE', 'ACCEPTED', 'RESOLVED', 'AVAILABLE', 'RETURN_ACCEPTED'].includes(upperStatus)) ? 'bg-green-500 animate-status-pulse' :
          // Warning/pending states - yellow dot
          (['PENDING', 'IN_PROGRESS', 'RESERVED', 'RETURN_PENDING', 'OPEN'].includes(upperStatus)) ? 'bg-yellow-500 animate-status-pulse' :
          // Error states - red dot
          (['REFUSED', 'EXPIRED', 'CLOSED', 'RETURN_REFUSED', 'INACTIVE', 'SUSPENDED'].includes(upperStatus)) ? 'bg-red-500 animate-status-pulse' :
          // Default - gray dot
          'bg-gray-400'
        )} />
        <span>{getStatusText(status)}</span>
      </div>
    </Badge>
  );
};

export default StatusBadge;