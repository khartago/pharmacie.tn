'use client';

import React from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, Archive, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Action {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'warning';
  disabled?: boolean;
}

export interface ActionMenuProps {
  actions: Action[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ActionMenu({
  actions,
  className,
  size = 'md'
}: ActionMenuProps) {
  const getIcon = (action: Action) => {
    if (action.icon) return action.icon;
    
    // Default icons based on action key
    switch (action.key) {
      case 'view':
        return Eye;
      case 'edit':
        return Edit;
      case 'delete':
        return Trash2;
      case 'archive':
        return Archive;
      case 'accept':
        return Check;
      case 'refuse':
        return X;
      default:
        return MoreHorizontal;
    }
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return 'text-red-600 hover:text-red-700 hover:bg-red-50';
      case 'warning':
        return 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50';
      default:
        return 'text-gray-700 hover:text-gray-900 hover:bg-gray-50';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-10 w-10';
      default:
        return 'h-9 w-9';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 hover:bg-muted",
            className
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action, index) => {
          const Icon = getIcon(action);
          const isDestructive = action.variant === 'destructive';
          const isWarning = action.variant === 'warning';
          
          return (
            <React.Fragment key={action.key}>
              <DropdownMenuItem
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "flex items-center space-x-2 cursor-pointer",
                  getVariantClasses(action.variant),
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
              {index < actions.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
