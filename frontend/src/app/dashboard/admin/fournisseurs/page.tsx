'use client';

import React, { useState, useEffect } from 'react';
import { FournisseursAPI, ExportAPI, CitiesAPI, AnalyticsAPI } from '@/lib/api';
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
  Truck, 
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
  Activity,
  Package
} from 'lucide-react';

export default function AdminFournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    fetchFournisseurs();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchCitiesByRegion(selectedRegion);
    }
  }, [selectedRegion]);

  const fetchFournisseurs = async () => {
    try {
      const [fournisseursResponse, statsResponse] = await Promise.all([
        FournisseursAPI.getAll(),
        AnalyticsAPI.getSuppliersStats()
      ]);
      
      if (fournisseursResponse.success && fournisseursResponse.data) {
        setFournisseurs(fournisseursResponse.data.data || []);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch fournisseurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await CitiesAPI.getAll({ limit: 1000 });
      if (response.success && response.data) {
        // CitiesAPI.getAll returns PaginatedResponse, so we need to access response.data.data
        const citiesData = response.data.data || response.data;
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
        setCities(Array.isArray(response.data) ? response.data : []);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Failed to fetch cities by region:', error);
      setCities([]);
    }
  };

  const handleCreate = () => {
    setSelectedFournisseur({
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
    setFormErrors({});
  };

  const handleEdit = (fournisseur: any) => {
    // Map enum region to display name
    const regionMap: { [key: string]: string } = {
      'TUNIS': 'Tunis',
      'ARIANA': 'Ariana',
      'BEN_AROUS': 'Ben Arous',
      'MANOUBA': 'Manouba',
      'NABEUL': 'Nabeul',
      'ZAGHOUAN': 'Zaghouan',
      'BIZERTE': 'Bizerte',
      'BEJA': 'Béja',
      'JENDOUBA': 'Jendouba',
      'KEF': 'Kef',
      'SILIANA': 'Siliana',
      'SOUSSE': 'Sousse',
      'MONASTIR': 'Monastir',
      'MAHDIA': 'Mahdia',
      'SFAX': 'Sfax',
      'KAIROUAN': 'Kairouan',
      'KASSERINE': 'Kasserine',
      'SIDI_BOUZID': 'Sidi Bouzid',
      'GABES': 'Gabès',
      'MEDENINE': 'Médenine',
      'TATAOUINE': 'Tataouine',
      'GAFSA': 'Gafsa',
      'TOZEUR': 'Tozeur',
      'KEBILI': 'Kébili'
    };

    const displayRegion = regionMap[fournisseur.city?.region] || fournisseur.city?.region || '';

    setSelectedFournisseur({
      ...fournisseur,
      region: displayRegion,
      cityId: fournisseur.cityId?.toString() || ''
    });
    setIsEditMode(true);
    setIsModalOpen(true);
    
    // If the fournisseur has a city, fetch cities for that region
    if (fournisseur.city?.region) {
      fetchCitiesByRegion(displayRegion);
    }
  };

  const handleToggleStatus = async (fournisseur: any) => {
    try {
      const newStatus = !fournisseur.isActive;
      const response = await FournisseursAPI.updateStatus(fournisseur.id, newStatus);
      if (response.success) {
        showSuccessToast(`Fournisseur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        fetchFournisseurs();
      } else {
        showErrorToast('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showErrorToast('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (fournisseur: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        const response = await FournisseursAPI.delete(fournisseur.id);
        if (response.success) {
          fetchFournisseurs();
        }
      } catch (error) {
        console.error('Failed to delete fournisseur:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportFournisseurs();
      if (response.success) {
        // Handle download
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fournisseurs.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredFournisseurs = fournisseurs.filter(fournisseur => {
    const matchesSearch = fournisseur.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fournisseur.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fournisseur.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && fournisseur.isActive) ||
                         (statusFilter === 'inactive' && !fournisseur.isActive);
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from actual data if API stats are not available
  const displayStats = stats || {
    total: fournisseurs.length,
    active: fournisseurs.filter(f => f.isActive).length,
    inactive: fournisseurs.filter(f => !f.isActive).length,
    new: fournisseurs.filter(f => f.address && f.address.trim() !== '').length
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!validateRequired(selectedFournisseur?.name)) {
      errors.name = 'Le nom du fournisseur est requis';
    }

    if (!validateRequired(selectedFournisseur?.email)) {
      errors.email = 'L\'email est requis';
    } else if (!validateEmail(selectedFournisseur.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (selectedFournisseur?.phone && !validatePhone(selectedFournisseur.phone)) {
      errors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    if (!validateRequired(selectedFournisseur?.address)) {
      errors.address = 'L\'adresse est requise';
    }

    if (!validateRequired(selectedFournisseur?.region)) {
      errors.region = 'La région est requise';
    }

    if (!selectedFournisseur?.cityId || selectedFournisseur.cityId === '') {
      errors.cityId = 'La ville est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveFournisseur = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const response = await FournisseursAPI.update(selectedFournisseur.id, {
          name: selectedFournisseur.name,
          email: selectedFournisseur.email,
          phone: selectedFournisseur.phone,
          address: selectedFournisseur.address,
          cityId: parseInt(selectedFournisseur.cityId),
          isActive: selectedFournisseur.isActive
        });
        if (response.success) {
          showSuccessToast('Fournisseur modifié avec succès');
          fetchFournisseurs();
          setIsModalOpen(false);
        } else {
          showErrorToast('Erreur lors de la modification');
        }
      } else {
        const response = await FournisseursAPI.create({
          name: selectedFournisseur.name,
          email: selectedFournisseur.email,
          phone: selectedFournisseur.phone,
          address: selectedFournisseur.address,
          cityId: parseInt(selectedFournisseur.cityId),
          isActive: selectedFournisseur.isActive
        });
        
        if (response.success) {
          showSuccessToast('Fournisseur créé avec succès');
          fetchFournisseurs();
          setIsModalOpen(false);
        } else {
          showErrorToast(response.error || 'Erreur lors de la création du fournisseur');
        }
      }
    } catch (error) {
      console.error('Failed to save fournisseur:', error);
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Fournisseurs</h1>
          <p className="text-slate-600">Gérez les fournisseurs inscrits sur la plateforme</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Fournisseurs</p>
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
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Actifs</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.active}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Inactifs</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.inactive}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Avec Adresse</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.new}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
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
              <Truck className="w-5 h-5 text-white" />
            </div>
            Liste des Fournisseurs
          </CardTitle>
          <CardDescription>
            {filteredFournisseurs.length} fournisseur{filteredFournisseurs.length !== 1 ? 's' : ''} trouvé{filteredFournisseurs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            columns={columns}
            data={filteredFournisseurs}
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
          title={isEditMode ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du fournisseur *
              </label>
              <Input
                value={selectedFournisseur?.name || ''}
                onChange={(e) => {
                  setSelectedFournisseur({...selectedFournisseur, name: e.target.value});
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
                value={selectedFournisseur?.email || ''}
                onChange={(e) => {
                  setSelectedFournisseur({...selectedFournisseur, email: e.target.value});
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
                value={selectedFournisseur?.phone || ''}
                onChange={(e) => {
                  setSelectedFournisseur({...selectedFournisseur, phone: e.target.value});
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
                value={selectedFournisseur?.address || ''}
                onChange={(e) => {
                  setSelectedFournisseur({...selectedFournisseur, address: e.target.value});
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
                value={selectedFournisseur?.region || selectedRegion} 
                onValueChange={(value) => {
                  setSelectedFournisseur({...selectedFournisseur, region: value, cityId: ''});
                  setSelectedRegion(value);
                  if (formErrors.region) setFormErrors({...formErrors, region: ''});
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
                value={selectedFournisseur?.cityId?.toString() || ''} 
                onValueChange={(value) => {
                  setSelectedFournisseur({...selectedFournisseur, cityId: value});
                  if (formErrors.cityId) setFormErrors({...formErrors, cityId: ''});
                }}
                disabled={!selectedFournisseur?.region}
              >
                <SelectTrigger className={formErrors.cityId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {filterCitiesByRegion(cities || [], selectedFournisseur?.region || '').map(city => (
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
                value={selectedFournisseur?.isActive ? 'active' : 'inactive'} 
                onValueChange={(value) => setSelectedFournisseur({...selectedFournisseur, isActive: value === 'active'})}
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
              <Button onClick={handleSaveFournisseur}>
                {isEditMode ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
