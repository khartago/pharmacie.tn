'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { NotificationsAPI } from '@/lib/api';
import { 
  UnifiedTable, 
  StatusBadge, 
  ModernPageHeader,
  ModernTabNav,
  ActionMenu,
  SearchBar,
  FilterPanel,
  ConfirmDialog,
  EmptyState,
  SkeletonTable
} from '@/components';
import { FilterOption } from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Search,
  Filter,
  Eye,
  Trash2,
  Check,
  X,
  Heart,
  FileText,
  ShoppingCart,
  Settings,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import { useApi, usePagination, useFilters, useDebounce, useToast } from '@/lib/hooks';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { NOTIFICATION_TYPES } from '@/lib/utils/constants';

export default function PharmacieNotificationsPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PharmacieNotificationsContent />
    </Suspense>
  );
}

function PharmacieNotificationsContent() {
  const [activeTab, setActiveTab] = useState('non-lues');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<any>(null);

  // Hooks
  const { execute: getNotifications } = useApi(NotificationsAPI.getAll);
  const { execute: markAsRead } = useApi(NotificationsAPI.markAsRead);
  const { execute: markAllAsRead } = useApi(NotificationsAPI.markAllAsRead);
  const { execute: deleteNotification } = useApi(NotificationsAPI.delete);
  
  const { pagination, setPage, setTotal } = usePagination();
  const { filters, setFilter, clearAllFilters, hasActiveFilters } = useFilters();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { success, error } = useToast();

  // Tab configuration
  const tabs = [
    { key: 'non-lues', label: 'Non lues', count: allNotifications.filter(n => !n.isRead).length },
    { key: 'toutes', label: 'Toutes', count: allNotifications.length }
  ];

  // Load all notifications for tab counts
  useEffect(() => {
    loadAllNotifications();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, debouncedSearch, filters]);

  // Load all notifications for tab counts
  const loadAllNotifications = async () => {
    try {
      const response = await getNotifications({ limit: 1000 }); // Get all notifications
      if (response?.success && response.data) {
        setAllNotifications(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading all notifications:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        unreadOnly: activeTab === 'non-lues' ? 'true' : 'false',
        ...filters
      };

      const response = await getNotifications(params);
      
      if (response?.success && response.data) {
        setNotifications(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err) {
      error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await markAsRead(notificationId.toString());
      if (response?.success) {
        success('Notification marquée comme lue');
        loadData();
        loadAllNotifications(); // Update tab counts
      }
    } catch (err) {
      error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsRead();
      if (response?.success) {
        success('Toutes les notifications marquées comme lues');                                                                    
        loadData();
        loadAllNotifications(); // Update tab counts
      }
    } catch (err) {
      error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (notificationId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la notification',
      description: 'Êtes-vous sûr de vouloir supprimer cette notification ?',
      onConfirm: async () => {
        try {
          const response = await deleteNotification(notificationId.toString());
          if (response?.success) {
            success('Notification supprimée');
            loadData();
            loadAllNotifications(); // Update tab counts
          }
        } catch (err) {
          error('Erreur lors de la suppression');
        }
        setConfirmDialog(null);
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INTEREST':
        return Heart;
      case 'REQUEST':
        return ShoppingCart;
      case 'RETOUR':
        return RotateCcw;
      case 'SUBSCRIPTION':
        return CreditCard;
      case 'SYSTEM':
        return Settings;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'INTEREST':
        return 'text-pink-600 bg-pink-100';
      case 'REQUEST':
        return 'text-blue-600 bg-blue-100';
      case 'RETOUR':
        return 'text-orange-600 bg-orange-100';
      case 'SUBSCRIPTION':
        return 'text-purple-600 bg-purple-100';
      case 'SYSTEM':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Render notification cards
  const renderNotificationCard = (notification: any) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);
    
    return (
      <div
        key={notification.id}
        className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
          !notification.isRead 
            ? 'bg-blue-50/50 border-l-4 border-l-blue-500 shadow-sm' 
            : 'bg-white border-l-4 border-l-transparent'
        }`}
      >
        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
        
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass} ${
            !notification.isRead ? 'ring-2 ring-blue-200 shadow-md' : ''
          }`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-sm font-medium transition-colors duration-200 ${
                  !notification.isRead 
                    ? 'text-foreground font-semibold' 
                    : 'text-muted-foreground'
                }`}>
                  {notification.title}
                </h3>
                <p className={`text-sm mt-1 transition-colors duration-200 ${
                  !notification.isRead 
                    ? 'text-foreground/90' 
                    : 'text-muted-foreground/80'
                }`}>
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  
                  {/* Status badge */}
                  <div className="flex items-center space-x-2">
                    {!notification.isRead ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nouveau
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Lu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {!notification.isRead && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="h-8 w-8 p-1 rounded-md hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-all duration-200"
                title="Marquer comme lu"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleDelete(notification.id)}
              className="h-8 w-8 p-1 rounded-md hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all duration-200"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filter options
  const filterOptions: FilterOption[] = [
    { key: 'type', label: 'Type', type: 'select' as const, options: [
      { value: 'INTEREST', label: 'Intérêt' },
      { value: 'REQUEST', label: 'Demande' },
      { value: 'RETOUR', label: 'Retour' },
      { value: 'SUBSCRIPTION', label: 'Abonnement' },
      { value: 'SYSTEM', label: 'Système' }
    ]},
    { key: 'isRead', label: 'Non lues seulement', type: 'checkbox' as const },
    { key: 'dateRange', label: 'Période', type: 'date' as const }
  ];

  if (loading && notifications.length === 0) {
    return <SkeletonTable rows={10} columns={5} />;
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Notifications"
        description="Gérez vos notifications"
        icon={Bell}
        actions={
          <div className="flex space-x-3">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200"
            >
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          </div>
        }
        search={{
          placeholder: 'Rechercher dans les notifications...',
          value: searchTerm,
          onChange: setSearchTerm
        }}
        filters={
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={setFilter}
            onReset={clearAllFilters}
          />
        }
      />

      {/* Tabs */}
      <ModernTabNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Notifications Cards */}
      {notifications.length === 0 && !loading ? (
        <EmptyState
          title="Aucune notification trouvée"
          description="Vous n'avez aucune notification pour le moment."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map(renderNotificationCard)}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant="destructive"
        />
      )}
    </div>
  );
}