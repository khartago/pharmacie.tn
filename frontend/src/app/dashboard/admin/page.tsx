'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, ExportAPI } from '@/lib/api';
import { SkeletonStats, ActivityChart, RegionChart } from '@/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsResponse, activityResponse, regionResponse] = await Promise.all([
        AnalyticsAPI.getDashboardStats(),
        AnalyticsAPI.getActivityTimeline('7'), // Last 7 days
        AnalyticsAPI.getRequestsByRegion('30') // Last 30 days
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      if (activityResponse.success && activityResponse.data) {
        setActivityData(activityResponse.data);
      } else {
        setActivityData([]);
      }
      if (regionResponse.success && regionResponse.data) {
        setRegionData(regionResponse.data);
      } else {
        setRegionData([]);
      }
    } catch (error) {
      // Silently handle analytics errors - set empty data
      setActivityData([]);
      setRegionData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportAnalytics();
      if (response.success) {
        // Handle download
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard-analytics.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <SkeletonStats />;
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tableau de bord</h1>
          <p className="text-slate-600">Vue d'ensemble de la plateforme Pharmacie.tn</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>
          <Button 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Utilisateurs totaux</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+{stats?.userGrowth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Annonces actives</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.activeAnnouncements || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+{stats?.announcementGrowth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Demandes ouvertes</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.openRequests || 0}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${(stats?.requestGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.requestGrowth || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="text-sm font-medium">{stats?.requestGrowth >= 0 ? '+' : ''}{stats?.requestGrowth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Taux de conversion</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.conversionRate || 0}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+{stats?.conversionGrowth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Activité récente
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Eye className="w-3 h-3 mr-1" />
                Vue d'ensemble
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activityData.length > 0 ? (
              <ActivityChart data={activityData} />
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée d'activité</p>
                  <p className="text-sm text-slate-400">Les données apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Répartition par région
              </CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Target className="w-3 h-3 mr-1" />
                Géographique
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {regionData.length > 0 ? (
              <RegionChart data={regionData} />
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée régionale</p>
                  <p className="text-sm text-slate-400">Les données géographiques apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modern Activity Feed */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-slate-900 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Activité récente
              </CardTitle>
              <CardDescription className="text-slate-600">Dernières activités sur la plateforme</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200"
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-200 hover:scale-[1.01] group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <span className="text-xs text-white font-bold">{activity.type?.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune activité récente</h3>
                <p className="text-slate-500 mb-4">Les activités de la plateforme apparaîtront ici</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setLoading(true);
                    fetchData();
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser les données
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
