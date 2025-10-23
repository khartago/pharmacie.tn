'use client';

import React from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users,
  ShoppingCart,
  Heart,
  Bell,
  HelpCircle,
  Settings,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateIllustrationProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search' | 'error' | 'success' | 'warning';
}

export default function EmptyStateIllustration({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  variant = 'default'
}: EmptyStateIllustrationProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'h-8 w-8',
          title: 'text-sm font-semibold',
          description: 'text-xs',
          button: 'text-xs px-3 py-1'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'h-16 w-16',
          title: 'text-xl font-semibold',
          description: 'text-base',
          button: 'text-base px-6 py-3'
        };
      default:
        return {
          container: 'p-6',
          icon: 'h-12 w-12',
          title: 'text-base font-semibold',
          description: 'text-sm',
          button: 'text-sm px-4 py-2'
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return {
          icon: 'text-blue-500',
          title: 'text-gray-800',
          description: 'text-gray-600'
        };
      case 'error':
        return {
          icon: 'text-red-500',
          title: 'text-red-800',
          description: 'text-red-600'
        };
      case 'success':
        return {
          icon: 'text-green-500',
          title: 'text-green-800',
          description: 'text-green-600'
        };
      case 'warning':
        return {
          icon: 'text-orange-500',
          title: 'text-orange-800',
          description: 'text-orange-600'
        };
      default:
        return {
          icon: 'text-gray-400',
          title: 'text-gray-800',
          description: 'text-gray-600'
        };
    }
  };

  const styles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeStyles.container,
      className
    )}>
      {Icon && (
        <div className={cn(
          'mb-4 p-3 rounded-full bg-gray-100',
          styles.icon
        )}>
          <Icon className={sizeStyles.icon} />
        </div>
      )}
      
      <h3 className={cn(
        'mb-2',
        styles.title,
        sizeStyles.title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'mb-6 max-w-md',
          styles.description,
          sizeStyles.description
        )}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className={sizeStyles.button}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className={sizeStyles.button}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Predefined empty states for common scenarios
export function EmptyAnnouncements({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyStateIllustration
      icon={FileText}
      title="Aucune annonce"
      description="Vous n'avez pas encore créé d'annonces. Créez votre première annonce pour commencer à échanger des médicaments."
      action={{
        label: 'Créer une annonce',
        onClick: onCreate,
        variant: 'primary'
      }}
    />
  );
}

export function EmptyRequests({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyStateIllustration
      icon={ShoppingCart}
      title="Aucune demande"
      description="Vous n'avez pas encore créé de demandes. Créez votre première demande pour rechercher des médicaments."
      action={{
        label: 'Créer une demande',
        onClick: onCreate,
        variant: 'primary'
      }}
    />
  );
}

export function EmptyInterests() {
  return (
    <EmptyStateIllustration
      icon={Heart}
      title="Aucun intérêt"
      description="Aucune pharmacie n'a encore exprimé d'intérêt pour vos annonces."
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyStateIllustration
      icon={Bell}
      title="Aucune notification"
      description="Vous n'avez pas de nouvelles notifications pour le moment."
    />
  );
}

export function EmptySupportTickets({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyStateIllustration
      icon={HelpCircle}
      title="Aucun ticket de support"
      description="Vous n'avez pas encore créé de tickets de support. Créez un ticket si vous avez besoin d'aide."
      action={{
        label: 'Créer un ticket',
        onClick: onCreate,
        variant: 'primary'
      }}
    />
  );
}

export function EmptySearchResults({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyStateIllustration
      icon={Search}
      title="Aucun résultat trouvé"
      description="Aucun élément ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
      action={{
        label: 'Effacer les filtres',
        onClick: onClearFilters,
        variant: 'secondary'
      }}
      variant="search"
    />
  );
}

export function EmptyArchives() {
  return (
    <EmptyStateIllustration
      icon={Archive}
      title="Aucun élément archivé"
      description="Vous n'avez pas encore d'éléments archivés."
    />
  );
}

export function EmptyRetours() {
  return (
    <EmptyStateIllustration
      icon={FileText}
      title="Aucun retour disponible"
      description="Aucune pharmacie n'a encore partagé d'annonces avec les fournisseurs."
    />
  );
}

export function EmptyResponses() {
  return (
    <EmptyStateIllustration
      icon={Users}
      title="Aucune réponse"
      description="Aucune pharmacie n'a encore répondu à vos demandes."
    />
  );
}

export function EmptyExpired() {
  return (
    <EmptyStateIllustration
      icon={Clock}
      title="Aucun élément expiré"
      description="Vous n'avez pas d'éléments expirés pour le moment."
    />
  );
}

export function EmptyAccepted() {
  return (
    <EmptyStateIllustration
      icon={CheckCircle}
      title="Aucun élément accepté"
      description="Vous n'avez pas encore d'éléments acceptés."
    />
  );
}

export function EmptyPending() {
  return (
    <EmptyStateIllustration
      icon={AlertCircle}
      title="Aucun élément en attente"
      description="Vous n'avez pas d'éléments en attente pour le moment."
    />
  );
}

export function EmptyRejected() {
  return (
    <EmptyStateIllustration
      icon={Trash2}
      title="Aucun élément refusé"
      description="Vous n'avez pas d'éléments refusés pour le moment."
    />
  );
}

export function EmptyHidden() {
  return (
    <EmptyStateIllustration
      icon={EyeOff}
      title="Aucun élément masqué"
      description="Vous n'avez pas d'éléments masqués pour le moment."
    />
  );
}

export function EmptyVisible() {
  return (
    <EmptyStateIllustration
      icon={Eye}
      title="Aucun élément visible"
      description="Vous n'avez pas d'éléments visibles pour le moment."
    />
  );
}

