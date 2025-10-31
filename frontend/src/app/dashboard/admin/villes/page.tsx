'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, MapPin, Building2, TrendingUp, Calendar, Edit, Trash2 } from 'lucide-react';
import { UnifiedTable, Modal, Input } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { TUNISIA_REGIONS } from '@/lib/constants';
import { validateRequired } from '@/lib/validation';
import { AdminCitiesAPI, City, CityStats } from '@/lib/api';


const AdminCitiesPage = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [stats, setStats] = useState<CityStats>({
    total: 0,
    byRegion: {},
    mostUsed: { name: '', count: 0 },
    recentlyAdded: 0,
    totalRegions: 24 // Total regions in Tunisia
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    region: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const columns = [
    { key: 'name', header: 'Nom de la ville', sortable: true },
    { key: 'region', header: 'Région', sortable: true },
    { key: 'userCount', header: 'Utilisateurs', sortable: true },
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

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 1000
      };
      
      // Only add region if it's not 'all'
      if (regionFilter !== 'all') {
        params.region = regionFilter;
      }
      
      // Only add search if there's a search term
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm;
      }
      
      const response = await AdminCitiesAPI.getAll(params);    
      if (response.success && response.data) {
        setCities(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, regionFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await AdminCitiesAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchCities();
    fetchStats();
  }, [fetchCities, fetchStats]);

  // Remove the duplicate useEffect since fetchCities already depends on searchTerm and regionFilter

  const handleCreate = () => {
    setEditingCity(null);
    setFormData({ name: '', region: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({ name: city.name, region: city.region });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (city: City) => {
    if (city.userCount > 0) {
      alert('Impossible de supprimer une ville avec des utilisateurs');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${city.name} ?`)) {
      try {
        const response = await AdminCitiesAPI.delete(city.id);
        if (response.success) {
          setCities(cities.filter(c => c.id !== city.id));
          fetchStats();
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!validateRequired(formData.name)) {
      errors.name = 'Le nom de la ville est requis';
    }

    if (!validateRequired(formData.region)) {
      errors.region = 'La région est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingCity) {
        const response = await AdminCitiesAPI.update(editingCity.id, formData);
        if (response.success && response.data) {
          setCities(cities.map(c =>
            c.id === editingCity.id ? response.data! : c       
          ));
        } else {
          alert('Erreur lors de la modification');
          return;
        }
      } else {
        const response = await AdminCitiesAPI.create(formData);
        if (response.success && response.data) {
          setCities([...cities, response.data]);
        } else {
          alert('Erreur lors de la création');
          return;
        }
      }

      setIsModalOpen(false);
      fetchStats();
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'all' || city.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Villes</h1>
          <p className="text-slate-600">Gérez les villes tunisiennes</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4" />
          Ajouter une ville
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Villes</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
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
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Régions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalRegions ?? Object.keys(stats.byRegion).length}</p>
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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Plus utilisée</p>
                  <p className="text-lg font-bold text-slate-900">{stats.mostUsed.name}</p>
                  <p className="text-sm text-slate-500">{stats.mostUsed.count} utilisateurs</p>
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Ajoutées récemment</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.recentlyAdded}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-modern-2025">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full focus-ring-modern"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="focus-ring-modern">
                  <SelectValue placeholder="Filtrer par région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {TUNISIA_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-modern-2025">
          <UnifiedTable
            columns={columns}
            data={filteredCities}
            loading={loading}
            pageSize={50}
            searchable={false}
            filterable={false}
          />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCity ? 'Modifier la ville' : 'Ajouter une ville'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nom de la ville *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Tunis"
              className={`focus-ring-modern ${formErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1 font-medium">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Région *
            </label>
            <Select 
              value={formData.region} 
              onValueChange={(value) => setFormData({ ...formData, region: value })}
            >
              <SelectTrigger className={`focus-ring-modern ${formErrors.region ? 'border-red-500 focus:border-red-500' : ''}`}>
                <SelectValue placeholder="Sélectionner une région" />
              </SelectTrigger>
              <SelectContent>
                {TUNISIA_REGIONS.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.region && (
              <p className="text-red-500 text-sm mt-1 font-medium">{formErrors.region}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 hover:bg-slate-50 transition-colors duration-200"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {editingCity ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCitiesPage;
