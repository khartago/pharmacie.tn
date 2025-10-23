'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncementsAPI, MedicinesAPI, FournisseursAPI } from '@/lib/api';
import MedicineAutocomplete from '@/components/ui/MedicineAutocomplete';
import SupplierSelect from '@/components/ui/SupplierSelect';
import { 
  UnifiedTable, 
  StatusBadge, 
  Modal,
  ModalActionButton,
  ModalFooter,
  FormField,
  Input,
  Textarea,
  Select,
  ModernPageHeader,
  ModernTabNav,
  ActionMenu,
  SearchBar,
  FilterPanel,
  ConfirmDialog,
  ContactCard,
  EmptyState,
  SkeletonTable,
  FilterChips,
  QuickFilterChips,
  StatusFilterChips,
  EmptyAnnouncements,
  EmptySearchResults,
  LoadingSkeleton,
  SkeletonTable as SkeletonTableComponent,
  FloatingActionButton,
  ActionConfirmDialog,
  DeleteConfirmDialog,
  ArchiveConfirmDialog
} from '@/components';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Heart,
  Check,
  X,
  Clock,
  User
} from 'lucide-react';
import { useApi, usePagination, useFilters, useDebounce, useToast } from '@/lib/hooks';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { validationRules } from '@/lib/utils/validators';
import { REGIONS } from '@/lib/utils/constants';

