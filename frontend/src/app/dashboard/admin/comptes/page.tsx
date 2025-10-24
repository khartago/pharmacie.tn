'use client';

import React, { useState, useEffect } from 'react';
import { AccountsAPI, ExportAPI, CitiesAPI, AnalyticsAPI } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { UnifiedTable, Modal } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { TUNISIA_REGIONS } from '@/lib/constants';
import { validateEmail, validatePhone, validateRequired } from '@/lib/validation';
import { filterCitiesByRegion } from '@/lib/utils/regionMapping';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Shield,
  Activity,
  UserCheck,
  UserX
} from 'lucide-react';

export default function AdminComptesPage() {
  const [comptes, setComptes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompte, setSelectedCompte] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createdPassword, setCreatedPassword] = useState<string>('');

  const columns = [
    { key: 'name', header: 'Nom', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Rôle', sortable: true, render: (value: any) => value?.name || 'N/A' },
    { key: 'isActive', header: 'Statut', sortable: true, 
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    { key: 'lastLoginAt', header: 'Dernière connexion', sortable: true, render: (value: string) => value ? new Date(value).toLocaleDateString('fr-FR') : 'Jamais' },
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
    fetchComptes();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchCitiesByRegion(selectedRegion);
    }
  }, [selectedRegion]);

  const fetchComptes = async () => {
    try {
      const [comptesResponse, statsResponse] = await Promise.all([
        AccountsAPI.getAll(),
        AnalyticsAPI.getAccountsStats()
      ]);
      
      if (comptesResponse.success && comptesResponse.data) {
        setComptes(comptesResponse.data.data || []);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch comptes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await CitiesAPI.getAll({ limit: 1000 });
      if (response.success && response.data) {
        const citiesData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const fetchCitiesByRegion = async (region: string) => {
    try {
      const response = await CitiesAPI.getByRegion(region);
      if (response.success && response.data) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cities by region:', error);
    }
  };

  const handleCreate = () => {
    setSelectedCompte({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'ADMIN',
      cityId: '',
      region: '',
      isActive: true
    });
    setCreatedPassword('');
    setFormErrors({});
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (compte: any) => {
    setSelectedCompte(compte);
    setCreatedPassword('');
    setFormErrors({});
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (compte: any) => {
    try {
      const newStatus = !compte.isActive;
      const response = await AccountsAPI.updateStatus(compte.id, newStatus);
      if (response.success) {
        showSuccessToast(`Compte ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        fetchComptes();
      } else {
        showErrorToast('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showErrorToast('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (compte: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      try {
        const response = await AccountsAPI.delete(compte.id);
        if (response.success) {
          fetchComptes();
        }
      } catch (error) {
        console.error('Failed to delete compte:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportAccounts();
      if (response.success) {
        // Handle download
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'comptes.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredComptes = comptes.filter(compte => {
    const matchesSearch = compte.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         compte.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && compte.isActive) ||
                         (statusFilter === 'inactive' && !compte.isActive);
    const matchesRole = roleFilter === 'all' || compte.role?.name === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Use real stats from API instead of manual calculations
  const displayStats = stats || {
    total: 0,
    active: 0,
    inactive: 0,
    new: 0,
    byRole: {}
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!validateRequired(selectedCompte?.name)) {
      errors.name = 'Le nom est requis';
    }

    if (!validateRequired(selectedCompte?.email)) {
      errors.email = 'L\'email est requis';
    } else if (!validateEmail(selectedCompte.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (selectedCompte?.phone && !validatePhone(selectedCompte.phone)) {
      errors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    if (!validateRequired(selectedCompte?.role)) {
      errors.role = 'Le rôle est requis';
    }

    // Conditional validation for PHARMACY and SUPPLIER roles
    if (selectedCompte?.role === 'PHARMACY' || selectedCompte?.role === 'SUPPLIER') {
      if (!validateRequired(selectedCompte?.address)) {
        errors.address = 'L\'adresse est requise';
      }
      if (!validateRequired(selectedCompte?.region)) {
        errors.region = 'La région est requise';
      }
      if (!validateRequired(selectedCompte?.cityId)) {
        errors.cityId = 'La ville est requise';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCompte = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const response = await AccountsAPI.update(selectedCompte.id, {
          name: selectedCompte.name,
          email: selectedCompte.email,
          phone: selectedCompte.phone,
          address: selectedCompte.address,
          status: selectedCompte.isActive ? 'ACTIVE' : 'INACTIVE'
        });
        if (response.success) {
          showSuccessToast('Compte modifié avec succès');
          fetchComptes();
          setIsModalOpen(false);
        } else {
          showErrorToast('Erreur lors de la modification');
        }
      } else {
        const response = await AccountsAPI.create({
          name: selectedCompte.name,
          email: selectedCompte.email,
          phone: selectedCompte.phone,
          address: selectedCompte.address,
          cityName: selectedCompte.cityName,
          regionName: selectedCompte.regionName,
          role: selectedCompte.role
        });
        
        if (response.success) {
          showSuccessToast('Compte créé avec succès');
          setCreatedPassword(''); // Password not returned in response
          fetchComptes();
          // Don't close modal immediately to show password
          setTimeout(() => {
            setIsModalOpen(false);
            setCreatedPassword('');
          }, 5000);
        } else {
          showErrorToast(response.error || 'Erreur lors de la création du compte');
        }
      }
    } catch (error) {
      console.error('Failed to save compte:', error);
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Comptes</h1>
          <p className="text-slate-600">Gérez les comptes utilisateurs de la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button onClick={handleCreate} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-4 w-4" />
            <span>Ajouter un compte</span>
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Comptes</p>
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
                  <UserCheck className="w-6 h-6 text-white" />
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
                  <UserX className="w-6 h-6 text-white" />
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
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-2xl font-bold text-slate-900">{displayStats.byRole?.ADMIN || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Pharmacies</p>
                <p className="text-2xl font-bold text-slate-900">{displayStats.byRole?.PHARMACY || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Fournisseurs</p>
                <p className="text-2xl font-bold text-slate-900">{displayStats.byRole?.SUPPLIER || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Administrateurs</p>
                <p className="text-2xl font-bold text-slate-900">{displayStats.byRole?.ADMIN || 0}</p>
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
                  placeholder="Rechercher par nom ou email..."
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pharmacy">Pharmacie</SelectItem>
                <SelectItem value="fournisseur">Fournisseur</SelectItem>
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
              <Users className="w-5 h-5 text-white" />
            </div>
            Liste des Comptes
          </CardTitle>
          <CardDescription>
            {filteredComptes.length} compte{filteredComptes.length !== 1 ? 's' : ''} trouvé{filteredComptes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            columns={columns}
            data={filteredComptes}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditMode ? 'Modifier le compte' : 'Ajouter un compte'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <Input
                value={selectedCompte?.name || ''}
                onChange={(e) => {
                  setSelectedCompte({...selectedCompte, name: e.target.value});
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
                value={selectedCompte?.email || ''}
                onChange={(e) => {
                  setSelectedCompte({...selectedCompte, email: e.target.value});
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
                value={selectedCompte?.phone || ''}
                onChange={(e) => {
                  setSelectedCompte({...selectedCompte, phone: e.target.value});
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
                Rôle *
              </label>
              <Select 
                value={selectedCompte?.role || 'ADMIN'} 
                onValueChange={(value) => {
                  setSelectedCompte({...selectedCompte, role: value});
                  if (formErrors.role) setFormErrors({...formErrors, role: ''});
                }}
              >
                <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="PHARMACY">Pharmacie</SelectItem>
                  <SelectItem value="SUPPLIER">Fournisseur</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
              )}
            </div>

            {/* Conditional fields for PHARMACY and SUPPLIER roles */}
            {(selectedCompte?.role === 'PHARMACY' || selectedCompte?.role === 'SUPPLIER') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <Textarea
                    value={selectedCompte?.address || ''}
                    onChange={(e) => {
                      setSelectedCompte({...selectedCompte, address: e.target.value});
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
                    value={selectedCompte?.region || selectedRegion} 
                    onValueChange={(value) => {
                      setSelectedCompte({...selectedCompte, region: value, cityId: ''});
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
                    value={selectedCompte?.cityId || ''} 
                    onValueChange={(value) => {
                      setSelectedCompte({...selectedCompte, cityId: value});
                      if (formErrors.cityId) setFormErrors({...formErrors, cityId: ''});
                    }}
                    disabled={!selectedCompte?.region}
                  >
                    <SelectTrigger className={formErrors.cityId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterCitiesByRegion(cities || [], selectedCompte?.region || '').map(city => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.cityId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.cityId}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select 
                value={selectedCompte?.isActive ? 'active' : 'inactive'} 
                onValueChange={(value) => setSelectedCompte({...selectedCompte, isActive: value === 'active'})}
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

            {/* Show generated password after creation */}
            {createdPassword && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Compte créé avec succès!</h4>
                <p className="text-sm text-green-800 mb-2">Mot de passe généré:</p>
                <div className="bg-white p-2 rounded border font-mono text-sm">
                  {createdPassword}
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Veuillez noter ce mot de passe et le communiquer à l'utilisateur.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveCompte}>
                {isEditMode ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
