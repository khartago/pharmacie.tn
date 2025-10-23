'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, ExportAPI } from '@/lib/api';
import { UnifiedTable, StatusBadge, ExportButton, Skeleton, EmptyState } from '@/components';
import { 
  BarChart3, 
  Users, 
  FileText, 
  ShoppingCart,
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Building2,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // days
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      const [
        overviewResponse,
        topMedicinesResponse,
        requestsByRegionResponse,
        announcementsTrendResponse,
        activePharmaciesResponse,
        activeSuppliersResponse
      ] = await Promise.all([
        AnalyticsAPI.getOverview(period),
        AnalyticsAPI.getTopMedicines(period),
        AnalyticsAPI.getRequestsByRegion(period),
        AnalyticsAPI.getAnnouncementsTrend(period),
        AnalyticsAPI.getActivePharmacies(period),
        AnalyticsAPI.getActiveSuppliers(period)
      ]);

      setAnalyticsData({
        overview: overviewResponse.success ? overviewResponse.data : null,
        topMedicines: topMedicinesResponse.success ? topMedicinesResponse.data : [],
        requestsByRegion: requestsByRegionResponse.success ? requestsByRegionResponse.data : [],
        announcementsTrend: announcementsTrendResponse.success ? announcementsTrendResponse.data : [],
        activePharmacies: activePharmaciesResponse.success ? activePharmaciesResponse.data : [],
        activeSuppliers: activeSuppliersResponse.success ? activeSuppliersResponse.data : []
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
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
        a.download = `analytics-${period}days.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-600">Analyse des données et tendances de la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <FileText className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {analyticsData?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Utilisateurs actifs</p>
                    <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.activeUsers}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analyticsData.overview.userGrowth}%
                </Badge>
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
                    <p className="text-sm font-medium text-slate-600">Annonces publiées</p>
                    <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.totalAnnouncements}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Activity className="w-3 h-3 mr-1" />
                  +{analyticsData.overview.announcementGrowth}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Demandes créées</p>
                    <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.totalRequests}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <Target className="w-3 h-3 mr-1" />
                  +{analyticsData.overview.requestGrowth}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Taux de conversion</p>
                    <p className="text-2xl font-bold text-slate-900">{analyticsData.overview.conversionRate}%</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analyticsData.overview.conversionGrowth}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Top Médicaments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.topMedicines?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topMedicines.slice(0, 5).map((medicine: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{medicine.name}</p>
                        <p className="text-sm text-slate-500">{medicine.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{medicine.count} demandes</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée disponible</p>
                  <p className="text-sm text-slate-400">Les données apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Pharmacies Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.activePharmacies?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.activePharmacies.slice(0, 5).map((pharmacy: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{pharmacy.name}</p>
                        <p className="text-sm text-slate-500">{pharmacy.city}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{pharmacy.activity} activités</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée disponible</p>
                  <p className="text-sm text-slate-400">Les données apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                <Truck className="w-5 h-5 text-white" />
              </div>
              Fournisseurs Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.activeSuppliers?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.activeSuppliers.slice(0, 5).map((supplier: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{supplier.name}</p>
                        <p className="text-sm text-slate-500">{supplier.specialty}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{supplier.activity} activités</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée disponible</p>
                  <p className="text-sm text-slate-400">Les données apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Tendance des Annonces
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.announcementsTrend?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.announcementsTrend.slice(0, 7).map((trend: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{trend.date}</p>
                        <p className="text-sm text-slate-500">{trend.period}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{trend.count} annonces</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée disponible</p>
                  <p className="text-sm text-slate-400">Les données apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