export default function PharmacieAnnoncesPage() {
  const [activeTab, setActiveTab] = useState('disponibles');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [selectedAnnouncementForInterests, setSelectedAnnouncementForInterests] = useState<any>(null);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [tabTotals, setTabTotals] = useState({
    'disponibles': 0,
    'mes-annonces': 0,
    'interets': 0,
    'archives': 0
  });

  // Hooks
  const { execute: createAnnouncement, loading: creating } = useApi(AnnouncementsAPI.create);
  const { execute: updateAnnouncement, loading: updating } = useApi(AnnouncementsAPI.update);
  const { execute: deleteAnnouncement } = useApi(AnnouncementsAPI.delete);
  const { execute: expressInterest } = useApi(AnnouncementsAPI.expressInterest);
  const { execute: acceptInterest } = useApi(AnnouncementsAPI.acceptInterest);
  const { execute: refuseInterest } = useApi(AnnouncementsAPI.refuseInterest);
  const { execute: getMedicines } = useApi(MedicinesAPI.search);
  const { execute: getSuppliers } = useApi(FournisseursAPI.getAll);
  
  const { pagination, setPage, setTotal } = usePagination();
  const { filters, setFilter, clearAllFilters, hasActiveFilters } = useFilters();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { success, error } = useToast();

  // Load all tab totals with proper error handling
  const loadAllTabTotals = async () => {
    try {
      
      const [disponiblesRes, mesAnnoncesRes, interetsRes, archivesRes] = await Promise.all([
        AnnouncementsAPI.getAll({ page: 1, limit: 1, excludeMine: true, excludeInterested: true }).catch((err) => {
          console.error('Error loading disponibles:', err);
          return { data: { pagination: { total: 0 } } };
        }),
        AnnouncementsAPI.getAll({ page: 1, limit: 1, userOnly: true }).catch((err) => {
          console.error('Error loading mes-annonces:', err);
          return { data: { pagination: { total: 0 } } };
        }),
        AnnouncementsAPI.getMyInterests({ page: 1, limit: 1 }).catch((err) => {
          console.error('Error loading interets:', err);
          return { data: [], pagination: { total: 0 } };
        }),
        AnnouncementsAPI.getArchived({ page: 1, limit: 1 }).catch((err) => {
          console.error('Error loading archives:', err);
          return { data: { pagination: { total: 0 } } };
        })
      ]);


      setTabTotals({
        'disponibles': disponiblesRes.data?.pagination?.total || 0,
        'mes-annonces': mesAnnoncesRes.data?.pagination?.total || 0,
        'interets': (interetsRes as any).pagination?.total || 0, // Fixed: getMyInterests returns pagination at root level
        'archives': archivesRes.data?.pagination?.total || 0
      });
    } catch (err) {
      console.error('Error loading tab totals:', err);
      setTabTotals({
        'disponibles': 0,
        'mes-annonces': 0,
        'interets': 0,
        'archives': 0
      });
    }
  };

  // Tab configuration
  const tabs = [
    { key: 'disponibles', label: 'MÉDICAMENTS DISPONIBLES', count: tabTotals.disponibles },
    { key: 'mes-annonces', label: 'MES ANNONCES', count: tabTotals['mes-annonces'] },
    { key: 'interets', label: 'MES INTÉRÊTS', count: tabTotals.interets },
    { key: 'archives', label: 'ARCHIVES', count: tabTotals.archives }
  ];

  // Load totals on component mount (with delay to avoid conflicts)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllTabTotals();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load data based on active tab - clear state first
  useEffect(() => {
    setAnnouncements([]); // Clear previous tab data
    setInterests([]);     // Clear previous interests
    setLoading(true);     // Show loading state
    setPage(1);           // Reset to first page
    clearAllFilters();    // Clear filters when switching tabs
    loadData();
  }, [activeTab, debouncedSearch]);

  // Load data when filters change
  useEffect(() => {
    if (activeTab) {
      loadData();
    }
  }, [filters]);

  // Reload data when page changes
  useEffect(() => {
    loadData();
  }, [pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      let response;
      
      // Transform filters based on active tab
      const getTransformedFilters = () => {
        const transformedFilters = { ...filters };
        
        // Remove empty/undefined filters
        Object.keys(transformedFilters).forEach(key => {
          if (transformedFilters[key] === undefined || transformedFilters[key] === null || transformedFilters[key] === '') {
            delete transformedFilters[key];
          }
        });
        
        // Transform region to regionName for backend
        if (transformedFilters.region) {
          transformedFilters.regionName = transformedFilters.region;
          delete transformedFilters.region;
        }
        
        switch (activeTab) {
          case 'interets':
            // For interests tab, map interestStatus to the correct field
            if (transformedFilters.interestStatus) {
              transformedFilters.interestStatus = transformedFilters.interestStatus;
            }
            if (transformedFilters.announcementStatus) {
              transformedFilters.status = transformedFilters.announcementStatus;
              delete transformedFilters.announcementStatus;
            }
            break;
          case 'archives':
            // For archives, handle both status and supplierStatus
            if (transformedFilters.supplierStatus) {
              // Keep supplierStatus as is for backend
            }
            break;
          default:
            // For other tabs, use filters as-is
            break;
        }
        
        return transformedFilters;
      };
      
      const transformedFilters = getTransformedFilters();
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        ...transformedFilters
      };

      switch (activeTab) {
        case 'disponibles':
          response = await AnnouncementsAPI.getAll({ 
            ...params, 
            excludeMine: true, 
            excludeInterested: true // Backend handles this correctly now
          });
          break;
        case 'mes-annonces':
          response = await AnnouncementsAPI.getAll({ 
            ...params, 
            userOnly: true // Backend handles the filtering correctly now
          });
          break;
        case 'interets':
          response = await AnnouncementsAPI.getMyInterests(params); // Pass pagination params
          break;
        case 'archives':
          response = await AnnouncementsAPI.getArchived(params);
          break;
        default:
          response = await AnnouncementsAPI.getAll(params);
      }
      
      if (response.success && response.data) {
        if (activeTab === 'interets') {
          // Extract announcements from interests
          const interests = Array.isArray(response.data) ? response.data : [];
          const announcementsFromInterests = interests.map((interest: any) => ({
            ...interest.announcement,
            interestStatus: interest.status,
            interestId: interest.id,
            interestCreatedAt: interest.createdAt
          }));
          setAnnouncements(announcementsFromInterests);
          setInterests(interests);
          
          // Update pagination info from server response
          if ((response as any).pagination) {
            setTotal((response as any).pagination.total);
        } else {
            setTotal(announcementsFromInterests.length);
          }
        } else {
          const data = response.data;
          const announcements = Array.isArray(data) ? data : (data as any).announcements || [];
          setAnnouncements(announcements);
          
          // Update pagination info from server response
          if ((data as any).pagination) {
            setTotal((data as any).pagination.total);
          } else {
            setTotal(announcements.length);
          }
        }
      }
    } catch (err) {
      error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
    
    // Refresh tab totals after loading data (with delay to avoid conflicts)
    setTimeout(() => {
      loadAllTabTotals();
    }, 1500);
  };

  // Form handlers
  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({});
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      medicineId: announcement.medicine?.id,
      quantity: announcement.quantity,
      expiryDate: announcement.expiryDate,
      supplierUserId: announcement.supplierUserId,
      visibleToSupplier: announcement.visibleToSupplier
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer l\'annonce',
      description: 'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      onConfirm: async () => {
        try {
          const response = await deleteAnnouncement(id.toString());
          if (response?.success) {
            success('Annonce supprimée avec succès');
            loadData();
            loadAllTabTotals();
          }
        } catch (err) {
          error('Erreur lors de la suppression');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: any = {};

    // Validation
    if (!formData.medicineId) newErrors.medicineId = 'Médicament requis';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantité requise';
    if (!formData.expiryDate) newErrors.expiryDate = 'Date d\'expiration requise';
    if (formData.visibleToSupplier && !formData.supplierUserId) {
      newErrors.supplierUserId = 'Fournisseur requis si visible';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let response;
      if (editingAnnouncement) {
        response = await updateAnnouncement(editingAnnouncement.id.toString(), formData);
      } else {
        response = await createAnnouncement(formData);
      }

      if (response?.success) {
        success(editingAnnouncement ? 'Annonce modifiée' : 'Annonce créée');
        setIsModalOpen(false);
        loadData();
        loadAllTabTotals();
      } else {
        error(response?.error || 'Erreur lors de l\'opération');
      }
    } catch (err) {
      error('Erreur lors de l\'opération');
    }
  };

  const handleExpressInterest = async (announcementId: number) => {
    try {
      const response = await expressInterest(announcementId.toString());
      if (response?.success) {
        success('Intérêt exprimé avec succès');
        loadData();
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.message && err.message.includes('already expressed')) {
        error('Vous avez déjà exprimé votre intérêt pour cette annonce');
      } else {
      error('Erreur lors de l\'expression d\'intérêt');
      }
    }
  };

  const handleAcceptInterest = async (announcementId: number, interestId: number) => {
    try {
      const response = await acceptInterest(announcementId.toString(), interestId.toString());
      if (response?.success) {
        success('Intérêt accepté - Contact révélé');
        loadData();
        loadAllTabTotals();
      }
    } catch (err) {
      error('Erreur lors de l\'acceptation');
    }
  };

  const handleRefuseInterest = async (announcementId: number, interestId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Refuser l\'intérêt',
      description: 'Êtes-vous sûr de vouloir refuser cet intérêt ?',
      onConfirm: async () => {
        try {
          const response = await refuseInterest(announcementId.toString(), interestId.toString());
          if (response?.success) {
            success('Intérêt refusé');
            loadData();
            loadAllTabTotals();
          }
        } catch (err) {
          error('Erreur lors du refus');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleViewInterests = (announcement: any) => {
    setSelectedAnnouncementForInterests(announcement);
    setShowInterestsModal(true);
  };

  const handleCancelInterest = async (interestId: number) => {
    try {
      const response = await AnnouncementsAPI.cancelInterest(interestId.toString());
      if (response?.success) {
        success('Intérêt annulé');
        loadData();
        loadAllTabTotals();
      }
    } catch (err) {
      error('Erreur lors de l\'annulation');
    }
  };

  const handleRenew = async (announcementId: string) => {
    try {
      await AnnouncementsAPI.renewAnnouncement(announcementId);
      success('Annonce renouvelée avec succès');
      loadData();
      loadAllTabTotals();
    } catch (err: any) {
      error(err.message || 'Erreur lors du renouvellement de l\'annonce');
    }
  };

  // Helper function to check if current user has expressed interest
  const getUserInterestStatus = (announcement: any) => {
    // In DISPONIBLES tab, backend excludes ALL interests from this user
    // So we should never see any interest status here
    // Always return null to show "Exprimer mon intérêt" button
    return null;
  };

  // Card content renderer
  const renderCardContent = (item: any) => {
    if (activeTab === 'disponibles') {
      const isExpired = new Date(item.expiryDate) < new Date();
      const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const userInterestStatus = getUserInterestStatus(item);
      
      return (
        <div className="group relative overflow-hidden h-full flex flex-col">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            {isExpired ? (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full border border-red-200">
                EXPIRÉ
              </span>
            ) : isExpiringSoon ? (
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">
                EXPIRE BIENTÔT
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                VALIDE
              </span>
            )}
          </div>

          {/* Medicine Header */}
          <div className="p-6 pb-4 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.medicine?.brandName || 'Nom non disponible'}</h3>
              <div className="text-sm text-gray-600 mb-1">{item.medicine?.dci || 'DCI non disponible'}</div>
              <div className="text-xs text-gray-500">{item.medicine?.laboratoire || 'Laboratoire non disponible'}</div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-blue-700">{item.quantity || 0}</div>
                <div className="text-xs text-blue-600 font-medium">Unités disponibles</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <div className={`text-lg font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'} text-center`}>
                  {formatDate(item.expiryDate)}
                </div>
                <div className="text-xs text-gray-600 font-medium text-center">Date d'expiration</div>
              </div>
            </div>

            {/* Location and Supplier Info */}
            <div className="space-y-3 mb-4">
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Région</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.region || 'Non spécifiée'}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Ville</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.name || 'Non spécifiée'}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              {(item.supplierUser || item.manualSupplierName) && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">Fournisseur</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {item.supplierUser?.name || item.manualSupplierName || 'Non spécifié'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Action Button or Status */}
              {userInterestStatus === null ? (
                // No interest expressed yet - show express interest button
                <div>
                  <button
                    onClick={() => handleExpressInterest(item.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Exprimer mon intérêt</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </button>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Les coordonnées seront révélées si votre demande est acceptée
                  </div>
                </div>
              ) : userInterestStatus === 'PENDING' ? (
                // Interest pending - show waiting status
                <div className="w-full bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 font-bold py-4 px-6 rounded-xl text-base text-center border border-orange-300">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>En attente de réponse</span>
                  </div>
                </div>
              ) : userInterestStatus === 'ACCEPTED' ? (
                // Interest accepted - show contact info
                <div className="w-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold py-4 px-6 rounded-xl text-base text-center border border-green-300">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Intérêt accepté - Contact révélé</span>
                  </div>
                </div>
              ) : userInterestStatus === 'REFUSED' ? (
                // Interest refused - show refused status
                <div className="w-full bg-gradient-to-r from-red-100 to-red-200 text-red-800 font-bold py-4 px-6 rounded-xl text-base text-center border border-red-300">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Intérêt refusé</span>
                  </div>
                </div>
              ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Publié le {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'mes-annonces') {
      const interestCount = item.interests?.length || 0;
      const pendingCount = item.interests?.filter((i: any) => i.status === 'PENDING')?.length || 0;
      const acceptedCount = item.interests?.filter((i: any) => i.status === 'ACCEPTED')?.length || 0;
      const isExpired = new Date(item.expiryDate) < new Date();
      const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return (
        <div className="group relative overflow-hidden h-full flex flex-col">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border border-green-200' :
              item.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              item.status === 'EXPIRED' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {item.status === 'AVAILABLE' ? 'DISPONIBLE' :
               item.status === 'RESERVED' ? 'RÉSERVÉ' :
               item.status === 'EXPIRED' ? 'EXPIRÉ' :
               item.status}
            </div>
          </div>

          {/* Medicine Header */}
          <div className="p-6 pb-4 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.medicine?.brandName || 'Nom non disponible'}</h3>
              <div className="text-sm text-gray-600 mb-1">{item.medicine?.dci || 'DCI non disponible'}</div>
              <div className="text-xs text-gray-500">{item.medicine?.laboratoire || 'Laboratoire non disponible'}</div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-blue-700">{item.quantity || 0}</div>
                <div className="text-xs text-blue-600 font-medium">Unités disponibles</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <div className={`text-lg font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'} text-center`}>
                  {formatDate(item.expiryDate)}
                </div>
                <div className="text-xs text-gray-600 font-medium text-center">Date d'expiration</div>
              </div>
            </div>

            {/* Location and Supplier Info */}
            <div className="space-y-3 mb-4">
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Région</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.region || 'Non spécifiée'}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Ville</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.name || 'Non spécifiée'}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              {item.supplierUser && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">Fournisseur</div>
                      <div className="text-sm font-semibold text-slate-800">{item.supplierUser.name || 'Non spécifié'}</div>
                    </div>
                  </div>
                </div>
              )}

              {!item.supplierUser && item.manualSupplierName && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">Fournisseur</div>
                      <div className="text-sm font-semibold text-slate-800">{item.manualSupplierName}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interests Summary */}
            <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group" onClick={() => handleViewInterests(item)}>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{interestCount}</div>
                <div className="text-base font-semibold text-gray-800 mb-3">Pharmacies intéressées</div>
                
                {interestCount === 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 bg-white px-4 py-3 rounded-lg border border-gray-200">
                      Aucune demande reçue
                    </div>
                    <div className="text-xs text-gray-400 italic">
                      Les pharmacies pourront exprimer leur intérêt sur cette annonce
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingCount > 0 && (
                      <div className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-3 py-2 rounded-lg border border-orange-300 text-sm font-bold">
                        {pendingCount} en attente de votre réponse
                      </div>
                    )}
                    {acceptedCount > 0 && (
                      <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-2 rounded-lg border border-green-300 text-sm font-bold">
                        {acceptedCount} accepté(s) - Contact révélé
                      </div>
                    )}
                    <div className="text-sm text-blue-600 font-bold mt-2 bg-blue-100 px-3 py-2 rounded-lg">
                      Cliquez pour gérer les demandes
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleEdit(item)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Modifier</span>
                </div>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Supprimer</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Publié le {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'interets') {
      const isExpired = new Date(item.expiryDate) < new Date();
      const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return (
        <div className="group relative overflow-hidden h-full flex flex-col">
          {/* Interest Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.interestStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              item.interestStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800 border border-green-200' :
              item.interestStatus === 'REFUSED' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {item.interestStatus === 'PENDING' ? 'EN ATTENTE' :
               item.interestStatus === 'ACCEPTED' ? 'ACCEPTÉ' :
               item.interestStatus === 'REFUSED' ? 'REFUSÉ' :
               item.interestStatus}
            </div>
          </div>

          {/* Medicine Header */}
          <div className="p-6 pb-4 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.medicine?.brandName || 'Nom non disponible'}</h3>
              <div className="text-sm text-gray-600 mb-1">{item.medicine?.dci || 'DCI non disponible'}</div>
              <div className="text-xs text-gray-500">{item.medicine?.laboratoire || 'Laboratoire non disponible'}</div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-blue-700">{item.quantity || 0}</div>
                <div className="text-xs text-blue-600 font-medium">Unités disponibles</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <div className={`text-lg font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'} text-center`}>
                  {formatDate(item.expiryDate)}
                </div>
                <div className="text-xs text-gray-600 font-medium text-center">Date d'expiration</div>
              </div>
            </div>

            {/* Location and Supplier Info */}
            <div className="space-y-3 mb-4">
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Région</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.region || 'Non spécifiée'}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Ville</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.name || 'Non spécifiée'}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              {item.supplierUser && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">Fournisseur</div>
                      <div className="text-sm font-semibold text-slate-800">{item.supplierUser.name || 'Non spécifié'}</div>
                    </div>
                  </div>
                </div>
              )}

              {!item.supplierUser && item.manualSupplierName && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">Fournisseur</div>
                      <div className="text-sm font-semibold text-slate-800">{item.manualSupplierName}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Info */}
            <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-800 mb-2">Statut de votre demande</div>
                {item.interestStatus === 'PENDING' && (
                  <div className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                    En attente de réponse du propriétaire
                  </div>
                )}
                {item.interestStatus === 'ACCEPTED' && (
                  <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    Demande acceptée - Contact révélé
                  </div>
                )}
                {item.interestStatus === 'REFUSED' && (
                  <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    Demande refusée
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {item.interestStatus === 'PENDING' && (
              <button
                onClick={() => handleCancelInterest(item.interestId)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Annuler l'intérêt</span>
                </div>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Demande envoyée le {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'archives') {
      const isExpired = new Date(item.expiryDate) < new Date();
      const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return (
        <div className="group relative overflow-hidden h-full flex flex-col">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-full border border-gray-200">
              ARCHIVÉ
            </span>
          </div>

          {/* Medicine Header */}
          <div className="p-6 pb-4 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.medicine?.brandName || 'Nom non disponible'}</h3>
              <div className="text-sm text-gray-600 mb-1">{item.medicine?.dci || 'DCI non disponible'}</div>
              <div className="text-xs text-gray-500">{item.medicine?.laboratoire || 'Laboratoire non disponible'}</div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-blue-700">{item.quantity || 0}</div>
                <div className="text-xs text-blue-600 font-medium">Unités disponibles</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <div className={`text-lg font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'} text-center`}>
                  {formatDate(item.expiryDate)}
                </div>
                <div className="text-xs text-gray-600 font-medium text-center">Date d'expiration</div>
              </div>
            </div>

            {/* Location and Supplier Info */}
            <div className="space-y-3 mb-4">
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Région</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.region || 'Non spécifiée'}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-medium mb-1">Ville</div>
                    <div className="text-sm font-semibold text-gray-900">{item.pharmacyUser?.city?.name || 'Non spécifiée'}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              {(item.supplierUser || item.manualSupplierName) && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">Fournisseur</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {item.supplierUser?.name || item.manualSupplierName || 'Non spécifié'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Info */}
            <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-800 mb-2">Statut final</div>
                {item.status === 'SOLD' && (
                  <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    Cédé à {item.interests?.find((interest: any) => interest.status === 'ACCEPTED')?.pharmacyUser?.name || 'pharmacie'}
                  </div>
                )}
                {item.status === 'EXPIRED' && (
                  <div className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    Expiré
                  </div>
                )}
                {item.supplierStatus === 'DONE' && (
                  <div className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    Retour finalisé
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Push to bottom */}
            <div className="mt-auto">
              {item.status === 'EXPIRED' && (
                <button
                  onClick={() => handleRenew(item.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Renouveler l'annonce</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Archivé le {formatDate(item.updatedAt)}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Table columns
  const getColumns = () => {
    const baseColumns = [
      { key: 'medicine', header: 'Médicament', sortable: true, render: (value: any) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-gray-900">{value?.brandName || '-'}</div>
          <div className="text-sm text-gray-500">{value?.dci || '-'}</div>
          <div className="text-xs text-gray-400">{value?.laboratoire || '-'}</div>
          {value?.atcCode && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
              ATC: {value.atcCode}
            </div>
          )}
          {value?.dosage && (
            <div className="text-xs text-gray-600 mt-1">
              Dosage: {value.dosage}
            </div>
          )}
        </div>
      )},
      { 
        key: 'quantity', 
        header: 'Quantité', 
        sortable: true,
        render: (value: number) => {
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
                {formatDate(value)}
              </div>
              {isExpired && <div className="text-xs text-red-500 font-semibold">Expiré</div>}
              {isExpiringVerySoon && !isExpired && <div className="text-xs text-red-500 font-semibold">Expire dans {daysUntilExpiry} jour(s)</div>}
              {isExpiringSoon && !isExpiringVerySoon && !isExpired && <div className="text-xs text-orange-500">Expire dans {daysUntilExpiry} jour(s)</div>}
              {!isExpired && !isExpiringSoon && <div className="text-xs text-gray-500">{daysUntilExpiry} jour(s) restant(s)</div>}
            </div>
          );
        }
      },
      { key: 'status', header: 'Statut', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
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
                {formatDate(value)}
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
      }
    ];

    if (activeTab === 'disponibles') {
      return [
        { key: 'medicine', header: 'MÉDICAMENT DISPONIBLE', sortable: true, render: (value: any, row: any) => (
          <div className="min-w-[450px] p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <div className="text-xl font-bold text-gray-900 mb-2">{value?.brandName || 'Nom non disponible'}</div>
                <div className="text-base text-gray-600 mb-1">{value?.dci || 'DCI non disponible'}</div>
                <div className="text-sm text-gray-500">{value?.laboratoire || 'Laboratoire non disponible'}</div>
              </div>
              <div className="text-center bg-blue-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{row.quantity || 0}</div>
                <div className="text-xs text-gray-600 font-medium">unités</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
                <span className="text-gray-500 font-medium">Région:</span>
                <div className="font-semibold text-gray-900">{row.pharmacyUser?.city?.region || 'Non spécifiée'}</div>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Ville:</span>
                <div className="font-semibold text-gray-900">{row.pharmacyUser?.city?.name || 'Non spécifiée'}</div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Publié le {formatDate(row.createdAt)}
              </div>
            </div>
          </div>
        )},
        { 
          key: 'expiryDate', 
          header: 'VALIDITÉ', 
          sortable: true, 
          render: (value: string) => {
            const date = new Date(value);
            const isExpired = date < new Date();
            const isExpiringSoon = date < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-center mb-3">
                  <div className={`text-lg font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatDate(value)}
                  </div>
                </div>
                
                <div className="text-center">
                  {isExpired && (
                    <div className="text-sm text-red-700 font-semibold bg-red-50 px-3 py-2 rounded border border-red-200">
                      EXPIRÉ
                    </div>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <div className="text-sm text-orange-700 font-semibold bg-orange-50 px-3 py-2 rounded border border-orange-200">
                      Expire bientôt
                    </div>
                  )}
                  {!isExpired && !isExpiringSoon && (
                    <div className="text-sm text-green-700 font-semibold bg-green-50 px-3 py-2 rounded border border-green-200">
                      Valide
                    </div>
                  )}
                </div>
              </div>
            );
          }
        },
        { key: 'actions', header: 'ACTION', render: (value: any, row: any) => (
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-base font-semibold text-gray-800 mb-2">Intéressé par ce médicament ?</div>
              <div className="text-sm text-gray-600">Manifestez votre intérêt</div>
            </div>
            
            <button
              onClick={() => handleExpressInterest(row.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              EXPRIMER MON INTÉRÊT
            </button>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              Vous recevrez les coordonnées si accepté
            </div>
          </div>
        )}
      ];
    }

    if (activeTab === 'mes-annonces') {
      return [
        { key: 'medicine', header: 'MES ANNONCES', sortable: true, render: (value: any, row: any) => (
          <div className="min-w-[450px] p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <div className="text-xl font-bold text-gray-900 mb-2">{value?.brandName || 'Nom non disponible'}</div>
                <div className="text-base text-gray-600 mb-1">{value?.dci || 'DCI non disponible'}</div>
                <div className="text-sm text-gray-500">{value?.laboratoire || 'Laboratoire non disponible'}</div>
              </div>
              <div className="text-center bg-blue-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{row.quantity || 0}</div>
                <div className="text-xs text-gray-600 font-medium">unités</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-2 rounded text-sm font-semibold ${
                  row.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border border-green-200' :
                  row.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  row.status === 'EXPIRED' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {row.status === 'AVAILABLE' ? 'DISPONIBLE' :
                   row.status === 'RESERVED' ? 'RÉSERVÉ' :
                   row.status === 'EXPIRED' ? 'EXPIRÉ' :
                   row.status}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Publié le {formatDate(row.createdAt)}
              </div>
            </div>
          </div>
        )},
        { 
          key: 'expiryDate', 
          header: 'DATE D\'EXPIRATION', 
          sortable: true, 
          render: (value: string) => {
            const date = new Date(value);
            const isExpired = date < new Date();
            const isExpiringSoon = date < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-xl font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatDate(value)}
                </div>
                {isExpired && (
                  <div className="text-sm text-red-500 font-bold mt-2">⚠️ EXPIRÉ</div>
                )}
                {isExpiringSoon && !isExpired && (
                  <div className="text-sm text-orange-500 font-bold mt-2">⚠️ Expire bientôt</div>
                )}
                {!isExpired && !isExpiringSoon && (
                  <div className="text-sm text-green-500 font-bold mt-2">✅ Valide</div>
                )}
              </div>
            );
          }
        },
        { key: 'interests', header: 'INTÉRÊTS REÇUS', render: (value: any, row: any) => {
          const interestCount = row.interests?.length || 0;
          const pendingCount = row.interests?.filter((i: any) => i.status === 'PENDING')?.length || 0;
          const acceptedCount = row.interests?.filter((i: any) => i.status === 'ACCEPTED')?.length || 0;
          
          return (
            <div className="p-6 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => handleViewInterests(row)}>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">{interestCount}</div>
                <div className="text-base font-semibold text-gray-800">Pharmacies intéressées</div>
              </div>
              
              {interestCount === 0 ? (
                <div className="text-sm text-gray-500 text-center bg-gray-50 px-3 py-2 rounded border">Aucune demande reçue</div>
              ) : (
                <div className="space-y-2">
                  {pendingCount > 0 && (
                    <div className="bg-orange-50 text-orange-800 px-3 py-2 rounded border border-orange-200 text-sm font-semibold">
                      {pendingCount} en attente de votre réponse
                    </div>
                  )}
                  {acceptedCount > 0 && (
                    <div className="bg-green-50 text-green-800 px-3 py-2 rounded border border-green-200 text-sm font-semibold">
                      {acceptedCount} accepté(s) - Contact révélé
                    </div>
                  )}
                  <div className="text-sm text-blue-600 font-medium mt-2 text-center">
                    Cliquez pour gérer les demandes
                  </div>
                </div>
              )}
            </div>
          );
        }},
        { key: 'actions', header: 'ACTIONS', render: (value: any, row: any) => (
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-base font-semibold text-gray-800 mb-2">Gérer cette annonce</div>
              <div className="text-sm text-gray-600">Modifier ou supprimer</div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleEdit(row)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                MODIFIER
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                SUPPRIMER
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              La suppression est définitive
            </div>
          </div>
        )}
      ];
    }

    if (activeTab === 'interets') {
      return [
        { key: 'announcement', header: 'Annonce', render: (value: any) => (
          <div className="min-w-[200px]">
            <div className="font-semibold text-gray-900">{value?.medicine?.brandName}</div>
            <div className="text-sm text-gray-500">{value?.medicine?.dci}</div>
            <div className="text-xs text-gray-400">{value?.medicine?.laboratoire}</div>
            {value?.medicine?.atcCode && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                ATC: {value.medicine.atcCode}
              </div>
            )}
          </div>
        )},
        { key: 'pharmacy', header: 'Pharmacie', render: (value: any) => (
          <div className="min-w-[150px]">
            <div className="font-medium text-gray-900">{value?.name}</div>
            <div className="text-sm text-gray-500">{value?.city?.name}</div>
            {value?.phone && (
              <div className="text-xs text-blue-600">{value.phone}</div>
            )}
            {value?.email && (
              <div className="text-xs text-gray-500">{value.email}</div>
            )}
          </div>
        )},
        { key: 'status', header: 'Statut', render: (value: string) => <StatusBadge status={value} /> },
        { key: 'createdAt', header: 'Date', render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const daysSinceCreation = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          const isRecent = daysSinceCreation <= 7;
          
          return (
            <div className="text-sm">
              <div className={`font-medium ${isRecent ? 'text-green-600' : 'text-gray-700'}`}>
                {formatDate(value)}
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
        }},
        { key: 'actions', header: 'Actions', render: (value: any, row: any) => {
          if (row.status === 'PENDING') {
            return (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCancelInterest(row.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Annuler l'intérêt"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          }
          return null;
        }}
      ];
    }

    return baseColumns;
  };

  // Filter options adapted to each tab
  const getFilterOptions = () => {
    switch (activeTab) {
      case 'disponibles':
        return [
          { key: 'status', label: 'Statut', type: 'select' as const, options: [
            { value: 'AVAILABLE', label: 'Disponible' },
            { value: 'RESERVED', label: 'Réservé' }
          ]},
          { key: 'region', label: 'Région', type: 'select' as const, options: [
            { value: 'TUNIS', label: 'Tunis' },
            { value: 'SOUSSE', label: 'Sousse' },
            { value: 'SFAX', label: 'Sfax' },
            { value: 'GABES', label: 'Gabès' },
            { value: 'BEN_AROUS', label: 'Ben Arous' }
          ]}
        ];
      
      case 'mes-annonces':
        return [
          { key: 'status', label: 'Statut', type: 'select' as const, options: [
      { value: 'AVAILABLE', label: 'Disponible' },
      { value: 'RESERVED', label: 'Réservé' },
      { value: 'EXPIRED', label: 'Expiré' }
    ]},
          { key: 'hasInterests', label: 'Avec intérêts', type: 'checkbox' as const }
        ];
      
      case 'interets':
        return [
          { key: 'interestStatus', label: 'Statut de l\'intérêt', type: 'select' as const, options: [
            { value: 'PENDING', label: 'En attente' },
            { value: 'ACCEPTED', label: 'Accepté' },
            { value: 'REFUSED', label: 'Refusé' }
          ]},
          { key: 'announcementStatus', label: 'Statut de l\'annonce', type: 'select' as const, options: [
            { value: 'AVAILABLE', label: 'Disponible' },
            { value: 'RESERVED', label: 'Réservé' }
          ]}
        ];
      
      case 'archives':
        return [
          { key: 'status', label: 'Statut final', type: 'select' as const, options: [
            { value: 'SOLD', label: 'Vendu' },
            { value: 'EXPIRED', label: 'Expiré' }
          ]},
          { key: 'supplierStatus', label: 'Retour fournisseur', type: 'select' as const, options: [
            { value: 'DONE', label: 'Retour effectué' },
            { value: 'PENDING', label: 'Retour en attente' }
          ]}
        ];
      
      default:
        return [
          { key: 'status', label: 'Statut', type: 'select' as const, options: [
            { value: 'AVAILABLE', label: 'Disponible' },
            { value: 'RESERVED', label: 'Réservé' },
            { value: 'EXPIRED', label: 'Expiré' }
          ]}
        ];
    }
  };

  const filterOptions = getFilterOptions();

  if (loading && announcements.length === 0) {
    return <SkeletonTable rows={10} columns={6} />;
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Annonces"
        description="Gérez vos annonces de médicaments à date proche"
        icon={FileText}
        actions={
          <div className="flex space-x-3">
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle annonce
            </Button>
          </div>
        }
        search={{
          placeholder: 'Rechercher des annonces...',
          value: searchTerm,
          onChange: setSearchTerm
        }}
        filters={
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={setFilter}
            onReset={clearAllFilters}
          />
        }
      />

      {/* Tabs */}
      <ModernTabNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-16 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (announcements || []).length === 0 ? (
        <EmptyState
          title={`Aucune ${activeTab} trouvée`}
          description={`Vous n'avez aucune ${activeTab} pour le moment.`}
          action={
            activeTab === 'mes-annonces' ? {
              label: 'Créer une annonce',
              onClick: handleCreate,
              variant: 'default' as const
            } : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(announcements || []).map((item, index) => (
              <div key={item.id || index} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                {renderCardContent(item)}
              </div>
            ))}
          </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
        size="lg"
      >
        <div className="space-y-4">
          <FormField
            label="Médicament"
            required
            error={errors.medicineId}
          >
            <MedicineAutocomplete
              value={formData.medicineName || ''}
              onChange={(medicineName, medicine) => {
                setFormData({ 
                  ...formData, 
                  medicineName,
                  medicineId: medicine?.id || null
                });
              }}
              placeholder="Rechercher un médicament..."
              error={errors.medicineId}
            />
          </FormField>

          <FormField
            label="Quantité"
            required
            error={errors.quantity}
          >
            <Input
              type="number"
              placeholder="Quantité"
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </FormField>

          <FormField
            label="Date d'expiration"
            required
            error={errors.expiryDate}
          >
            <Input
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </FormField>

          <FormField
            label="Fournisseur"
            error={errors.supplierUserId}
          >
            <SupplierSelect
              value={formData.supplierName || ''}
              onChange={(supplierName, supplier) => {
                setFormData({ 
                  ...formData, 
                  supplierName,
                  supplierUserId: supplier?.id || null,
                  isManualSupplier: !supplier
                });
              }}
              placeholder="Sélectionner ou saisir un fournisseur..."
              error={errors.supplierUserId}
            />
          </FormField>

          {!formData.isManualSupplier && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visibleToSupplier"
                checked={formData.visibleToSupplier || false}
                onChange={(e) => setFormData({ ...formData, visibleToSupplier: e.target.checked })}
              />
              <label htmlFor="visibleToSupplier" className="text-sm font-medium">
                Visible aux fournisseurs
              </label>
            </div>
          )}
        </div>

        <ModalFooter>
          <ModalActionButton
            onClick={() => setIsModalOpen(false)}
            variant="outline"
          >
            Annuler
          </ModalActionButton>
          <ModalActionButton
            onClick={handleSubmit}
            variant="default"
            loading={creating || updating}
          >
            {editingAnnouncement ? 'Modifier' : 'Créer'}
          </ModalActionButton>
        </ModalFooter>
      </Modal>

      {/* Contact Modal */}
      {showContactModal && selectedInterest && (
        <Modal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          title="Contact de la pharmacie"
          size="md"
        >
          <ContactCard
            contact={{
              name: selectedInterest.pharmacy?.name,
              email: selectedInterest.pharmacy?.email,
              phone: selectedInterest.pharmacy?.phone,
              address: selectedInterest.pharmacy?.address,
              city: selectedInterest.pharmacy?.city?.name,
              region: selectedInterest.pharmacy?.city?.region
            }}
          />
        </Modal>
      )}

      {/* Interest Management Modal */}
      {showInterestsModal && selectedAnnouncementForInterests && (
        <Modal
          isOpen={showInterestsModal}
          onClose={() => setShowInterestsModal(false)}
          title="Gérer les intérêts"
          size="lg"
        >
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{selectedAnnouncementForInterests.medicine?.brandName}</div>
              <div className="text-sm text-gray-600">Quantité: {selectedAnnouncementForInterests.quantity}</div>
            </div>
            
            {selectedAnnouncementForInterests.interests?.length > 0 ? (
              selectedAnnouncementForInterests.interests.map((interest: any) => (
                <div key={interest.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{interest.pharmacyUser?.name || 'Pharmacie'}</div>
                      <div className="text-sm text-gray-500">
                        {interest.pharmacyUser?.city?.name}, {interest.pharmacyUser?.city?.region}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(interest.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={interest.status} />
                  </div>
                  
                  {interest.status === 'PENDING' && (
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptInterest(selectedAnnouncementForInterests.id, interest.id)}
                      >
                        Accepter
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        onClick={() => handleRefuseInterest(selectedAnnouncementForInterests.id, interest.id)}
                      >
                        Refuser
                      </Button>
                    </div>
                  )}
                  
                  {interest.status === 'ACCEPTED' && (
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Contact</div>
                      <div className="text-sm">Tél: {interest.pharmacyUser?.phone}</div>
                      <div className="text-sm">Email: {interest.pharmacyUser?.email}</div>
                      <div className="text-sm">Adresse: {interest.pharmacyUser?.address}</div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun intérêt exprimé pour cette annonce
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant="destructive"
        />
      )}
    </div>
  );
}