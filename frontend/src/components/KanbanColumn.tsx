'use client';

import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  onAdd?: () => void;
  showAddButton?: boolean;
  showCount?: boolean;
  emptyState?: React.ReactNode;
}

export default function KanbanColumn({
  title,
  count = 0,
  children,
  className,
  color = 'blue',
  onAdd,
  showAddButton = false,
  showCount = true,
  emptyState
}: KanbanColumnProps) {
  const getColorStyles = () => {
    switch (color) {
      case 'blue':
        return {
          header: 'bg-blue-50 border-blue-200 text-blue-700',
          accent: 'bg-blue-500',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'green':
        return {
          header: 'bg-green-50 border-green-200 text-green-700',
          accent: 'bg-green-500',
          badge: 'bg-green-100 text-green-700'
        };
      case 'yellow':
        return {
          header: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          accent: 'bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-700'
        };
      case 'red':
        return {
          header: 'bg-red-50 border-red-200 text-red-700',
          accent: 'bg-red-500',
          badge: 'bg-red-100 text-red-700'
        };
      case 'purple':
        return {
          header: 'bg-purple-50 border-purple-200 text-purple-700',
          accent: 'bg-purple-500',
          badge: 'bg-purple-100 text-purple-700'
        };
      case 'gray':
        return {
          header: 'bg-gray-50 border-gray-200 text-gray-700',
          accent: 'bg-gray-500',
          badge: 'bg-gray-100 text-gray-700'
        };
      default:
        return {
          header: 'bg-blue-50 border-blue-200 text-blue-700',
          accent: 'bg-blue-500',
          badge: 'bg-blue-100 text-blue-700'
        };
    }
  };

  const styles = getColorStyles();
  const hasItems = React.Children.count(children) > 0;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-t-lg border-b-2',
        styles.header
      )}>
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', styles.accent)} />
          <h3 className="font-semibold text-sm">{title}</h3>
          {showCount && (
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              styles.badge
            )}>
              {count}
            </span>
          )}
        </div>
        
        {showAddButton && onAdd && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
            className="h-6 w-6 p-0 hover:bg-white/50"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 bg-gray-50/50 rounded-b-lg min-h-[200px]">
        {hasItems ? (
          <div className="space-y-2">
            {children}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {emptyState || (
              <div className="text-gray-500">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                  <MoreHorizontal className="h-6 w-6" />
                </div>
                <p className="text-sm">Aucun élément</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Board Container
interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <div className={cn(
      'flex gap-4 overflow-x-auto pb-4',
      className
    )}>
      {children}
    </div>
  );
}

// Kanban Card Component
interface KanbanCardProps {
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: () => void;
}

export function KanbanCard({
  children,
  className,
  draggable = false,
  onDragStart,
  onDragEnd,
  onClick
}: KanbanCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Specific Kanban for Interests
export function InterestKanban({
  pendingInterests,
  acceptedInterests,
  refusedInterests,
  onAccept,
  onRefuse,
  onView
}: {
  pendingInterests: any[];
  acceptedInterests: any[];
  refusedInterests: any[];
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onView: (id: string) => void;
}) {
  return (
    <KanbanBoard>
      <KanbanColumn
        title="En attente"
        count={pendingInterests.length}
        color="yellow"
        showCount={true}
      >
        {pendingInterests.map((interest) => (
          <KanbanCard key={interest.id} onClick={() => onView(interest.id)}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{interest.pharmacyName}</span>
                <span className="text-xs text-gray-500">{interest.createdAt}</span>
              </div>
              <p className="text-sm text-gray-600">{interest.medicineName}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(interest.id);
                  }}
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefuse(interest.id);
                  }}
                >
                  Refuser
                </Button>
              </div>
            </div>
          </KanbanCard>
        ))}
      </KanbanColumn>

      <KanbanColumn
        title="Acceptés"
        count={acceptedInterests.length}
        color="green"
        showCount={true}
      >
        {acceptedInterests.map((interest) => (
          <KanbanCard key={interest.id} onClick={() => onView(interest.id)}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{interest.pharmacyName}</span>
                <span className="text-xs text-gray-500">{interest.createdAt}</span>
              </div>
              <p className="text-sm text-gray-600">{interest.medicineName}</p>
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-medium">Accepté</span>
              </div>
            </div>
          </KanbanCard>
        ))}
      </KanbanColumn>

      <KanbanColumn
        title="Refusés"
        count={refusedInterests.length}
        color="red"
        showCount={true}
      >
        {refusedInterests.map((interest) => (
          <KanbanCard key={interest.id} onClick={() => onView(interest.id)}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{interest.pharmacyName}</span>
                <span className="text-xs text-gray-500">{interest.createdAt}</span>
              </div>
              <p className="text-sm text-gray-600">{interest.medicineName}</p>
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs font-medium">Refusé</span>
              </div>
            </div>
          </KanbanCard>
        ))}
      </KanbanColumn>
    </KanbanBoard>
  );
}

