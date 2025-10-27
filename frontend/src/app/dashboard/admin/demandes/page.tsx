'use client';

import React, { useState, useEffect } from 'react';
import { RequestsAPI, ExportAPI, AnalyticsAPI } from '@/lib/api';
import { UnifiedTable, StatusBadge } from '@/components';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Search, 
  Download, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AdminDemandesPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const columns = [
    { 
      key: 'medicine', 
      header: 'Médicament', 
      sortable: true,
      render: (value: any, row: any) => row.medicine?.brandName || '-'
    },
    { 
      key: 'user', 
      header: 'Pharmacie', 
      sortable: true,
      render: (value: any, row: any) => row.user?.name || '-'
    },
    { key: 'quantity', header: 'Quantité', sortable: true },
    { 
      key: 'status', 
      header: 'Statut', 
      sortable: true, 
      render: (value: string) => <StatusBadge status={value} /> 
    },
    { key: 'region', header: 'Région', sortable: true },
    { 
      key: 'createdAt', 
      header: 'Créé le', 
      sortable: true, 
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR') 
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          {/* Only show toggle button for OPEN and CLOSED statuses */}
          {(row.status === 'OPEN' || row.status === 'CLOSED') && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(row);
              }}
              className="h-8 px-3"
            >
              {row.status === 'OPEN' ? 'Fermer' : 'Rouvrir'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const [requestsResponse, statsResponse] = await Promise.all([
        RequestsAPI.getAll({ limit: 1000 }), // Récupérer toutes les demandes
        AnalyticsAPI.getRequestsStats()
      ]);
      
      if (requestsResponse.success && requestsResponse.data) {
        setDemandes((requestsResponse.data as any).requests || []);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch demandes:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleToggleStatus = async (demande: any) => {
    try {
      let newStatus;
      if (demande.status === 'OPEN') {
        newStatus = 'CLOSED';
      } else if (demande.status === 'CLOSED') {
        newStatus = 'OPEN';
      } else {
        // For other statuses like ACCEPTED, EXPIRED, don't allow toggle
        return;
      }
      
      const response = await RequestsAPI.update(demande.id, { status: newStatus });
      if (response.success) {
        fetchDemandes();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDelete = async (demande: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        const response = await RequestsAPI.delete(demande.id);
        if (response.success) {
          fetchDemandes();
        }
      } catch (error) {
        console.error('Failed to delete demande:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportRequests();
      if (response.success) {
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `demandes_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = demande.medicine?.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demande.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || demande.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Use real stats from API, fallback to calculated stats if API fails
  const displayStats = stats || {
    total: demandes.length,
    open: demandes.filter(d => d.status === 'OPEN').length,
    closed: demandes.filter(d => d.status === 'CLOSED').length,
    accepted: demandes.filter(d => d.status === 'ACCEPTED').length,
    expired: demandes.filter(d => d.status === 'EXPIRED').length
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-96 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Demandes</h1>
          <p className="text-slate-600">Gérez les demandes de médicaments de la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.total}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Ouvertes</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.open}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-orange-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Fermées</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.closed}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-purple-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Acceptées</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.accepted}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par médicament ou pharmacie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="OPEN">Ouvert</SelectItem>
            <SelectItem value="CLOSED">Fermé</SelectItem>
            <SelectItem value="ACCEPTED">Accepté</SelectItem>
            <SelectItem value="EXPIRED">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="card-modern-2025">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Liste des Demandes</span>
          </CardTitle>
          <CardDescription>
            {filteredDemandes.length} demande(s) trouvée(s) sur {demandes.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            data={filteredDemandes}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            emptyMessage="Aucune demande disponible"
          />
        </CardContent>
      </Card>
    </div>
  );
}
