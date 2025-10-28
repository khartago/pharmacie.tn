'use client';

import React from 'react';
import { AnnouncementsAPI, RequestsAPI, NotificationsAPI, AnalyticsAPI } from '@/lib/api';
import { 
  UnifiedTable, 
  StatusBadge, 
  Skeleton, 
  EmptyState,
  ModernStatCard,
  ModernPageHeader,
  SkeletonStats,
  StatCardGradient,
  StatCardGrid,
  AnnouncementStatCard,
  RequestStatCard,
  InterestStatCard,
  NotificationStatCard,
  ExpiredStatCard,
  SuccessRateStatCard,
  QuickActionCard,
  QuickActionGrid,
  FloatingActionButton,
  CountdownTimer,
  CircularCountdown,
  ActivityTimeline,
  EmptyAnnouncements,
  EmptyRequests,
  EmptyInterests
} from '@/components';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ShoppingCart, 
  Heart, 
  Bell,
  Plus,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks';
import { formatDate } from '@/lib/utils/formatters';

export default function PharmacieDashboardPage() {
  // API hooks for real data
  const { data: myStats, loading: statsLoading, execute: executeStats } = useApi(() => 
    AnalyticsAPI.getMyStats()
  );
  
  const { data: myAnnouncements, loading: announcementsLoading, execute: executeAnnouncements } = useApi(() => 
    AnnouncementsAPI.getAll({ userOnly: true, limit: 5 })
  );
  
  const { data: myRequests, loading: requestsLoading, execute: executeRequests } = useApi(() => 
    RequestsAPI.getAll({ userOnly: true, limit: 5 })
  );
  
  // Execute API calls on component mount
  React.useEffect(() => {
    executeStats();
    executeAnnouncements();
    executeRequests();
  }, []); // Empty dependency array to run only once

  const loading = statsLoading || announcementsLoading || requestsLoading;

  // Use real stats from API
  const stats = {
    activeAnnouncements: myStats?.data?.activeAnnouncements || 0,
    openRequests: myStats?.data?.openRequests || 0,
    pendingInterests: myStats?.data?.pendingInterests || 0,
    unreadNotifications: myStats?.data?.unreadNotifications || 0,
    expiredItems: 0, // TODO: Add expiredItems to backend stats API
    successRate: 0 // TODO: Add successRate to backend stats API
  };

  const activityColumns = [
    { key: 'type', header: 'Type', sortable: true, render: (value: string) => (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        value === 'ANNOUNCEMENT' ? 'bg-green-100 text-green-800' :
        value === 'REQUEST' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value === 'ANNOUNCEMENT' ? 'Annonce' : value === 'REQUEST' ? 'Demande' : value}
      </span>
    ) },
    { key: 'title', header: 'Titre', sortable: true },
    { key: 'status', header: 'Statut', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'createdAt', header: 'Date', sortable: true, render: (value: string) => formatDate(value) }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <ModernPageHeader
          title="Tableau de bord"
          description="Vue d'ensemble de vos activités"
          icon={BarChart3}
        />
        <SkeletonStats cards={4} />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de vos activités"
        icon={BarChart3}
        actions={
          <div className="flex space-x-3">
            <Link href="/dashboard/pharmacie/annonces">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Button>
            </Link>
            <Link href="/dashboard/pharmacie/demandes">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </Link>
          </div>
        }
      />

      {/* Enhanced Stats Cards with Gradients */}
      <StatCardGrid
        cards={[
          {
            title: "Annonces actives",
            value: stats.activeAnnouncements,
            change: { value: 0, period: 'vs mois dernier' }, // TODO: Add announcementGrowth to backend stats API
            icon: FileText,
            gradient: 'green',
            onClick: () => window.location.href = '/dashboard/pharmacie/annonces'
          },
          {
            title: "Demandes ouvertes",
            value: stats.openRequests,
            change: { value: 0, period: 'vs mois dernier' }, // TODO: Add requestGrowth to backend stats API
            icon: ShoppingCart,
            gradient: 'blue',
            onClick: () => window.location.href = '/dashboard/pharmacie/demandes'
          },
          {
            title: "Intérêts en attente",
            value: stats.pendingInterests,
            change: { value: 0, period: 'vs mois dernier' }, // TODO: Add interestGrowth to backend stats API
            icon: Heart,
            gradient: 'purple',
            onClick: () => window.location.href = '/dashboard/pharmacie/annonces'
          },
          {
            title: "Notifications",
            value: stats.unreadNotifications,
            change: { value: 0, period: 'nouvelles' },
            icon: Bell,
            gradient: 'orange',
            onClick: () => window.location.href = '/dashboard/pharmacie/notifications'
          },
          {
            title: "Expirés",
            value: stats.expiredItems || 0,
            change: { value: 0, period: 'vs semaine dernière' },
            icon: ShoppingCart,
            gradient: 'red',
            onClick: () => window.location.href = '/dashboard/pharmacie/demandes?filter=expired'
          },
          {
            title: "Taux de succès",
            value: `${stats.successRate || 0}%`,
            change: { value: 0, period: 'vs mois dernier' },
            icon: BarChart3,
            gradient: 'green',
            onClick: () => window.location.href = '/dashboard/pharmacie/analytics'
          }
        ]}
        columns={3}
        size="md"
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <QuickActionGrid
          actions={[
            {
              title: "Nouvelle annonce",
              description: "Créer une annonce",
              icon: FileText,
              onClick: () => window.location.href = '/dashboard/pharmacie/annonces',
              variant: 'primary'
            },
            {
              title: "Nouvelle demande",
              description: "Créer une demande",
              icon: ShoppingCart,
              onClick: () => window.location.href = '/dashboard/pharmacie/demandes',
              variant: 'secondary'
            },
            {
              title: "Voir les intérêts",
              description: "Gérer les intérêts",
              icon: Heart,
              onClick: () => window.location.href = '/dashboard/pharmacie/annonces',
              variant: 'success'
            },
            {
              title: "Notifications",
              description: "Voir les notifications",
              icon: Bell,
              onClick: () => window.location.href = '/dashboard/pharmacie/notifications',
              variant: 'warning',
              badge: stats.unreadNotifications
            }
          ]}
          columns={4}
        />
      </div>

      {/* Recent Activity with Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Mes annonces récentes
              </h3>
              <Link href="/dashboard/pharmacie/annonces">
                <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                  Voir tout
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {(myAnnouncements?.data?.data?.length || 0) > 0 ? (
              <div className="space-y-3">
                {myAnnouncements?.data?.data?.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        announcement.status === 'AVAILABLE' ? 'bg-green-500' :
                        announcement.status === 'RESERVED' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{announcement.medicine?.brandName}</p>
                        <p className="text-xs text-gray-500">Quantité: {announcement.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={announcement.status} />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(announcement.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyAnnouncements onCreate={() => window.location.href = '/dashboard/pharmacie/annonces'} />
            )}
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Mes demandes récentes
              </h3>
              <Link href="/dashboard/pharmacie/demandes">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                  Voir tout
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {(myRequests?.data?.data?.length || 0) > 0 ? (
              <div className="space-y-3">
                {myRequests?.data?.data?.slice(0, 3).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        request.status === 'OPEN' ? 'bg-blue-500' :
                        request.status === 'ACCEPTED' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{request.medicine?.brandName}</p>
                        <p className="text-xs text-gray-500">Portée: {request.scope}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={request.status} />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyRequests onCreate={() => window.location.href = '/dashboard/pharmacie/demandes'} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            Activité récente
          </h3>
        </div>
        <div className="p-6">
          <ActivityTimeline
            activities={[
              {
                id: 1,
                type: 'ANNOUNCEMENT',
                title: 'Nouvelle annonce créée',
                description: 'Vous avez créé une annonce pour DICLOPAL',
                createdAt: new Date().toISOString(),
                status: 'success'
              },
              {
                id: 2,
                type: 'INTEREST',
                title: 'Nouvel intérêt reçu',
                description: 'Une pharmacie s\'est intéressée à votre annonce',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'info'
              },
              {
                id: 3,
                type: 'REQUEST',
                title: 'Demande créée',
                description: 'Vous avez créé une demande de rupture',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                status: 'success'
              }
            ]}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => window.location.href = '/dashboard/pharmacie/annonces'}
        label="Nouvelle annonce"
        variant="primary"
      />
    </div>
  );
}