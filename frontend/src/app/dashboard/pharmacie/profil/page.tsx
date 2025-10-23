'use client';

import React, { useState, useEffect } from 'react';
import { AuthAPI, CitiesAPI } from '@/lib/api';
import { filterCitiesByRegion } from '@/lib/utils/regionMapping';
import { 
  Modal,
  ModalActionButton,
  ModalFooter,
  FormField,
  Input,
  Textarea,
  Select,
  ModernPageHeader,
  ConfirmDialog,
  EmptyState,
  SkeletonForm
} from '@/components';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Edit,
  Lock,
  MapPin,
  Phone,
  Mail,
  Building,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApi, useToast } from '@/lib/hooks';
import { formatDate } from '@/lib/utils/formatters';
import { validationRules } from '@/lib/utils/validators';
import { REGIONS } from '@/lib/utils/constants';

export default function PharmacieProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [passwordData, setPasswordData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Hooks
  const { execute: getProfile, loading: profileLoading } = useApi(AuthAPI.getProfile);
  const { execute: updateProfile, loading: updating } = useApi(AuthAPI.updateProfile);
  const { execute: changePassword, loading: changingPassword } = useApi(AuthAPI.changePassword);
  const { execute: getCities } = useApi(CitiesAPI.getAll);
  const { success, error } = useToast();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileResponse, citiesResponse] = await Promise.all([
        getProfile(),
        getCities()
      ]);

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
        setFormData({
          name: profileResponse.data.name,
          email: profileResponse.data.email,
          phone: profileResponse.data.phone,
          address: profileResponse.data.address,
          cityId: profileResponse.data.cityId
        });
      }

      if (citiesResponse.success && citiesResponse.data) {
        setCities(citiesResponse.data.data || []);
      }
    } catch (err) {
      error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleEdit = () => {
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: any = {};

    // Validation
    if (!formData.name?.trim()) newErrors.name = 'Nom requis';
    if (!formData.email?.trim()) newErrors.email = 'Email requis';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (formData.phone && !/^(\+216|00216|216)?[2-9][0-9]{7}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await updateProfile(formData);
      if (response.success) {
        success('Profil mis à jour avec succès');
        setIsEditModalOpen(false);
        loadData();
      } else {
        error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      error('Erreur lors de la mise à jour');
    }
  };

  const handleChangePassword = () => {
    setPasswordData({});
    setErrors({});
    setIsPasswordModalOpen(true);
  };

  const handleSubmitPassword = async () => {
    setErrors({});
    const newErrors: any = {};

    // Validation
    if (!passwordData.currentPassword?.trim()) newErrors.currentPassword = 'Mot de passe actuel requis';
    if (!passwordData.newPassword?.trim()) newErrors.newPassword = 'Nouveau mot de passe requis';
    if (!passwordData.confirmPassword?.trim()) newErrors.confirmPassword = 'Confirmation requise';
    
    if (passwordData.newPassword && passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (passwordData.newPassword && passwordData.confirmPassword && 
        passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      if (response.success) {
        success('Mot de passe modifié avec succès');
        setIsPasswordModalOpen(false);
      } else {
        error(response.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      error('Erreur lors du changement de mot de passe');
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ModernPageHeader
          title="Profil"
          description="Gérez vos informations personnelles"
          icon={User}
        />
        <SkeletonForm fields={6} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <ModernPageHeader
          title="Profil"
          description="Gérez vos informations personnelles"
          icon={User}
        />
        <EmptyState
          title="Profil non trouvé"
          description="Impossible de charger votre profil."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Profil"
        description="Gérez vos informations personnelles"
        icon={User}
        actions={
          <div className="flex space-x-3">
            <Button
              onClick={handleEdit}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              onClick={handleChangePassword}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200"
            >
              <Lock className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
          </div>
        }
      />

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Informations personnelles</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nom complet</label>
              <p className="text-sm text-gray-900">{profile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900 flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </p>
            </div>
            {profile.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-sm text-gray-900 flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </p>
              </div>
            )}
            {profile.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Adresse</label>
                <p className="text-sm text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.address}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pharmacy Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Informations de la pharmacie</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Rôle</label>
              <p className="text-sm text-gray-900">{profile.role?.name}</p>
            </div>
            {profile.city && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ville</label>
                <p className="text-sm text-gray-900">{profile.city.name}</p>
              </div>
            )}
            {profile.city?.region && (
              <div>
                <label className="text-sm font-medium text-gray-500">Région</label>
                <p className="text-sm text-gray-900">{profile.city.region}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Statut</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Membre depuis</label>
              <p className="text-sm text-gray-900">{formatDate(profile.createdAt)}</p>
            </div>
            {profile.lastLoginAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Dernière connexion</label>
                <p className="text-sm text-gray-900">{formatDate(profile.lastLoginAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le profil"
        size="lg"
      >
        <div className="space-y-4">
          <FormField
            label="Nom complet"
            required
            error={errors.name}
          >
            <Input
              placeholder="Votre nom complet"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <FormField
            label="Email"
            required
            error={errors.email}
          >
            <Input
              type="email"
              placeholder="votre@email.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <FormField
            label="Téléphone"
            error={errors.phone}
          >
            <Input
              type="tel"
              placeholder="Numéro de téléphone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </FormField>

          <FormField
            label="Adresse"
            error={errors.address}
          >
            <Textarea
              placeholder="Votre adresse complète"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </FormField>

          <FormField
            label="Ville"
            error={errors.cityId}
          >
            <Select
              placeholder="Sélectionner une ville"
              value={formData.cityId || ''}
              onChange={(value) => setFormData({ ...formData, cityId: value })}
              options={filterCitiesByRegion(cities || [], formData.region || '').map(city => ({
                value: city.id,
                label: `${city.name} (${city.region})`
              }))}
            />
          </FormField>
        </div>

        <ModalFooter>
          <ModalActionButton
            onClick={() => setIsEditModalOpen(false)}
            variant="outline"
          >
            Annuler
          </ModalActionButton>
          <ModalActionButton
            onClick={handleSubmit}
            variant="default"
            loading={updating}
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </ModalActionButton>
        </ModalFooter>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Changer le mot de passe"
        size="md"
      >
        <div className="space-y-4">
          <FormField
            label="Mot de passe actuel"
            required
            error={errors.currentPassword}
          >
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Mot de passe actuel"
                value={passwordData.currentPassword || ''}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Nouveau mot de passe"
            required
            error={errors.newPassword}
          >
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
                value={passwordData.newPassword || ''}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirmer le nouveau mot de passe"
            required
            error={errors.confirmPassword}
          >
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirmer le nouveau mot de passe"
                value={passwordData.confirmPassword || ''}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
        </div>

        <ModalFooter>
          <ModalActionButton
            onClick={() => setIsPasswordModalOpen(false)}
            variant="outline"
          >
            Annuler
          </ModalActionButton>
          <ModalActionButton
            onClick={handleSubmitPassword}
            variant="default"
            loading={changingPassword}
          >
            <Lock className="h-4 w-4 mr-2" />
            Changer
          </ModalActionButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}