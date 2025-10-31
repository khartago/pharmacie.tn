'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, ExportAPI } from '@/lib/api';
import { Skeleton } from '@/components';
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
  Truck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  TrendingDown,
  Percent,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const [
        overviewResponse,
        topMedicinesResponse,
        requestsByRegionResponse,
        announcementsTrendResponse,
        activePharmaciesResponse,
        activeSuppliersResponse,
        conversionFunnelResponse,
        supplierPerformanceResponse,
        requestFulfillmentResponse,
        regionalPerformanceResponse
      ] = await Promise.all([
        AnalyticsAPI.getOverview(period),
        AnalyticsAPI.getTopMedicines(period),
        AnalyticsAPI.getRequestsByRegion(period),
        AnalyticsAPI.getAnnouncementsTrend(period),
        AnalyticsAPI.getActivePharmacies(period),
        AnalyticsAPI.getActiveSuppliers(period),
        AnalyticsAPI.getConversionFunnel(period),
        AnalyticsAPI.getSupplierPerformance(period),
        AnalyticsAPI.getRequestFulfillment(period),
        AnalyticsAPI.getRegionalPerformance(period)
      ]);

      console.log('[Analytics] API Responses:', {
        overview: overviewResponse,
        conversionFunnel: conversionFunnelResponse,
        supplierPerformance: supplierPerformanceResponse
      });

      setAnalyticsData({
        overview: overviewResponse.success && overviewResponse.data ? overviewResponse.data : null,
        topMedicines: topMedicinesResponse.success && topMedicinesResponse.data ? topMedicinesResponse.data : [],
        requestsByRegion: requestsByRegionResponse.success && requestsByRegionResponse.data ? requestsByRegionResponse.data : [],
        announcementsTrend: announcementsTrendResponse.success && announcementsTrendResponse.data ? announcementsTrendResponse.data : [],
        activePharmacies: activePharmaciesResponse.success && activePharmaciesResponse.data ? activePharmaciesResponse.data : [],
        activeSuppliers: activeSuppliersResponse.success && activeSuppliersResponse.data ? activeSuppliersResponse.data : [],
        conversionFunnel: conversionFunnelResponse.success && conversionFunnelResponse.data ? conversionFunnelResponse.data : null,
        supplierPerformance: supplierPerformanceResponse.success && supplierPerformanceResponse.data ? supplierPerformanceResponse.data : [],
        requestFulfillment: requestFulfillmentResponse.success && requestFulfillmentResponse.data ? requestFulfillmentResponse.data : [],
        regionalPerformance: regionalPerformanceResponse.success && regionalPerformanceResponse.data ? regionalPerformanceResponse.data : []
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Set empty state on error
      setAnalyticsData({
        overview: null,
        topMedicines: [],
        requestsByRegion: [],
        announcementsTrend: [],
        activePharmacies: [],
        activeSuppliers: [],
        conversionFunnel: null,
        supplierPerformance: [],
        requestFulfillment: [],
        regionalPerformance: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportAnalytics();
      if (response.success) {
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

  const handleRefresh = () => {
    fetchAnalyticsData(false);
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-slate-600">Insights et métriques de performance de la plateforme</p>
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
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={handleExport} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {analyticsData?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-modern-2025 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-6 h-6 text-white" />
                </div>
                {analyticsData.overview.userGrowth !== undefined && (
                  <Badge variant={analyticsData.overview.userGrowth >= 0 ? "secondary" : "destructive"} className="bg-blue-100 text-blue-700">
                    {analyticsData.overview.userGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(analyticsData.overview.userGrowth)}%
                </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Utilisateurs actifs</p>
                <p className="text-3xl font-bold text-slate-900">{analyticsData.overview.activeUsers?.toLocaleString() || 0}</p>
                <p className="text-xs text-slate-500 mt-2">Sur {period} jours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-xl transition-all duration-300 hover:border-green-200 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                {analyticsData.overview.announcementGrowth !== undefined && (
                  <Badge variant={analyticsData.overview.announcementGrowth >= 0 ? "secondary" : "destructive"} className="bg-green-100 text-green-700">
                    {analyticsData.overview.announcementGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(analyticsData.overview.announcementGrowth)}%
                </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Annonces publiées</p>
                <p className="text-3xl font-bold text-slate-900">{analyticsData.overview.totalAnnouncements?.toLocaleString() || 0}</p>
                <p className="text-xs text-slate-500 mt-2">Sur {period} jours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-xl transition-all duration-300 hover:border-orange-200 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                {analyticsData.overview.requestGrowth !== undefined && (
                  <Badge variant={analyticsData.overview.requestGrowth >= 0 ? "secondary" : "destructive"} className="bg-orange-100 text-orange-700">
                    {analyticsData.overview.requestGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(analyticsData.overview.requestGrowth)}%
                </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Demandes créées</p>
                <p className="text-3xl font-bold text-slate-900">{analyticsData.overview.totalRequests?.toLocaleString() || 0}</p>
                <p className="text-xs text-slate-500 mt-2">Sur {period} jours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-xl transition-all duration-300 hover:border-purple-200 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-bl-full" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Target className="w-6 h-6 text-white" />
                </div>
                {analyticsData.overview.conversionGrowth !== undefined && (
                  <Badge variant={analyticsData.overview.conversionGrowth >= 0 ? "secondary" : "destructive"} className="bg-purple-100 text-purple-700">
                    {analyticsData.overview.conversionGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(analyticsData.overview.conversionGrowth)}%
                </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Taux de conversion</p>
                <p className="text-3xl font-bold text-slate-900">{analyticsData.overview.conversionRate || 0}%</p>
                <p className="text-xs text-slate-500 mt-2">Intérêts / Annonces</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversion Funnel */}
      {analyticsData?.conversionFunnel && (
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              Funnel de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.conversionFunnel.stages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                        {analyticsData.conversionFunnel.stages.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Taux d'intérêt</span>
                    <Percent className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{analyticsData.conversionFunnel.metrics.interestRate}%</p>
                      </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Taux d'acceptation</span>
                    <Percent className="w-4 h-4 text-green-600" />
                      </div>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.conversionFunnel.metrics.acceptanceRate}%</p>
                    </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Conversion globale</span>
                    <Percent className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.conversionFunnel.metrics.overallConversion}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Fulfillment Trend */}
        {analyticsData?.requestFulfillment && analyticsData.requestFulfillment.length > 0 && (
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Taux de Remplissage des Demandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.requestFulfillment.slice(0, 14).reverse()}>
                    <defs>
                      <linearGradient id="colorFulfillmentRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                      }}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fulfillmentRate" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFulfillmentRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements Trend */}
        {analyticsData?.announcementsTrend && analyticsData.announcementsTrend.length > 0 && (
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Tendance des Annonces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.announcementsTrend.slice(0, 14).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                      }}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regional Performance */}
        {analyticsData?.regionalPerformance && analyticsData.regionalPerformance.length > 0 && (
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Performance Régionale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.regionalPerformance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis 
                      dataKey="regionName" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="totalRequests" fill="#3b82f6" name="Demandes" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="fulfilledRequests" fill="#10b981" name="Remplies" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests by Region */}
        {analyticsData?.requestsByRegion && analyticsData.requestsByRegion.length > 0 && (
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                Demandes par Région
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.requestsByRegion.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis 
                      dataKey="regionName" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="requestCount" fill="#f59e0b" radius={[8, 8, 0, 0]}>
                      {analyticsData.requestsByRegion.slice(0, 8).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Supplier Performance */}
      {analyticsData?.supplierPerformance && analyticsData.supplierPerformance.length > 0 && (
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                <Truck className="w-5 h-5 text-white" />
              </div>
              Performance des Fournisseurs (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
              {analyticsData.supplierPerformance.slice(0, 10).map((supplier: any, index: number) => (
                <div key={supplier.supplierId} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{supplier.supplierName}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {supplier.totalAnnouncements} annonces
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {supplier.acceptanceRate}% acceptation
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {supplier.avgResponseTime}h réponse
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {supplier.acceptedInterests} acceptés
                  </Badge>
                </div>
              ))}
              </div>
          </CardContent>
        </Card>
      )}

      {/* Top Medicines & Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Medicines */}
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Top Médicaments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.topMedicines?.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topMedicines.slice(0, 5).map((medicine: any, index: number) => (
                  <div key={medicine.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{medicine.brandName || medicine.dci || 'Médicament'}</p>
                        <p className="text-sm text-slate-500">{medicine.dci || medicine.laboratoire || ''}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-semibold">{medicine.requestCount || 0} demandes</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée disponible</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Pharmacies */}
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Pharmacies Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.activePharmacies?.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.activePharmacies.slice(0, 5).map((pharmacy: any, index: number) => {
                  const totalActivity = (pharmacy.announcementsCount || 0) + (pharmacy.requestsCount || 0);
                  return (
                    <div key={pharmacy.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                          <p className="font-medium text-slate-900">{pharmacy.name || 'Pharmacie'}</p>
                          <p className="text-sm text-slate-500">{pharmacy.cityName || pharmacy.regionName || ''}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-semibold">{totalActivity} activités</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Aucune donnée disponible</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
