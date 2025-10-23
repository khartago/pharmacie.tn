'use client';

import React, { useState, useEffect } from 'react';
import { AuthAPI } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Save, 
  Edit, 
  Camera,
  Key,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department: '',
    bio: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await AuthAPI.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          role: response.data.role || '',
          department: response.data.department || '',
          bio: response.data.bio || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await AuthAPI.updateProfile(formData);
      if (response.success) {
        setUser(response.data);
        setIsEditing(false);
        showSuccessToast('Profil mis à jour avec succès');
      } else {
        showErrorToast(response.error || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showErrorToast('Erreur lors de la mise à jour du profil');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      role: user?.role || '',
      department: user?.department || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mon Profil</h1>
          <p className="text-slate-600">Gérez vos informations personnelles et paramètres</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleSave} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Save className="h-4 w-4" />
                <span>Enregistrer</span>
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="card-modern-2025">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center text-slate-900">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                {isEditing ? formData.name : user?.name}
              </h3>
              <p className="text-slate-600 mb-4">{user?.role}</p>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.department && (
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>{user.department}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                  <User className="w-5 h-5 text-white" />
                </div>
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={isEditing ? formData.name : user?.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : user?.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={isEditing ? formData.phone : user?.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={isEditing ? formData.department : user?.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={isEditing ? formData.address : user?.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <textarea
                    id="bio"
                    value={isEditing ? formData.bio : user?.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Informations du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Rôle</p>
                      <p className="text-sm text-slate-600">{user?.role}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Administrateur</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Membre depuis</p>
                      <p className="text-sm text-slate-600">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Dernière connexion</p>
                      <p className="text-sm text-slate-600">
                        {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="card-modern-2025">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center text-slate-900">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Mot de passe</p>
                      <p className="text-sm text-slate-600">Dernière modification il y a 30 jours</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Authentification à deux facteurs</p>
                      <p className="text-sm text-slate-600">Non activée</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Activer
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Sessions actives</p>
                      <p className="text-sm text-slate-600">2 appareils connectés</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Gérer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
