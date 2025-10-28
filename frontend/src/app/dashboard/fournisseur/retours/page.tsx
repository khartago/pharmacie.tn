'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncementsAPI, ExportAPI, API_BASE_URL } from '@/lib/api';
import { UnifiedTable, StatusBadge, ExportButton, Modal, FormField, Skeleton, EmptyState, Textarea } from '@/components';
import { usePagination } from '@/lib/hooks';
import { 
  ArchiveBoxIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Phone } from 'lucide-react';

export default function FournisseurRetoursPage() {
  const [activeTab, setActiveTab] = useState('disponibles');
  const [retours, setRetours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
  const [selectedRetour, setSelectedRetour] = useState<any>(null);
  const [refuseReason, setRefuseReason] = useState('');
  const [errors, setErrors] = useState<any>({});
  const { pagination, setPage, setTotal } = usePagination();

  useEffect(() => {
    fetchRetours();
  }, [activeTab]);

  // Reload data when page changes
  useEffect(() => {
    fetchRetours();
  }, [pagination.page]);

  const fetchRetours = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        visibleToSupplier: true
      };
      
      let response;
      switch (activeTab) {
        case 'disponibles':
          response = await AnnouncementsAPI.getAll({ ...params, status: 'AVAILABLE' });
          break;
        case 'acceptes':
          response = await AnnouncementsAPI.getAll({ ...params, status: 'ACCEPTED' });
          break;
        case 'archives':
          response = await AnnouncementsAPI.getAll({ ...params, status: 'ARCHIVED' });
          break;
        default:
          response = await AnnouncementsAPI.getAll(params);
      }
      
      if (response.success && response.data) {
        const data = response.data;
        const retours = Array.isArray(data) ? data : (data as any).announcements || [];
        setRetours(retours);
        
        // Update pagination info from server response
        if ((data as any).pagination) {
          setTotal((data as any).pagination.total);
        } else {
          setTotal(retours.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch retours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir accepter ce retour ? Vous recevrez les informations de contact.')) {
      try {
        // Directly accept the retour and get contact info
        const response = await AnnouncementsAPI.acceptRetour(id);
        if (response.success) {
          fetchRetours();
          alert('Retour accepté avec succès. Les informations de contact sont maintenant disponibles.');
        }
      } catch (error) {
        console.error('Failed to accept retour:', error);
        alert('Erreur lors de l\'acceptation du retour');
      }
    }
  };

  const handleRefuse = async (id: string) => {
    if (!refuseReason.trim()) {
      setErrors({ reason: 'Raison requise' });
      return;
    }

    try {
      // Directly refuse the retour
      const response = await AnnouncementsAPI.refuseRetour(id, refuseReason);
      if (response.success) {
        setIsRefuseModalOpen(false);
        setRefuseReason('');
        setSelectedRetour(null);
        setErrors({});
        fetchRetours();
        alert('Retour refusé avec succès');
      }
    } catch (error) {
      console.error('Failed to refuse retour:', error);
      alert('Erreur lors du refus du retour');
    }
  };

  const openRefuseModal = (retour: any) => {
    setSelectedRetour(retour);
    setRefuseReason('');
    setErrors({});
    setIsRefuseModalOpen(true);
  };

  const columns = [
    { 
      key: 'medicineName', 
      header: 'Médicament', 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-gray-900">{row.medicineName || '-'}</div>
          <div className="text-sm text-gray-500">{row.medicineDci || '-'}</div>
          <div className="text-xs text-gray-400">{row.medicineLaboratoire || '-'}</div>
        </div>
      )
    },
    { 
      key: 'quantity', 
      header: 'Quantité', 
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-blue-600">{value || 0}</span>
      )
    },
    { 
      key: 'expiryDate', 
      header: 'Expiration', 
      sortable: true, 
      render: (value: string) => {
        const date = new Date(value);
        const isExpired = date < new Date();
        const isExpiringSoon = date < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
            {date.toLocaleDateString('fr-FR')}
            {isExpired && <div className="text-xs text-red-500">Expiré</div>}
            {isExpiringSoon && !isExpired && <div className="text-xs text-orange-500">Bientôt expiré</div>}
          </div>
        );
      }
    },
    { 
      key: 'pharmacyName', 
      header: 'Pharmacie', 
      sortable: true,
      render: (value: any, row: any) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-gray-900">{row.pharmacyName || '-'}</div>
          <div className="text-sm text-gray-500">{row.pharmacyRegion || '-'}</div>
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
      key: 'contactInfo', 
      header: 'Contact', 
      sortable: false, 
      render: (value: any, row: any) => 
        row.status === 'ACCEPTED' && row.contactInfo ? (
          <div className="text-sm min-w-[120px]">
            <div className="font-medium text-green-700">{row.contactInfo.name}</div>
            <div className="text-gray-600">{row.contactInfo.phone}</div>
            <div className="text-gray-600">{row.contactInfo.email}</div>
          </div>
        ) : row.status === 'ACCEPTED' ? (
          <span className="text-green-600 font-medium">Contact disponible</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
    },
    { key: 'createdAt', header: 'Date', sortable: true, render: (value: string) => new Date(value).toLocaleDateString('fr-FR') },
    { key: 'actions', header: 'Actions', sortable: false, render: (value: any, row: any) => (
      <div className="flex space-x-2">
        {row.status === 'PENDING' && (
          <>
            <button
              onClick={() => handleAccept(row.id)}
              className="text-green-600 hover:text-green-800"
              title="Accepter"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => openRefuseModal(row)}
              className="text-red-600 hover:text-red-800"
              title="Refuser"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </>
        )}
        {row.status === 'ACCEPTED' && (
          <>
            <button
              onClick={() => setSelectedRetour(row)}
              className="text-green-600 hover:text-green-800"
              title="Voir contact"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.open(`${API_BASE_URL}/export/retour/${row.id}/pdf`, '_blank')}
              className="text-blue-600 hover:text-blue-800"
              title="Exporter PDF"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={() => setSelectedRetour(row)}
          className="text-gray-600 hover:text-gray-800"
          title="Voir détails"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  const tabs = [
    { id: 'disponibles', label: 'Disponibles', count: retours.filter(r => r.status === 'PENDING').length },
    { id: 'acceptes', label: 'Acceptés', count: retours.filter(r => r.status === 'ACCEPTED').length },
    { id: 'archives', label: 'Archives', count: retours.filter(r => r.status === 'ARCHIVED').length }
  ];

  // Card content renderer
  const renderCardContent = (item: any) => {
    const isExpired = new Date(item.expiryDate) < new Date();
    const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    return (
      <div className="group relative overflow-hidden">
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
        <div className="p-6 pb-4">
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
                {new Date(item.expiryDate).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-xs text-gray-600 font-medium">Date d'expiration</div>
            </div>
          </div>

          {/* Pharmacy Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-green-600 font-medium mb-1">Pharmacie</div>
                <div className="text-sm font-semibold text-gray-900">{item.pharmacyName || 'Non spécifiée'}</div>
                <div className="text-xs text-gray-600">{item.pharmacyRegion || 'Région non spécifiée'}</div>
              </div>
            </div>
          </div>

          {/* Contact Info (if available) */}
          {item.contactInfo && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium mb-1">Contact</div>
                  <div className="text-sm font-semibold text-gray-900">{item.contactInfo.phone || 'Téléphone non disponible'}</div>
                  <div className="text-xs text-gray-600">{item.contactInfo.email || 'Email non disponible'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {activeTab === 'disponibles' && (
            <button
              onClick={() => handleAccept(item.id)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Accepter le retour</span>
              </div>
            </button>
          )}

          {activeTab === 'acceptes' && (
            <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-bold py-4 px-6 rounded-xl text-base text-center">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Retour accepté</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Publié le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Retours</h1>
          <p className="text-gray-600">Acceptez ou refusez les retours de médicaments</p>
        </div>
        <ExportButton
          type="csv"
          endpoint="exportRetours"
          filename="retours-fournisseur"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
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
          ) : retours.length === 0 ? (
            <EmptyState
              title="Aucun retour trouvé"
              description={
                activeTab === 'disponibles' ? "Aucun retour en attente" :
                activeTab === 'acceptes' ? "Aucun retour accepté" :
                "Aucun retour archivé"
              }
            />
          ) : (
            <div className="space-y-6">
              {/* Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {retours.map((item, index) => (
                  <div key={item.id || index} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
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
        </div>
      </div>

      {/* Refuse Modal */}
      <Modal
        isOpen={isRefuseModalOpen}
        onClose={() => setIsRefuseModalOpen(false)}
        title="Refuser le retour"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du refus pour le retour "{selectedRetour?.title}"
            </p>
          </div>
          
          <FormField
            label="Raison du refus"
            error={errors.reason}
            required
          >
            <Textarea
              value={refuseReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRefuseReason(e.target.value)}
              rows={4}
              placeholder="Expliquez pourquoi vous refusez ce retour..."
            />
          </FormField>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsRefuseModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => handleRefuse(selectedRetour?.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Refuser
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      {selectedRetour && (
        <Modal
          isOpen={!!selectedRetour}
          onClose={() => setSelectedRetour(null)}
          title="Détails du retour"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRetour.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Médicament</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRetour.medicineName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantité</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRetour.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'expiration</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedRetour.expiryDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pharmacie</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRetour.pharmacyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Région</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRetour.pharmacyRegion}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRetour.description}</p>
            </div>

            {selectedRetour.status === 'ACCEPTED' && selectedRetour.contactInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-3">Informations de contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700">Nom du contact</label>
                    <p className="mt-1 text-sm text-green-900">{selectedRetour.contactInfo.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Téléphone</label>
                    <p className="mt-1 text-sm text-green-900">{selectedRetour.contactInfo.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Email</label>
                    <p className="mt-1 text-sm text-green-900">{selectedRetour.contactInfo.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Adresse</label>
                    <p className="mt-1 text-sm text-green-900">{selectedRetour.contactInfo.address}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedRetour(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 