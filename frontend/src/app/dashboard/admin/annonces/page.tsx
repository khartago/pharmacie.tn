'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncementsAPI as AnnoncesAPI, ExportAPI, AnalyticsAPI } from '@/lib/api';
import { UnifiedTable, StatusBadge, Input } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Search, 
  Download, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AdminAnnoncesPage() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const columns = [
    { 
      key: 'medicine', 
      header: 'Médicament', 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-gray-900">{row.medicine?.brandName || '-'}</div>
          <div className="text-sm text-gray-500">{row.medicine?.dci || '-'}</div>
          <div className="text-xs text-gray-400">{row.medicine?.laboratoire || '-'}</div>
          {row.medicine?.atcCode && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
              ATC: {row.medicine.atcCode}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'pharmacyUser', 
      header: 'Pharmacie', 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-gray-900">{row.pharmacyUser?.name || '-'}</div>
          <div className="text-sm text-gray-500">{row.pharmacyUser?.city?.name || '-'}</div>
          {row.pharmacyUser?.phone && (
            <div className="text-xs text-blue-600">{row.pharmacyUser.phone}</div>
          )}
        </div>
      )
    },
    { 
      key: 'supplierUser', 
      header: 'Fournisseur', 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-gray-900">{row.supplierUser?.name || '-'}</div>
          <div className="text-sm text-gray-500">{row.supplierUser?.city?.name || '-'}</div>
          {row.supplierUser?.phone && (
            <div className="text-xs text-blue-600">{row.supplierUser.phone}</div>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Statut', 
      sortable: true, 
      render: (value: string) => <StatusBadge status={value} /> 
    },
    { 
      key: 'quantity', 
      header: 'Quantité', 
      sortable: true,
      render: (value: number, row: any) => {
        const quantity = value || 0;
        const isLowStock = quantity < 10;
        const isHighStock = quantity > 100;
        return (
          <div className="text-center">
            <span className={`font-semibold ${isLowStock ? 'text-red-600' : isHighStock ? 'text-green-600' : 'text-blue-600'}`}>
              {quantity}
            </span>
            {isLowStock && <div className="text-xs text-red-500">Stock faible</div>}
            {isHighStock && <div className="text-xs text-green-500">Stock élevé</div>}
          </div>
        );
      }
    },
    { 
      key: 'expiryDate', 
      header: 'Expiration', 
      sortable: true, 
      render: (value: string) => {
        const date = new Date(value);
        const now = new Date();
        const isExpired = date < now;
        const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        const isExpiringVerySoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${isExpired ? 'text-red-600' : isExpiringVerySoon ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
              {date.toLocaleDateString('fr-FR')}
            </div>
            {isExpired && <div className="text-xs text-red-500 font-semibold">Expiré</div>}
            {isExpiringVerySoon && !isExpired && <div className="text-xs text-red-500 font-semibold">Expire dans {daysUntilExpiry} jour(s)</div>}
            {isExpiringSoon && !isExpiringVerySoon && !isExpired && <div className="text-xs text-orange-500">Expire dans {daysUntilExpiry} jour(s)</div>}
            {!isExpired && !isExpiringSoon && <div className="text-xs text-gray-500">{daysUntilExpiry} jour(s) restant(s)</div>}
          </div>
        );
      }
    },
    { 
      key: 'createdAt', 
      header: 'Créé', 
      sortable: true, 
      render: (value: string) => {
        const date = new Date(value);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const isRecent = daysSinceCreation <= 7;
        const isOld = daysSinceCreation > 30;
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${isRecent ? 'text-green-600' : isOld ? 'text-gray-500' : 'text-gray-700'}`}>
              {date.toLocaleDateString('fr-FR')}
            </div>
            <div className="text-xs text-gray-500">
              {daysSinceCreation === 0 ? 'Aujourd\'hui' : 
               daysSinceCreation === 1 ? 'Hier' : 
               daysSinceCreation < 7 ? `Il y a ${daysSinceCreation} jour(s)` :
               daysSinceCreation < 30 ? `Il y a ${Math.floor(daysSinceCreation / 7)} semaine(s)` :
               `Il y a ${Math.floor(daysSinceCreation / 30)} mois`}
            </div>
          </div>
        );
      }
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
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
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    try {
      const [announcementsResponse, statsResponse] = await Promise.all([
        AnnoncesAPI.getAll({ limit: 1000 }), // Récupérer toutes les annonces
        AnalyticsAPI.getAnnouncementsStats()
      ]);
      
      if (announcementsResponse.success && announcementsResponse.data) {
        const announcements = (announcementsResponse.data as any).announcements;
        setAnnonces(Array.isArray(announcements) ? announcements : []);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch annonces:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (annonce: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        const response = await AnnoncesAPI.delete(annonce.id);
        if (response.success) {
          fetchAnnonces();
        }
      } catch (error) {
        console.error('Failed to delete annonce:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportAnnouncements();
      if (response.success) {
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annonces_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const filteredAnnonces = (annonces || []).filter(annonce => {
    const matchesSearch = annonce.medicine?.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.pharmacyUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.supplierUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || annonce.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  // Use real stats from API, fallback to calculated stats if API fails
  const displayStats = stats || {
    total: (annonces || []).length,
    active: (annonces || []).filter(a => a.status === 'AVAILABLE').length,
    pending: (annonces || []).filter(a => a.status === 'RESERVED').length,
    expired: (annonces || []).filter(a => a.status === 'EXPIRED').length
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Annonces</h1>
          <p className="text-slate-600">Gérez les annonces de médicaments de la plateforme</p>
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
                  <Megaphone className="w-6 h-6 text-white" />
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
                  <p className="text-sm font-medium text-slate-600">Disponibles</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.active}</p>
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
                  <p className="text-sm font-medium text-slate-600">Réservées</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.pending}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-red-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Expirées</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.expired}</p>
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
              placeholder="Rechercher par médicament, pharmacie ou fournisseur..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
            <SelectItem value="AVAILABLE">Disponible</SelectItem>
            <SelectItem value="RESERVED">Réservé</SelectItem>
            <SelectItem value="EXPIRED">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="card-modern-2025">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Liste des Annonces</span>
          </CardTitle>
          <CardDescription>
            {filteredAnnonces.length} annonce(s) trouvée(s) sur {annonces.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            data={filteredAnnonces}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
            emptyMessage="Aucune annonce disponible"
          />
        </CardContent>
      </Card>
    </div>
  );
}
