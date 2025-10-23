'use client';

import React, { useState, useEffect } from 'react';
import { PharmaciesAPI, ExportAPI, CitiesAPI, AnalyticsAPI } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { UnifiedTable, StatusBadge, ExportButton, Modal, Input, Textarea } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { TUNISIA_REGIONS } from '@/lib/constants';
import { validateEmail, validatePhone, validateRequired } from '@/lib/validation';
import { filterCitiesByRegion } from '@/lib/utils/regionMapping';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Activity
} from 'lucide-react';

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [subscriptionFormData, setSubscriptionFormData] = useState<any>({});

  const columns = [
    { key: 'name', header: 'Nom', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Téléphone', sortable: false },
    { key: 'address', header: 'Adresse', sortable: false },
    { key: 'city', header: 'Ville', sortable: true, render: (value: any) => value?.name || 'N/A' },
    { key: 'isActive', header: 'Statut', sortable: true, 
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'default'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    { key: 'subscription', header: 'Abonnement', sortable: true, 
      render: (value: any, row: any) => {
        const sub = row.subscriptions?.[0];
        if (!sub) return (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Aucun</Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleManageSubscription(row)}
            >
              Gérer
            </Button>
          </div>
        );
        return (
          <div className="flex items-center space-x-2">
            <div>
              <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'TRIAL' ? 'warning' : 'destructive'}>
                {sub.status === 'ACTIVE' ? 'Actif' : sub.status === 'TRIAL' ? 'Essai' : 'Expiré'}
              </Badge>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(sub.endDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleManageSubscription(row)}
            >
              Gérer
            </Button>
          </div>
        );
      }
    },
    { key: 'createdAt', header: 'Créé le', sortable: true, render: (value: string) => new Date(value).toLocaleDateString('fr-FR') },
    { key: 'actions', header: 'Actions', sortable: false, 
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
          >
            {row.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchPharmacies();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchCitiesByRegion(selectedRegion);
    }
  }, [selectedRegion]);

  const fetchPharmacies = async () => {
    try {
      const [pharmaciesResponse, statsResponse] = await Promise.all([
        PharmaciesAPI.getAll(),
        AnalyticsAPI.getPharmaciesStats()
      ]);
      
      if (pharmaciesResponse.success && pharmaciesResponse.data) {
        setPharmacies(pharmaciesResponse.data.pharmacies || []);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      console.log('Fetching cities...');
      const response = await CitiesAPI.getAll({ limit: 1000 });
      console.log('Cities API response:', response);
      if (response.success && response.data) {
        // CitiesAPI.getAll returns PaginatedResponse, so we need to access response.data.data
        const citiesData = response.data.data || response.data;
        console.log('Setting cities:', citiesData);
        setCities(Array.isArray(citiesData) ? citiesData : []);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    }
  };

  const fetchCitiesByRegion = async (region: string) => {
    try {
      const response = await CitiesAPI.getByRegion(region);
      if (response.success && response.data) {
        // CitiesAPI.getByRegion returns direct array or paginated response
        const citiesData = response.data.data || response.data;
        setCities(Array.isArray(citiesData) ? citiesData : []);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Failed to fetch cities by region:', error);
      setCities([]);
    }
  };

  const handleCreate = () => {
    setSelectedPharmacy({
      name: '',
      email: '',
      phone: '',
      address: '',
      region: '',
      cityId: '',
      isActive: true
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (pharmacy: any) => {
    try {
      const newStatus = !pharmacy.isActive;
      const response = await PharmaciesAPI.updateStatus(pharmacy.id, newStatus);
      if (response.success) {
        showSuccessToast(`Pharmacie ${newStatus ? 'activée' : 'désactivée'} avec succès`);
        fetchPharmacies();
      } else {
        showErrorToast('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showErrorToast('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (pharmacy: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pharmacie ?')) {
      try {
        const response = await PharmaciesAPI.delete(pharmacy.id);
        if (response.success) {
          showSuccessToast('Pharmacie supprimée avec succès');
          fetchPharmacies();
        } else {
          showErrorToast('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Failed to delete pharmacy:', error);
        showErrorToast('Erreur lors de la suppression');
      }
    }
  };

  const handleManageSubscription = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    if (pharmacy.subscriptions?.[0]) {
      setSubscriptionFormData({
        status: pharmacy.subscriptions[0].status,
        endDate: new Date(pharmacy.subscriptions[0].endDate).toISOString().split('T')[0]
      });
    } else {
      setSubscriptionFormData({
        status: 'TRIAL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    setIsSubscriptionModalOpen(true);
  };

  const handleCreateSubscription = async (subscriptionData: any) => {
    try {
      const response = await PharmaciesAPI.createSubscription(selectedPharmacy.id, subscriptionData);
      if (response.success) {
        showSuccessToast('Abonnement créé avec succès');
        fetchPharmacies();
        setIsSubscriptionModalOpen(false);
      } else {
        showErrorToast('Erreur lors de la création de l\'abonnement');
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      showErrorToast('Erreur lors de la création de l\'abonnement');
    }
  };

  const handleUpdateSubscription = async (subscriptionId: number, subscriptionData: any) => {
    try {
      const response = await PharmaciesAPI.updateSubscription(selectedPharmacy.id, subscriptionId, subscriptionData);
      if (response.success) {
        showSuccessToast('Abonnement mis à jour avec succès');
        fetchPharmacies();
        setIsSubscriptionModalOpen(false);
      } else {
        showErrorToast('Erreur lors de la mise à jour de l\'abonnement');
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      showErrorToast('Erreur lors de la mise à jour de l\'abonnement');
    }
  };

  const handleSaveSubscription = async () => {
    try {
      if (selectedPharmacy.subscriptions?.[0]) {
        // Update existing subscription
        await handleUpdateSubscription(selectedPharmacy.subscriptions[0].id, subscriptionFormData);
      } else {
        // Create new subscription
        await handleCreateSubscription(subscriptionFormData);
      }
    } catch (error) {
      console.error('Failed to save subscription:', error);
      showErrorToast('Erreur lors de la sauvegarde de l\'abonnement');
    }
  };

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportPharmacies();
      if (response.success) {
        // Handle download
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pharmacies.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pharmacy.isActive) ||
                         (statusFilter === 'inactive' && !pharmacy.isActive);
    return matchesSearch && matchesStatus;
  });

  // Use real stats from API instead of manual calculations
  const displayStats = stats || {
    total: 0,
    active: 0,
    inactive: 0,
    new: 0
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!validateRequired(selectedPharmacy?.name)) {
      errors.name = 'Le nom de la pharmacie est requis';
    }

    if (!validateRequired(selectedPharmacy?.email)) {
      errors.email = 'L\'email est requis';
    } else if (!validateEmail(selectedPharmacy.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }


    if (selectedPharmacy?.phone && !validatePhone(selectedPharmacy.phone)) {
      errors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    if (!validateRequired(selectedPharmacy?.address)) {
      errors.address = 'L\'adresse est requise';
    }

    if (!validateRequired(selectedPharmacy?.region)) {
      errors.region = 'La région est requise';
    }

    if (!validateRequired(selectedPharmacy?.cityId)) {
      errors.cityId = 'La ville est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePharmacy = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const response = await PharmaciesAPI.update(selectedPharmacy.id, {
          name: selectedPharmacy.name,
          email: selectedPharmacy.email,
          phone: selectedPharmacy.phone,
          address: selectedPharmacy.address,
          cityId: selectedPharmacy.cityId,
          isActive: selectedPharmacy.isActive
        });
        if (response.success) {
          showSuccessToast('Pharmacie modifiée avec succès');
          fetchPharmacies();
          setIsModalOpen(false);
        } else {
          showErrorToast('Erreur lors de la modification');
        }
      } else {
        const response = await PharmaciesAPI.create({
          name: selectedPharmacy.name,
          email: selectedPharmacy.email,
          phone: selectedPharmacy.phone,
          address: selectedPharmacy.address,
          cityId: selectedPharmacy.cityId,
          isActive: selectedPharmacy.isActive
        });
        
        if (response.success) {
          showSuccessToast('Pharmacie créée avec succès');
          fetchPharmacies();
          setIsModalOpen(false);
        } else {
          showErrorToast(response.error || 'Erreur lors de la création de la pharmacie');
        }
      }
    } catch (error) {
      console.error('Failed to save pharmacy:', error);
      showErrorToast('Erreur lors de la sauvegarde');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Pharmacies</h1>
          <p className="text-slate-600">Gérez les pharmacies inscrites sur la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button onClick={handleCreate} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Version améliorée */}
      <div className="space-y-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Pharmacies</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.totalPharmacies || 0}</p>
                    <p className="text-xs text-slate-500">+{displayStats.newPharmaciesThisMonth || 0} ce mois</p>
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
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Actives</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.activePharmacies || 0}</p>
                    <p className="text-xs text-slate-500">{displayStats.activePercentage || 0}% du total</p>
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Inactives</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.inactivePharmacies || 0}</p>
                    <p className="text-xs text-slate-500">Pharmacies désactivées</p>
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
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avec Abonnement Actif</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.pharmaciesWithActiveSubscription || 0}</p>
                    <p className="text-xs text-slate-500">{displayStats.subscriptionPercentage || 0}% du total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-yellow-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Essais</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.pharmaciesWithTrialSubscription || 0}</p>
                    <p className="text-xs text-slate-500">Période d'essai</p>
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
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Expirés</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.pharmaciesWithExpiredSubscription || 0}</p>
                    <p className="text-xs text-slate-500">Abonnements expirés</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-gray-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Sans Abonnement</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.pharmaciesWithoutSubscription || 0}</p>
                    <p className="text-xs text-slate-500">Aucun abonnement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-indigo-200 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Nouvelles cette semaine</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.newPharmaciesThisWeek || 0}</p>
                    <p className="text-xs text-slate-500">Inscriptions récentes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-modern-2025">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou adresse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <CardTitle className="flex items-center text-slate-900">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Liste des Pharmacies
          </CardTitle>
          <CardDescription>
            {filteredPharmacies.length} pharmacie{filteredPharmacies.length !== 1 ? 's' : ''} trouvée{filteredPharmacies.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            columns={columns}
            data={filteredPharmacies}
            pageSize={10}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditMode ? 'Modifier la pharmacie' : 'Ajouter une pharmacie'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la pharmacie *
              </label>
              <Input
                value={selectedPharmacy?.name || ''}
                onChange={(e) => {
                  setSelectedPharmacy({...selectedPharmacy, name: e.target.value});
                  if (formErrors.name) setFormErrors({...formErrors, name: ''});
                }}
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={selectedPharmacy?.email || ''}
                onChange={(e) => {
                  setSelectedPharmacy({...selectedPharmacy, email: e.target.value});
                  if (formErrors.email) setFormErrors({...formErrors, email: ''});
                }}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <Input
                value={selectedPharmacy?.phone || ''}
                onChange={(e) => {
                  setSelectedPharmacy({...selectedPharmacy, phone: e.target.value});
                  if (formErrors.phone) setFormErrors({...formErrors, phone: ''});
                }}
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <Textarea
                value={selectedPharmacy?.address || ''}
                onChange={(e) => {
                  setSelectedPharmacy({...selectedPharmacy, address: e.target.value});
                  if (formErrors.address) setFormErrors({...formErrors, address: ''});
                }}
                className={formErrors.address ? 'border-red-500' : ''}
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région *
              </label>
              <Select 
                value={selectedPharmacy?.region || selectedRegion} 
                onValueChange={(value) => {
                  setSelectedPharmacy({...selectedPharmacy, region: value, cityId: ''});
                  setSelectedRegion(value);
                  if (formErrors.region) setFormErrors({...formErrors, region: ''});
                  // Recharger les villes pour cette région
                  fetchCitiesByRegion(value);
                }}
              >
                <SelectTrigger className={formErrors.region ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une région" />
                </SelectTrigger>
                <SelectContent>
                  {TUNISIA_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.region && (
                <p className="text-red-500 text-sm mt-1">{formErrors.region}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <Select 
                value={selectedPharmacy?.cityId || ''} 
                onValueChange={(value) => {
                  setSelectedPharmacy({...selectedPharmacy, cityId: value});
                  if (formErrors.cityId) setFormErrors({...formErrors, cityId: ''});
                }}
                disabled={!selectedPharmacy?.region}
              >
                <SelectTrigger className={formErrors.cityId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {filterCitiesByRegion(cities || [], selectedPharmacy?.region || '').map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.cityId && (
                <p className="text-red-500 text-sm mt-1">{formErrors.cityId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select 
                value={selectedPharmacy?.isActive ? 'active' : 'inactive'} 
                onValueChange={(value) => setSelectedPharmacy({...selectedPharmacy, isActive: value === 'active'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSavePharmacy}>
                {isEditMode ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Subscription Management Modal */}
      {isSubscriptionModalOpen && (
        <Modal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          title="Gérer l'abonnement"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Pharmacie: {selectedPharmacy?.name}</h3>
              <p className="text-sm text-gray-600">Gérez l'abonnement de cette pharmacie</p>
            </div>

            {selectedPharmacy?.subscriptions?.[0] ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Abonnement actuel</h4>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm flex items-center">
                      <span className="font-medium">Statut:</span> 
                      <Badge variant={selectedPharmacy.subscriptions[0].status === 'ACTIVE' ? 'success' : 'warning'} className="ml-2">
                        {selectedPharmacy.subscriptions[0].status}
                      </Badge>
                    </div>
                    <p className="text-sm"><span className="font-medium">Début:</span> {new Date(selectedPharmacy.subscriptions[0].startDate).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm"><span className="font-medium">Fin:</span> {new Date(selectedPharmacy.subscriptions[0].endDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau statut
                    </label>
                    <Select 
                      value={subscriptionFormData.status} 
                      onValueChange={(value) => {
                        setSubscriptionFormData({...subscriptionFormData, status: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRIAL">Essai</SelectItem>
                        <SelectItem value="ACTIVE">Actif</SelectItem>
                        <SelectItem value="EXPIRED">Expiré</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouvelle date de fin
                    </label>
                    <Input
                      type="date"
                      value={subscriptionFormData.endDate}
                      onChange={(e) => {
                        setSubscriptionFormData({...subscriptionFormData, endDate: e.target.value});
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveSubscription}
                    className="w-full"
                  >
                    Sauvegarder les modifications
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">Aucun abonnement actif</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début
                    </label>
                    <Input
                      type="date"
                      value={subscriptionFormData.startDate}
                      onChange={(e) => setSubscriptionFormData({...subscriptionFormData, startDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin
                    </label>
                    <Input
                      type="date"
                      value={subscriptionFormData.endDate}
                      onChange={(e) => setSubscriptionFormData({...subscriptionFormData, endDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <Select 
                      value={subscriptionFormData.status} 
                      onValueChange={(value) => setSubscriptionFormData({...subscriptionFormData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRIAL">Essai</SelectItem>
                        <SelectItem value="ACTIVE">Actif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSaveSubscription}
                    className="w-full"
                  >
                    Créer l'abonnement
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
