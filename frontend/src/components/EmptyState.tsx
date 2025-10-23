'use client';

import React from 'react';
import { 
  FileText,
  Inbox,
  Search,
  AlertTriangle,
  Plus,
  Folder,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline';
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Aucune donnée disponible',
  description = 'Il n\'y a actuellement aucune donnée à afficher.',
  icon: Icon = Inbox,
  action,
  size = 'md',
  className = '',
}) => {
  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-8',
          icon: 'w-12 h-12',
          title: 'text-lg',
          description: 'text-sm',
        };
      case 'md':
        return {
          container: 'py-12',
          icon: 'w-16 h-16',
          title: 'text-xl',
          description: 'text-base',
        };
      case 'lg':
        return {
          container: 'py-16',
          icon: 'w-20 h-20',
          title: 'text-2xl',
          description: 'text-lg',
        };
      default:
        return {
          container: 'py-12',
          icon: 'w-16 h-16',
          title: 'text-xl',
          description: 'text-base',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`text-center ${sizeClasses.container} ${className} animate-fade-in`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className={`
          ${sizeClasses.icon} text-muted-foreground bg-gradient-to-br from-muted to-muted/50 rounded-full
          flex items-center justify-center shadow-sm animate-float
        `}>
          <Icon className="w-1/2 h-1/2" />
        </div>
      </div>

      {/* Title */}
      <h3 className={`${sizeClasses.title} font-medium text-foreground mb-2`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`${sizeClasses.description} text-muted-foreground max-w-md mx-auto mb-6`}>
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
export const EmptyStates = {
  // Generic empty state
  Generic: (props: Omit<EmptyStateProps, 'icon'>) => (
    <EmptyState icon={Inbox} {...props} />
  ),

  // No search results
  NoSearchResults: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={Search}
      title="Aucun résultat trouvé"
      description="Essayez de modifier vos critères de recherche ou de vérifier l'orthographe."
      {...props}
    />
  ),

  // No data available
  NoData: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={FileText}
      title="Aucune donnée disponible"
      description="Il n'y a actuellement aucune donnée à afficher dans cette section."
      {...props}
    />
  ),

  // No items in list
  NoItems: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={Folder}
      title="Liste vide"
      description="Cette liste ne contient aucun élément pour le moment."
      {...props}
    />
  ),

  // No users/members
  NoUsers: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={Users}
      title="Aucun utilisateur"
      description="Aucun utilisateur n'a été trouvé dans cette section."
      {...props}
    />
  ),

  // No settings/configuration
  NoSettings: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={Settings}
      title="Aucune configuration"
      description="Aucune configuration n'est disponible pour le moment."
      {...props}
    />
  ),

  // Error state
  Error: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={AlertTriangle}
      title="Une erreur est survenue"
      description="Impossible de charger les données. Veuillez réessayer plus tard."
      {...props}
    />
  ),
};

export default EmptyState;