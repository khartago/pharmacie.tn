'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationsAPI, Notification } from '@/lib/api';
import socketService from '@/lib/socket';
import { cn } from '@/lib/utils';

export interface NotificationDropdownProps {
  className?: string;
  maxNotifications?: number;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = '',
  maxNotifications = 10,
  onNotificationClick,
  onMarkAllAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Get notifications URL based on user role
  const getNotificationsUrl = () => {
    if (!user?.role?.name) return '/dashboard';
    
    switch (user.role.name) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'PHARMACY':
        return '/dashboard/pharmacie/notifications';
      case 'SUPPLIER':
        return '/dashboard/fournisseur/notifications';
      default:
        return '/dashboard';
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await NotificationsAPI.getAll({ limit: maxNotifications });
      if (response.success && response.data) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Set empty state on error to prevent UI issues
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await NotificationsAPI.markAsRead(notificationId.toString());
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await NotificationsAPI.markAllAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        onMarkAllAsRead?.();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INTEREST':
        return CheckCircle;
      case 'REQUEST':
        return Info;
      case 'SUBSCRIPTION':
        return Bell;
      case 'SYSTEM':
        return AlertTriangle;
      case 'RETOUR':
        return Clock;
      default:
        return Info;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'INTEREST':
        return 'text-green-600 bg-green-100';
      case 'REQUEST':
        return 'text-blue-600 bg-blue-100';
      case 'SUBSCRIPTION':
        return 'text-purple-600 bg-purple-100';
      case 'SYSTEM':
        return 'text-yellow-600 bg-yellow-100';
      case 'RETOUR':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications on mount
  useEffect(() => {
    // Add a small delay to prevent immediate API calls on page load
    const timer = setTimeout(() => {
      loadNotifications();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    try {
      const socket = socketService.connect();

      // Listen for new notifications
      socket.on('notification:new', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev.slice(0, maxNotifications - 1)]);
        setUnreadCount(prev => prev + 1);
      });

      // Listen for notification updates
      socket.on('notification:update', (updatedNotification: Notification) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === updatedNotification.id ? updatedNotification : notif
          )
        );
      });

      return () => {
        socket.off('notification:new');
        socket.off('notification:update');
      };
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      // Continue without real-time updates
    }
  }, [maxNotifications]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-accent hover-lift transition-all duration-200 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
      >
        <Bell className="w-5 h-5 text-foreground transition-transform duration-200 hover:scale-110" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-xs animate-glow-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background rounded-lg shadow-lg border border-border z-50 animate-slide-in-bottom">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border enhanced-card-header">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-foreground text-heading-3">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-blue-500 text-white animate-pulse">
                  {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-primary hover:text-primary/80 h-auto p-2 rounded-md hover:bg-blue-50 transition-all duration-200 inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="flex flex-col items-center space-y-2">
                  <Bell className="w-8 h-8 text-muted-foreground/50" />
                  <p>Aucune notification</p>
                  <p className="text-xs text-muted-foreground/70">
                    Les notifications apparaîtront ici
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-accent transition-all duration-200 relative",
                        !notification.isRead 
                          ? "bg-blue-50/50 border-l-4 border-l-blue-500 shadow-sm" 
                          : "bg-muted/20 border-l-4 border-l-transparent"
                      )}
                    >
                      {/* Unread indicator dot */}
                      {!notification.isRead && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      
                      <div className="flex items-start space-x-3">
                        {/* Icon with enhanced styling for unread */}
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                          colorClasses,
                          !notification.isRead && "ring-2 ring-blue-200 shadow-md"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content - Clickable area */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm font-medium transition-colors duration-200",
                                !notification.isRead 
                                  ? "text-foreground font-semibold" 
                                  : "text-muted-foreground"
                              )}>
                                {notification.title}
                              </p>
                              <p className={cn(
                                "text-sm mt-1 transition-colors duration-200",
                                !notification.isRead 
                                  ? "text-foreground/90" 
                                  : "text-muted-foreground/80"
                              )}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>
                            
                            {/* Read/Unread status badge */}
                            <div className="flex-shrink-0 ml-2">
                              {!notification.isRead ? (
                                <Badge variant="default" className="bg-blue-500 text-white text-xs px-2 py-1">
                                  Nouveau
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-muted-foreground text-xs px-2 py-1">
                                  Lu
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center space-x-1">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-8 w-8 p-1 rounded-md hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-all duration-200"
                              aria-label="Marquer comme lu"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-border">
              <button
                onClick={() => {
                  // Navigate to notifications page based on user role
                  const notificationsUrl = getNotificationsUrl();
                  router.push(notificationsUrl);
                }}
                className="w-full text-primary hover:text-primary/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;