'use client';

import React from 'react';
import { AnnouncementsAPI, NotificationsAPI, AnalyticsAPI } from '@/lib/api';
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
  QuickActionCard,
  QuickActionGrid,
  FloatingActionButton,
  ActivityTimeline,
  EmptyRetours,
  EmptyRequests,
  EmptyNotifications
} from '@/components';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Heart, 
  Bell,
  Plus,
  BarChart3,
  TrendingUp,
  Eye,
  CheckCircle,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks';
import { formatDate } from '@/lib/utils/formatters';

export default function FournisseurDashboardPage() {
  // API hooks for real data
  const { data: myStats, loading: statsLoading, execute: executeStats } = useApi(() => 
    AnalyticsAPI.getMyStats()
  );
  
  const { data: availableAnnouncements, loading: announcementsLoading, execute: executeAnnouncements } = useApi(() => 
    AnnouncementsAPI.getAll({ forSupplier: true, limit: 5 })
  );
  
  const { data: myInterests, loading: interestsLoading, execute: executeInterests } = useApi(() => 
    AnnouncementsAPI.getMyInterests()
  );
  
  // Execute API calls on component mount
  React.useEffect(() => {
    executeStats();
    executeAnnouncements();
    executeInterests();
  }, []); // Empty dependency array to run only once

  const loading = statsLoading || announcementsLoading || interestsLoading;

  // Use real stats from API
  const stats = {
    availableAnnouncements: myStats?.data?.availableAnnouncements || 0,
    myInterests: myStats?.data?.myInterests || 0,
    acceptedInterests: myStats?.data?.acceptedInterests || 0,
    unreadNotifications: myStats?.data?.unreadNotifications || 0,
    openDemandes: myStats?.data?.openDemandes || 0,
    successRate: myStats?.data?.successRate || 0
  };

  const activityColumns = [
    { key: 'type', header: 'Type', sortable: true, render: (value: string) => (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        value === 'ANNOUNCEMENT' ? 'bg-green-100 text-green-800' :
        value === 'INTEREST' ? 'bg-pink-100 text-pink-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value === 'ANNOUNCEMENT' ? 'Annonce' : value === 'INTEREST' ? 'Intérêt' : value}
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
            <Link href="/dashboard/fournisseur/retours">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Voir les retours
              </Button>
            </Link>
            <Link href="/dashboard/fournisseur/demandes">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200">
                <Eye className="h-4 w-4 mr-2" />
                Voir les demandes
              </Button>
            </Link>
          </div>
        }
      />

      {/* Enhanced Stats Cards with Gradients */}
      <StatCardGrid
        cards={[
          {
            title: "Retours disponibles",
            value: stats.availableAnnouncements,
            change: { value: stats.announcementGrowth || 0, period: 'vs mois dernier' },
            icon: FileText,
            gradient: 'green',
            onClick: () => window.location.href = '/dashboard/fournisseur/retours'
          },
          {
            title: "Mes intérêts",
            value: stats.myInterests,
            change: { value: stats.interestGrowth || 0, period: 'vs mois dernier' },
            icon: Heart,
            gradient: 'purple',
            onClick: () => window.location.href = '/dashboard/fournisseur/retours'
          },
          {
            title: "Intérêts acceptés",
            value: stats.acceptedInterests,
            change: { value: stats.acceptedGrowth || 0, period: 'vs mois dernier' },
            icon: CheckCircle,
            gradient: 'blue',
            onClick: () => window.location.href = '/dashboard/fournisseur/retours'
          },
          {
            title: "Notifications",
            value: stats.unreadNotifications,
            change: { value: 0, period: 'nouvelles' },
            icon: Bell,
            gradient: 'orange',
            onClick: () => window.location.href = '/dashboard/fournisseur/notifications'
          },
          {
            title: "Demandes ouvertes",
            value: stats.openDemandes || 0,
            change: { value: 0, period: 'vs semaine dernière' },
            icon: ShoppingCart,
            gradient: 'blue',
            onClick: () => window.location.href = '/dashboard/fournisseur/demandes'
          },
          {
            title: "Taux de succès",
            value: `${stats.successRate || 0}%`,
            change: { value: 0, period: 'vs mois dernier' },
            icon: TrendingUp,
            gradient: 'green',
            onClick: () => window.location.href = '/dashboard/fournisseur/analytics'
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
              title: "Voir les retours",
              description: "Annonces visibles",
              icon: FileText,
              onClick: () => window.location.href = '/dashboard/fournisseur/retours',
              variant: 'primary'
            },
            {
              title: "Voir les demandes",
              description: "Demandes ouvertes",
              icon: ShoppingCart,
              onClick: () => window.location.href = '/dashboard/fournisseur/demandes',
              variant: 'secondary'
            },
            {
              title: "Mes intérêts",
              description: "Gérer les intérêts",
              icon: Heart,
              onClick: () => window.location.href = '/dashboard/fournisseur/retours',
              variant: 'success'
            },
            {
              title: "Notifications",
              description: "Voir les notifications",
              icon: Bell,
              onClick: () => window.location.href = '/dashboard/fournisseur/notifications',
              variant: 'warning',
              badge: stats.unreadNotifications
            }
          ]}
          columns={4}
        />
      </div>

      {/* Recent Activity with Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Announcements Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Retours disponibles
              </h3>
              <Link href="/dashboard/fournisseur/retours">
                <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                  Voir tout
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {availableAnnouncements?.data?.announcements?.length > 0 ? (
              <div className="space-y-3">
                {availableAnnouncements.data.announcements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        announcement.status === 'AVAILABLE' ? 'bg-green-500' :
                        announcement.status === 'RESERVED' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{announcement.medicine?.brandName}</p>
                        <p className="text-xs text-gray-500">Quantité: {announcement.quantity} • {announcement.pharmacyUser?.name}</p>
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
              <EmptyRetours />
            )}
          </div>
        </div>

        {/* My Interests Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Mes intérêts récents
              </h3>
              <Link href="/dashboard/fournisseur/retours">
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
                  Voir tout
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {myInterests?.data?.interests?.length > 0 ? (
              <div className="space-y-3">
                {myInterests.data.interests.slice(0, 3).map((interest: any) => (
                  <div key={interest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        interest.status === 'PENDING' ? 'bg-yellow-500' :
                        interest.status === 'ACCEPTED' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{interest.announcement?.medicine?.brandName}</p>
                        <p className="text-xs text-gray-500">Pharmacie: {interest.announcement?.pharmacyUser?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={interest.status} />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(interest.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyInterests />
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
                type: 'INTEREST',
                title: 'Intérêt exprimé',
                description: 'Vous vous êtes intéressé à un retour pour DICLOPAL',
                createdAt: new Date().toISOString(),
                status: 'success'
              },
              {
                id: 2,
                type: 'ANNOUNCEMENT',
                title: 'Nouveau retour disponible',
                description: 'Un nouveau retour est disponible dans votre région',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'info'
              },
              {
                id: 3,
                type: 'INTEREST',
                title: 'Intérêt accepté',
                description: 'Votre intérêt pour un retour a été accepté',
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
        onClick={() => window.location.href = '/dashboard/fournisseur/retours'}
        label="Voir les retours"
        variant="primary"
      />
    </div>
  );
}