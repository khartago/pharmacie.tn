'use client';

import React, { useState, useEffect } from 'react';
import { RequestsAPI, ExportAPI } from '@/lib/api';
import { UnifiedTable, StatusBadge, ExportButton, Modal, FormField, Skeleton, EmptyState, Input, Textarea, Select } from '@/components';
import { Label } from '@/components/ui/label';
import { usePagination } from '@/lib/hooks';
import { formatDate } from '@/lib/utils/formatters';
import { 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Clock, CheckCircle2 } from 'lucide-react';

export default function FournisseurDemandesPage() {
  const [activeTab, setActiveTab] = useState('disponibles');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const { pagination, setPage, setTotal } = usePagination();

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // Reload data when page changes
  useEffect(() => {
    fetchRequests();
  }, [pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      let response;
      switch (activeTab) {
        case 'disponibles':
          response = await RequestsAPI.getAll({ ...params, status: 'OPEN', excludeMine: true });
          break;
        case 'reponses':
          response = await RequestsAPI.getAll({ ...params, userOnly: true, hasResponse: true });
          break;
        case 'archives':
          response = await RequestsAPI.getAll({ ...params, archives: 'true', userOnly: true });
          break;
        default:
          response = await RequestsAPI.getAll(params);
      }
      
      if (response.success && response.data) {
        const data = response.data;
        let requests = Array.isArray(data) ? data : (data as any).requests || (data as any).data || [];
        
        // Apply client-side filters to exclude CLOSED/EXPIRED from non-archives tabs
        if (activeTab !== 'archives') {
          requests = requests.filter((req: any) => {
            const statusUpper = String(req.status || '').toUpperCase();
            return statusUpper !== 'CLOSED' && statusUpper !== 'EXPIRED';
          });
        }
        
        setRequests(requests);
        
        // Update pagination info from server response
        if ((data as any).pagination) {
          setTotal((data as any).pagination.total);
        } else {
          setTotal(requests.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!responseData.message?.trim()) {
      setErrors({ message: 'Message requis' });
      return;
    }

    try {
      const response = await RequestsAPI.respond(selectedRequest.id, {
        message: responseData.message
      });
      if (response.success) {
        setIsResponseModalOpen(false);
        setResponseData({});
        setSelectedRequest(null);
        setErrors({});
        fetchRequests();
        alert('Réponse envoyée avec succès');
      }
    } catch (error) {
      console.error('Failed to respond to request:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleUpdateResponse = async () => {
    if (!responseData.message?.trim()) {
      setErrors({ message: 'Message requis' });
      return;
    }

    try {
      const response = await RequestsAPI.updateResponseStatus(selectedRequest.id, responseData.responseId, responseData.status);
      if (response.success) {
        setIsEditModalOpen(false);
        setResponseData({});
        setSelectedRequest(null);
        setErrors({});
        fetchRequests();
        alert('Réponse mise à jour avec succès');
      }
    } catch (error) {
      console.error('Failed to update response:', error);
      alert('Erreur lors de la mise à jour de la réponse');
    }
  };

  const handleDeleteResponse = async (id: string) => {
    // TODO: Implement delete response functionality when backend API is available
    alert('Fonctionnalité de suppression de réponse non disponible');
  };

  const openResponseModal = (request: any) => {
    setSelectedRequest(request);
    setResponseData({});
    setErrors({});
    setIsResponseModalOpen(true);
  };

  const openEditModal = (request: any) => {
    setSelectedRequest(request);
    setResponseData({
      message: request.response?.message || '',
      price: request.response?.price || '',
      availability: request.response?.availability || ''
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const columns = [
    { key: 'medicine', header: 'Médicament', sortable: true, render: (value: any) => value?.name || value },
    { key: 'quantity', header: 'Quantité', sortable: true },
    { key: 'pharmacy', header: 'Pharmacie', sortable: true, render: (value: any) => value?.name || value },
    { key: 'region', header: 'Région', sortable: true },
    { key: 'status', header: 'Statut', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'createdAt', header: 'Date', sortable: true, render: (value: string) => new Date(value).toLocaleDateString('fr-FR') },
    { key: 'actions', header: 'Actions', sortable: false, render: (value: any, row: any) => (
      <div className="flex space-x-2">
        {row.status === 'OPEN' && !row.response && (
          <button
            onClick={() => openResponseModal(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Répondre"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
          </button>
        )}
        {row.response && (
          <>
            <button
              onClick={() => openEditModal(row)}
              className="text-green-600 hover:text-green-800"
              title="Modifier réponse"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteResponse(row.id)}
              className="text-red-600 hover:text-red-800"
              title="Supprimer réponse"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={() => setSelectedRequest(row)}
          className="text-gray-600 hover:text-gray-800"
          title="Voir détails"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  const tabs = [
    { 
      id: 'disponibles', 
      label: 'Disponibles', 
      count: requests.filter(r => {
        const status = String(r.status || '').toUpperCase();
        return status === 'OPEN' && !r.response && status !== 'CLOSED' && status !== 'EXPIRED';
      }).length 
    },
    { 
      id: 'reponses', 
      label: 'Réponses envoyées', 
      count: requests.filter(r => {
        const status = String(r.status || '').toUpperCase();
        return r.response && status !== 'CLOSED' && status !== 'EXPIRED';
      }).length 
    },
    { 
      id: 'archives', 
      label: 'Archives', 
      count: requests.filter(r => {
        const status = String(r.status || '').toUpperCase();
        return status === 'CLOSED' || status === 'EXPIRED';
      }).length 
    }
  ];

  // Card content renderer
  const renderCardContent = (item: any) => {
    return (
      <div className="group relative overflow-hidden h-full min-h-[380px] flex flex-col rounded-xl">
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.status === 'OPEN' ? 'bg-green-100 text-green-800 border border-green-200' :
            item.status === 'CLOSED' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
            item.status === 'EXPIRED' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {item.status === 'OPEN' ? 'OUVERTE' :
             item.status === 'CLOSED' ? 'FERMÉE' :
             item.status === 'EXPIRED' ? 'EXPIRÉE' :
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
              <div className="text-xs text-blue-600 font-medium">Quantité demandée</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
              <div className="text-lg font-bold text-gray-700">{formatDate(item.createdAt)}</div>
              <div className="text-xs text-gray-600 font-medium">Date de création</div>
            </div>
          </div>

          {/* Status Info - Enhanced for All Tabs */}
          <div className="mb-4">
            {item.status === 'OPEN' && (
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-green-900">Demande ouverte</div>
                    <div className="text-xs text-green-700 mt-1">Cette demande est active et en attente de réponses</div>
                  </div>
                </div>
                {item.createdAt && (
                  <div className="text-xs text-green-600 text-center mt-2 pt-2 border-t border-green-200">
                    Créée le {formatDate(item.createdAt)}
                  </div>
                )}
              </div>
            )}
            {item.status === 'EXPIRED' && (
              <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-orange-900">Demande expirée</div>
                    <div className="text-xs text-orange-700 mt-1">Cette demande a dépassé sa durée de validité</div>
                  </div>
                </div>
                {item.updatedAt && (
                  <div className="text-xs text-orange-600 text-center mt-2 pt-2 border-t border-orange-200">
                    Expirée le {formatDate(item.updatedAt)}
                  </div>
                )}
              </div>
            )}
            {item.status === 'CLOSED' && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-blue-900">Demande terminée</div>
                    <div className="text-xs text-blue-700 mt-1">Cette demande a été marquée comme complétée</div>
                  </div>
                </div>
                {item.updatedAt && (
                  <div className="text-xs text-blue-600 text-center mt-2 pt-2 border-t border-blue-200">
                    Fermée le {formatDate(item.updatedAt)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">Détails de la demande</div>
            <div className="text-sm text-gray-600 mb-2">{item.description || 'Aucune description'}</div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Région:</span> {item.region || 'Non spécifiée'}
              </div>
              <div>
                <span className="font-medium">Urgence:</span> {item.urgency || 'Normale'}
              </div>
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
                <div className="text-xs text-green-600 font-medium mb-1">Pharmacie demandeuse</div>
                <div className="text-sm font-semibold text-gray-900">{item.user?.name || item.pharmacyName || 'Non spécifiée'}</div>
                <div className="text-xs text-gray-600">{item.user?.city?.name ? `${item.user.city.name}, ${item.user.city.region}` : (item.pharmacyRegion || 'Région non spécifiée')}</div>
              </div>
            </div>
          </div>

          {/* Responses Summary */}
          {item.responses && item.responses.length > 0 && (
            <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{item.responses.length}</div>
                <div className="text-base font-semibold text-gray-800 mb-2">Réponses reçues</div>
                <div className="text-sm text-blue-600 font-medium">
                  Cliquez pour voir les réponses
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons (stick to bottom) */}
          <div className="mt-auto">
            {activeTab === 'disponibles' && (
              <button
                onClick={() => {
                  setSelectedRequest(item);
                  openResponseModal(item);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span>Répondre à la demande</span>
                </div>
              </button>
            )}

            {activeTab === 'reponses' && (
              <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-bold py-4 px-6 rounded-xl text-base text-center">
                <div className="flex items-center justify-center space-x-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span>Réponse envoyée</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Créée le {item.createdAt ? formatDate(item.createdAt) : 'Date non disponible'}
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Demandes</h1>
          <p className="text-gray-600">Répondez aux demandes de médicaments des pharmacies</p>
        </div>
        <ExportButton
          type="csv"
          endpoint="exportRequests"
          filename="demandes-fournisseur"
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
          ) : requests.length === 0 ? (
            <EmptyState
              title="Aucune demande trouvée"
              description={
                activeTab === 'disponibles' ? "Aucune demande en attente" :
                activeTab === 'reponses' ? "Aucune réponse envoyée" :
                "Aucune demande archivée"
              }
            />
          ) : (
            <div className="space-y-6">
              {/* Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {requests.map((item, index) => (
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

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="Répondre à la demande"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Répondez à la demande de "{selectedRequest?.medicine?.name || selectedRequest?.medicine}" 
              de la pharmacie "{selectedRequest?.pharmacy?.name || selectedRequest?.pharmacy}"
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message de réponse</Label>
            <Textarea
              id="message"
              value={responseData.message || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseData({ ...responseData, message: e.target.value })}
              rows={4}
              placeholder="Détaillez votre réponse, conditions, prix..."
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix proposé</Label>
              <Input
                id="price"
                type="number"
                value={responseData.price || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponseData({ ...responseData, price: e.target.value })}
                placeholder="Prix en dinars"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilité</Label>
              <Select
                value={responseData.availability || ''}
                onChange={(value: string) => setResponseData({ ...responseData, availability: value })}
                options={[
                  { value: 'IMMEDIATE', label: 'Immédiate' },
                  { value: 'WITHIN_WEEK', label: 'Dans la semaine' },
                  { value: 'WITHIN_MONTH', label: 'Dans le mois' },
                  { value: 'ON_ORDER', label: 'Sur commande' }
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsResponseModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleRespond}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              Envoyer la réponse
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Response Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier la réponse"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Modifiez votre réponse à la demande de "{selectedRequest?.medicine?.name || selectedRequest?.medicine}"
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message de réponse</Label>
            <Textarea
              id="message"
              value={responseData.message || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseData({ ...responseData, message: e.target.value })}
              rows={4}
              placeholder="Détaillez votre réponse, conditions, prix..."
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix proposé</Label>
              <Input
                id="price"
                type="number"
                value={responseData.price || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponseData({ ...responseData, price: e.target.value })}
                placeholder="Prix en dinars"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilité</Label>
              <Select
                value={responseData.availability || ''}
                onChange={(value: string) => setResponseData({ ...responseData, availability: value })}
                options={[
                  { value: 'IMMEDIATE', label: 'Immédiate' },
                  { value: 'WITHIN_WEEK', label: 'Dans la semaine' },
                  { value: 'WITHIN_MONTH', label: 'Dans le mois' },
                  { value: 'ON_ORDER', label: 'Sur commande' }
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleUpdateResponse}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              Mettre à jour
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Détails de la demande"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Médicament</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.medicine?.name || selectedRequest.medicine}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantité</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pharmacie</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.pharmacy?.name || selectedRequest.pharmacy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Région</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.region}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900">
                  <StatusBadge status={selectedRequest.status} />
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.description}</p>
            </div>

            {selectedRequest.response && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Votre réponse</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-900">{selectedRequest.response.message}</p>
                  {selectedRequest.response.price && (
                    <p className="text-sm text-gray-600 mt-1">Prix: {selectedRequest.response.price} DT</p>
                  )}
                  {selectedRequest.response.availability && (
                    <p className="text-sm text-gray-600">Disponibilité: {selectedRequest.response.availability}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedRequest(null)}
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