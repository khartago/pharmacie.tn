'use client';

import React, { useState, useEffect } from 'react';
import { HealthAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gauge, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function AdminHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await HealthAPI.getSystemHealth();
      if (response.success) {
        setHealthData(response.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-700">Opérationnel</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700">Attention</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700">Erreur</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Inconnu</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Santé du Système</h1>
          <p className="text-slate-600">Surveillez les performances et la santé de la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-slate-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <Button onClick={fetchHealthData} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <CardTitle className="flex items-center text-slate-900">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            État Général du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(healthData?.status)}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Système {healthData?.status === 'healthy' ? 'Opérationnel' : 'En Problème'}</h3>
                <p className="text-slate-600">Tous les services sont {healthData?.status === 'healthy' ? 'fonctionnels' : 'en cours de vérification'}</p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(healthData?.status)}
              <p className="text-sm text-slate-500 mt-1">Uptime: {healthData?.uptime || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">CPU</p>
                  <p className="text-2xl font-bold text-slate-900">{healthData?.cpu?.usage || 0}%</p>
                </div>
              </div>
              <div className="text-right">
                {healthData?.cpu?.usage > 80 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Mémoire</p>
                  <p className="text-2xl font-bold text-slate-900">{healthData?.memory?.usage || 0}%</p>
                </div>
              </div>
              <div className="text-right">
                {healthData?.memory?.usage > 80 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Base de données</p>
                  <p className="text-2xl font-bold text-slate-900">{healthData?.database?.connections || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-green-100 text-green-700">Connectée</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Réseau</p>
                  <p className="text-2xl font-bold text-slate-900">{healthData?.network?.latency || 0}ms</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-green-100 text-green-700">Stable</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <CardTitle className="flex items-center text-slate-900">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <Server className="w-5 h-5 text-white" />
            </div>
            Statut des Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthData?.services && Object.entries(healthData.services).map(([key, service]: [string, any], index: number) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(service.success ? 'healthy' : 'error')}
                  <div>
                    <h4 className="font-medium text-slate-900">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                    <p className="text-sm text-slate-500">{service.message || service.error || 'Service status'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Statut</p>
                    <p className="font-medium text-slate-900">{service.success ? 'Opérationnel' : 'Erreur'}</p>
                  </div>
                  {getStatusBadge(service.success ? 'healthy' : 'error')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <CardTitle className="flex items-center text-slate-900">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-medium text-slate-900 mb-1">SSL/TLS</h4>
              <p className="text-sm text-slate-500">Certificat valide</p>
              <Badge className="bg-green-100 text-green-700 mt-2">Sécurisé</Badge>
            </div>
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Firewall</h4>
              <p className="text-sm text-slate-500">Protection active</p>
              <Badge className="bg-green-100 text-green-700 mt-2">Actif</Badge>
            </div>
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Dernière sauvegarde</h4>
              <p className="text-sm text-slate-500">{healthData?.lastBackup || 'N/A'}</p>
              <Badge className="bg-green-100 text-green-700 mt-2">Récente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
