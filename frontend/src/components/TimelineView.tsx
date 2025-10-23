'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  FileText, 
  ShoppingCart,
  Heart,
  Bell,
  HelpCircle,
  Archive,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';

interface TimelineItemProps {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
  icon?: React.ComponentType<{ className?: string }>;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  className?: string;
}

export function TimelineItem({
  title,
  description,
  timestamp,
  type,
  icon: Icon,
  user,
  metadata,
  className
}: TimelineItemProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          dot: 'bg-green-500 border-green-500',
          line: 'bg-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          description: 'text-green-600'
        };
      case 'warning':
        return {
          dot: 'bg-orange-500 border-orange-500',
          line: 'bg-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          description: 'text-orange-600'
        };
      case 'error':
        return {
          dot: 'bg-red-500 border-red-500',
          line: 'bg-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          description: 'text-red-600'
        };
      case 'action':
        return {
          dot: 'bg-blue-500 border-blue-500',
          line: 'bg-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          description: 'text-blue-600'
        };
      default:
        return {
          dot: 'bg-gray-500 border-gray-500',
          line: 'bg-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          description: 'text-gray-600'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'action':
        return User;
      default:
        return Clock;
    }
  };

  const styles = getTypeStyles();
  const IconComponent = Icon || getDefaultIcon();

  return (
    <div className={cn('relative flex gap-4', className)}>
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-3 h-3 rounded-full border-2 flex items-center justify-center',
          styles.dot
        )}>
          <IconComponent className="h-2 w-2 text-white" />
        </div>
        <div className={cn('w-0.5 h-8 mt-2', styles.line)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={cn('font-semibold text-sm', styles.title)}>
              {title}
            </h4>
            {description && (
              <p className={cn('text-sm mt-1', styles.description)}>
                {description}
              </p>
            )}
            {user && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600">{user.name}</span>
              </div>
            )}
            {metadata && (
              <div className="mt-2 space-y-1">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="text-xs text-gray-500">
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
          <time className="text-xs text-gray-500 ml-4">
            {formatRelativeTime(timestamp)}
          </time>
        </div>
      </div>
    </div>
  );
}

// Timeline container
interface TimelineViewProps {
  items: TimelineItemProps[];
  className?: string;
  showDates?: boolean;
  groupByDate?: boolean;
}

export default function TimelineView({
  items,
  className,
  showDates = false,
  groupByDate = false
}: TimelineViewProps) {
  if (groupByDate) {
    const groupedItems = items.reduce((groups, item) => {
      const date = new Date(item.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {} as Record<string, TimelineItemProps[]>);

    return (
      <div className={cn('space-y-6', className)}>
        {Object.entries(groupedItems).map(([date, dateItems]) => (
          <div key={date}>
            <div className="sticky top-0 bg-white py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                {formatDate(date)}
              </h3>
            </div>
            <div className="space-y-0">
              {dateItems.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  {...item}
                  className={index === dateItems.length - 1 ? 'pb-0' : ''}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          {...item}
          className={index === items.length - 1 ? 'pb-0' : ''}
        />
      ))}
    </div>
  );
}

// Specific timeline for announcements
export function AnnouncementTimeline({ 
  announcementId, 
  activities 
}: { 
  announcementId: string; 
  activities: any[]; 
}) {
  const timelineItems = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: activity.createdAt,
    type: activity.type as 'info' | 'success' | 'warning' | 'error' | 'action',
    user: activity.user ? { name: activity.user.name } : undefined,
    metadata: activity.metadata
  }));

  return <TimelineView items={timelineItems} />;
}

// Specific timeline for requests
export function RequestTimeline({ 
  requestId, 
  activities 
}: { 
  requestId: string; 
  activities: any[]; 
}) {
  const timelineItems = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: activity.createdAt,
    type: activity.type as 'info' | 'success' | 'warning' | 'error' | 'action',
    user: activity.user ? { name: activity.user.name } : undefined,
    metadata: activity.metadata
  }));

  return <TimelineView items={timelineItems} />;
}

// Specific timeline for interests
export function InterestTimeline({ 
  interestId, 
  activities 
}: { 
  interestId: string; 
  activities: any[]; 
}) {
  const timelineItems = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: activity.createdAt,
    type: activity.type as 'info' | 'success' | 'warning' | 'error' | 'action',
    user: activity.user ? { name: activity.user.name } : undefined,
    metadata: activity.metadata
  }));

  return <TimelineView items={timelineItems} />;
}

// Activity timeline for dashboard
export function ActivityTimeline({ 
  activities 
}: { 
  activities: any[]; 
}) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return FileText;
      case 'REQUEST':
        return ShoppingCart;
      case 'INTEREST':
        return Heart;
      case 'NOTIFICATION':
        return Bell;
      case 'SUPPORT':
        return HelpCircle;
      case 'ARCHIVE':
        return Archive;
      case 'DELETE':
        return Trash2;
      default:
        return Clock;
    }
  };

  const getActivityType = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
      case 'REQUEST':
      case 'INTEREST':
        return 'action';
      case 'NOTIFICATION':
        return 'info';
      case 'SUPPORT':
        return 'warning';
      case 'ARCHIVE':
      case 'DELETE':
        return 'error';
      default:
        return 'info';
    }
  };

  const timelineItems = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: activity.createdAt,
    type: getActivityType(activity.type),
    icon: getActivityIcon(activity.type),
    user: activity.user ? { name: activity.user.name } : undefined,
    metadata: {
      type: activity.type,
      status: activity.status
    }
  }));

  return <TimelineView items={timelineItems} groupByDate={true} />;
}
