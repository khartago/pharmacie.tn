'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { RequestsAPI, MedicinesAPI, CitiesAPI } from '@/lib/api';
import MedicineAutocomplete from '@/components/ui/MedicineAutocomplete';
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
  MultiSelect,
  ModernPageHeader,
  ModernTabNav,
  ActionMenu,
  SearchBar,
  FilterPanel,
  ConfirmDialog,
  ContactCard,
  EmptyState,
  SkeletonTable,
  CountdownTimer
} from '@/components';
import { FilterOption } from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Check,
  X,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApi, usePagination, useFilters, useDebounce, useToast } from '@/lib/hooks';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { validationRules } from '@/lib/utils/validators';
import { filterCitiesByRegion } from '@/lib/utils/regionMapping';
import { REQUEST_SCOPE_OPTIONS, EXPIRY_TIMES } from '@/lib/utils/constants';
import { TUNISIA_REGIONS } from '@/lib/constants';

export default function PharmacieDemandesPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PharmacieDemandesContent />
    </Suspense>
  );
}

function PharmacieDemandesContent() {
  const [activeTab, setActiveTab] = useState('disponibles');
  const [requests, setRequests] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [responseData, setResponseData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedRequestForResponses, setSelectedRequestForResponses] = useState<any>(null);

  // Hooks
  const { execute: createRequest, loading: creating } = useApi(RequestsAPI.create);
  const { execute: updateRequest, loading: updating } = useApi(RequestsAPI.update);
  const { execute: deleteRequest } = useApi(RequestsAPI.delete);
  const { execute: respondToRequest } = useApi(RequestsAPI.respond);
  const { execute: acceptResponse } = useApi(RequestsAPI.updateResponseStatus);
  const { execute: refuseResponse } = useApi(RequestsAPI.updateResponseStatus);
  const { execute: getMedicines } = useApi(MedicinesAPI.search);
  
  const { pagination, setPage, setTotal } = usePagination();
  const { filters, setFilter, clearAllFilters, hasActiveFilters } = useFilters();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { success, error } = useToast();
  const [tabCounts, setTabCounts] = useState<{ disponibles: number; mesDemandes: number; jaiAccepte: number; archives: number }>({ disponibles: 0, mesDemandes: 0, jaiAccepte: 0, archives: 0 });

  // Tab configuration
  const tabs = [
    { key: 'disponibles', label: 'DEMANDES DISPONIBLES', count: tabCounts.disponibles },
    { key: 'mes-demandes', label: 'MES DEMANDES', count: tabCounts.mesDemandes },
    { key: 'jai-accepte', label: 'J\'AI ACCEPTÉ', count: tabCounts.jaiAccepte },
    { key: 'archives', label: 'ARCHIVES', count: tabCounts.archives }
  ];

  // Load data based on active tab
  useEffect(() => {
    loadData();
    loadCitiesAndRegions();
    refreshTabCounts();
  }, [activeTab, debouncedSearch, filters]);

  // Reload data when page changes
  useEffect(() => {
    loadData();
    refreshTabCounts();
  }, [pagination.page]);

  const refreshTabCounts = async () => {
    try {
      const baseParams: any = { search: debouncedSearch, ...filters, limit: 200, page: 1 };
      const [dResp, mResp, aResp, jResp] = await Promise.all([
        RequestsAPI.getAll({ ...baseParams, excludeMine: true, status: 'OPEN' }),
        RequestsAPI.getAll({ ...baseParams, userOnly: true, statusIn: 'OPEN,ACCEPTED' }),
        RequestsAPI.getAll({ ...baseParams, archives: 'true' }),
        RequestsAPI.getMyResponses({ ...baseParams, status: 'ACCEPTED' })
      ]);

      const extractList = (resp: any): any[] => {
        const payload: any = resp?.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.requests)) return payload.requests;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
      };

      const disponiblesList = extractList(dResp).filter((req: any) => String(req.status).toUpperCase() === 'OPEN' && !isExpired(req.createdAt, req.scope));
      const mesList = extractList(mResp).filter((req: any) => {
        const statusUpper = String(req.status).toUpperCase();
        // Explicitly exclude CLOSED and EXPIRED (they belong in archives)
        if (statusUpper === 'CLOSED' || statusUpper === 'EXPIRED') {
          return false;
        }
        const hasAccepted = Array.isArray(req.responses) && req.responses.some((r: any) => String(r.status).toUpperCase() === 'ACCEPTED');
        const notExpired = !isExpired(req.createdAt, req.scope);
        // Include OPEN requests that are not expired OR have accepted responses
        return statusUpper === 'OPEN' && (notExpired || hasAccepted);
      });
      const archivesList = extractList(aResp);
      const jaiList = (() => {
        const payload: any = jResp?.data;
        const responses = Array.isArray(payload?.responses) ? payload.responses :
                          Array.isArray(payload?.data) ? payload.data : [];
        // Exclude responses for CLOSED or EXPIRED requests (they belong in archives)
        return responses.filter((r: any) => {
          const responseStatus = String(r.status).toUpperCase();
          const requestStatus = String(r.request?.status || '').toUpperCase();
          return responseStatus === 'ACCEPTED' && requestStatus !== 'CLOSED' && requestStatus !== 'EXPIRED';
        });
      })();

      setTabCounts({
        disponibles: disponiblesList.length,
        mesDemandes: mesList.length,
        jaiAccepte: jaiList.length,
        archives: archivesList.length
      });
    } catch (e) {
      // ignore
    }
  };

  // Load cities and regions from backend
  const loadCitiesAndRegions = async () => {
    try {
      const citiesResponse = await CitiesAPI.getAll();
      const citiesData = citiesResponse.data?.data || citiesResponse.data;
      setCities(Array.isArray(citiesData) ? citiesData : []);
      
      // Extract unique regions from cities
      if (citiesData && Array.isArray(citiesData)) {
        const uniqueRegions = [...new Set(citiesData.map((city: any) => city.region))]
          .map(region => ({ value: region, label: region }));
        setRegions(uniqueRegions);
      }
    } catch (error) {
      console.error('Error loading cities and regions:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        ...filters
      };

      switch (activeTab) {
        case 'disponibles':
          response = await RequestsAPI.getAll({ 
            ...params, 
            excludeMine: true, 
            status: 'OPEN' 
          });
          break;
        case 'mes-demandes':
          response = await RequestsAPI.getAll({ 
            ...params, 
            userOnly: true 
          });
          break;
        case 'jai-accepte':
          response = await RequestsAPI.getMyResponses(params);
          break;
        case 'archives':
          // Server builds archives set (mine closed/expired + accepted by me closed/expired)
          response = await RequestsAPI.getAll({ 
            ...params, 
            archives: 'true'
          });
          break;
        default:
          response = await RequestsAPI.getAll(params);
      }
      
      if (response.success && response.data) {
        // Normalize payload shapes from backend: {data: T[]} | {data: {data: T[]}} | {data: {requests: T[]}} | {data: {responses: T[]}}
        const payload: any = response.data as any;
        if (activeTab === 'jai-accepte') {
          const responsesData = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.data)
              ? payload.data
              : Array.isArray(payload.responses)
                ? payload.responses
                : [];
          // Keep only accepted responses and still relevant (waiting to complete)
          // Exclude responses for CLOSED or EXPIRED requests (they belong in archives)
          const filtered = responsesData.filter((r: any) => {
            const responseStatus = String(r.status).toUpperCase();
            const requestStatus = String(r.request?.status || '').toUpperCase();
            // Only include ACCEPTED responses for requests that are not CLOSED or EXPIRED
            return responseStatus === 'ACCEPTED' && requestStatus !== 'CLOSED' && requestStatus !== 'EXPIRED';
          });
          setResponses(filtered);
          setTotal(payload.pagination?.total || filtered.length);
        } else {
          const requestsData = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.data)
              ? payload.data
              : Array.isArray(payload.requests)
                ? payload.requests
                : [];
          // Apply tab-specific client filters
          let filtered = requestsData as any[];
          if (activeTab === 'disponibles') {
            filtered = filtered.filter((req: any) => String(req.status).toUpperCase() === 'OPEN' && !isExpired(req.createdAt, req.scope));
          } else if (activeTab === 'mes-demandes') {
            filtered = filtered.filter((req: any) => {
              const statusUpper = String(req.status).toUpperCase();
              // Explicitly exclude CLOSED and EXPIRED (they belong in archives)
              if (statusUpper === 'CLOSED' || statusUpper === 'EXPIRED') {
                return false;
              }
              const hasAccepted = Array.isArray(req.responses) && req.responses.some((r: any) => String(r.status).toUpperCase() === 'ACCEPTED');
              const notExpired = !isExpired(req.createdAt, req.scope);
              // Include OPEN requests that are not expired OR have accepted responses
              return statusUpper === 'OPEN' && (notExpired || hasAccepted);
            });
          } else if (activeTab === 'archives') {
            // Backend already filtered; keep as-is
          }
          setRequests(filtered);
          setTotal(payload.pagination?.total || filtered.length);
        }
      } else {
        console.log('API Response failed or no data:', response);
        if (activeTab === 'jai-accepte') {
          setResponses([]);
        } else {
        setRequests([]);
        }
        setTotal(0);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      error('Erreur lors du chargement des données');
      if (activeTab === 'jai-accepte') {
        setResponses([]);
      } else {
      setRequests([]);
      }
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate expiry time
  const getExpiryTime = (createdAt: string, scope: string) => {
    const created = new Date(createdAt);
    const expiryTime = scope === 'ALL_TUNISIA' ? EXPIRY_TIMES.ALL_TUNISIA : EXPIRY_TIMES.CITY;
    return new Date(created.getTime() + expiryTime);
  };

  // Check if request is expired
  const isExpired = (createdAt: string, scope: string) => {
    const expiryTime = getExpiryTime(createdAt, scope);
    return new Date() > expiryTime;
  };

  // Form handlers
  const handleCreate = () => {
    setEditingRequest(null);
    setFormData({});
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setFormData({
      medicineId: request.medicine?.id,
      quantity: request.quantity,
      scope: request.scope,
      cities: request.cities,
      regions: request.regions
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleRenew = (request: any) => {
    setEditingRequest(null); // Create new, don't edit
    setFormData({
      medicineId: request.medicine?.id,
      medicineName: request.medicine?.brandName,
      quantity: request.quantity,
      scope: request.scope,
      cities: request.cities || [],
      regions: request.regions || []
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la demande',
      description: 'Êtes-vous sûr de vouloir supprimer cette demande ?',
      onConfirm: async () => {
        try {
          const response = await deleteRequest(id.toString());
          if (response?.success) {
            success('Demande supprimée avec succès');
            loadData();
          }
        } catch (err) {
          error('Erreur lors de la suppression');
        }
        setConfirmDialog(null);
      },
      variant: 'destructive'
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: any = {};

    // Validation
    if (!formData.medicineId) newErrors.medicineId = 'Médicament requis';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantité requise';
    if (!formData.scope) newErrors.scope = 'Portée requise';
    if (formData.scope === 'CITY' && (!formData.cities || formData.cities.length === 0)) {
      newErrors.cities = 'Au moins une ville requise';
    }
    if (formData.scope === 'REGION' && (!formData.regions || formData.regions.length === 0)) {
      newErrors.regions = 'Au moins une région requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let response;
      if (editingRequest) {
        response = await updateRequest(editingRequest.id.toString(), formData);
      } else {
        response = await createRequest(formData);
      }

      if (response?.success) {
        success(editingRequest ? 'Demande modifiée' : 'Demande créée');                                                             
        setIsModalOpen(false);
        loadData();
        refreshTabCounts();
      } else {
        error(response?.error || 'Erreur lors de l\'opération');
      }
    } catch (err) {
      error('Erreur lors de l\'opération');
    }
  };

  const handleRespond = (request: any) => {
    setSelectedRequest(request);
    setConfirmDialog({
      isOpen: true,
      title: "Confirmer votre disponibilité",
      description: `Êtes-vous sûr d'avoir le médicament "${request.medicine.brandName}" en stock ? Vos coordonnées seront partagées immédiatement avec le demandeur.`,
      onConfirm: () => confirmRespond(request.id),
      onCancel: () => setConfirmDialog(null),
      variant: 'success'
    });
  };

  const confirmRespond = async (requestId: string) => {
    try {
      await respondToRequest(requestId, { message: 'J\'ai ce médicament disponible' });
      success('Votre disponibilité a été confirmée ! Les coordonnées ont été partagées.');
      setConfirmDialog(null);
      loadData();
    } catch (err) {
      error('Erreur lors de la confirmation');
    }
  };

  const handleMarkAsCompleted = async (requestId: string | number | undefined) => {
    if (!requestId) {
      error('ID de demande manquant');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Marquer comme terminé",
      description: "Êtes-vous sûr de vouloir marquer cette demande comme terminée ? La demande sera archivée et ne sera plus visible.",
      onConfirm: () => confirmMarkAsCompleted(String(requestId)),
      onCancel: () => setConfirmDialog(null),
      variant: 'success'
    });
  };

  const confirmMarkAsCompleted = async (requestId: string) => {
    try {
      const response = await RequestsAPI.markAsCompleted(requestId);
      setConfirmDialog(null); // Fermer le dialog avant de traiter la réponse
      if (response?.success) {
        success('Demande marquée comme terminée !');
        loadData();
        refreshTabCounts();
      } else {
        error(response?.error || 'Erreur lors de la finalisation');
      }
    } catch (err) {
      setConfirmDialog(null);
      error('Erreur lors de la finalisation');
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseData.message.trim()) {
      setErrors({ message: 'Message requis' });
      return;
    }

    try {
      const response = await respondToRequest(selectedRequest.id.toString(), {
        message: responseData.message
      });
      
      if (response?.success) {
        success('Réponse envoyée avec succès');
        setIsResponseModalOpen(false);
        loadData();
      }
    } catch (err) {
      error('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleAcceptResponse = async (responseId: number) => {
    try {
      const response = await acceptResponse(selectedRequest.id.toString(), responseId.toString(), 'ACCEPTED');
      if (response?.success) {
        success('Réponse acceptée');
        setSelectedResponse(response.data);
        setShowContactModal(true);
        loadData();
      }
    } catch (err) {
      error('Erreur lors de l\'acceptation');
    }
  };

  const handleRefuseResponse = async (responseId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Refuser la réponse',
      description: 'Êtes-vous sûr de vouloir refuser cette réponse ?',
      onConfirm: async () => {
        try {
          const response = await refuseResponse(selectedRequest.id.toString(), responseId.toString(), 'REFUSED');
          if (response?.success) {
            success('Réponse refusée');
            loadData();
          }
        } catch (err) {
          error('Erreur lors du refus');
        }
        setConfirmDialog(null);
      },
      variant: 'destructive'
    });
  };

  const handleViewResponses = (request: any) => {
    setSelectedRequestForResponses(request);
    setShowResponsesModal(true);
  };

  // Card content renderer
  const renderCardContent = (item: any) => {
    if (activeTab === 'disponibles') {
      const isExpiredRequest = isExpired(item.createdAt, item.scope);
      
      return (
        <div className="group relative overflow-hidden h-full flex flex-col">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isExpiredRequest ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {isExpiredRequest ? 'EXPIRÉE' : 'OUVERTE'}
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

            {/* Request Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Détails de la demande</div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div>
                  <span className="font-medium">Portée:</span> {
                    item.scope === 'CITY' ? 'Ville' :
                    item.scope === 'REGION' ? 'Région' : 'Toute la Tunisie'
                  }
          </div>
          <div>
                  <span className="font-medium">Pharmacie:</span> {item.user?.name || 'Non spécifiée'}
          </div>
              </div>
            </div>

            {/* Countdown Timer */}
            {!isExpiredRequest && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    Expire dans: <CountdownTimer
                      expiryDate={getExpiryTime(item.createdAt, item.scope)}
                      variant="default"
                    />
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
                <button
              onClick={() => handleRespond(item)}
              disabled={isExpiredRequest}
              className={`w-full font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                isExpiredRequest 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>J'AI CE MÉDICAMENT</span>
              </div>
                </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Créée le {formatDate(item.createdAt)}
            </div>
          </div>
              </div>
            );
    }

    if (activeTab === 'mes-demandes') {
      const responseCount = item.responses?.length || 0;
      const pendingCount = item.responses?.filter((r: any) => r.status === 'PENDING')?.length || 0;
      const isExpiredRequest = isExpired(item.createdAt, item.scope);
      const responsesArray = Array.isArray(item.responses) ? item.responses : [];
      const acceptedResponses = responsesArray.filter((r: any) => String(r.status).toUpperCase() === 'ACCEPTED');
      const awaiting = responsesArray.length === 0;

      return (
        <div
          className="group relative overflow-hidden h-full min-h-[380px] flex flex-col rounded-xl"
          onClick={() => {
            if (acceptedResponses.length > 0) {
              const resp = acceptedResponses[0];
              setSelectedResponse({ pharmacy: resp.pharmacyUser });
              setShowContactModal(true);
            }
          }}
          role={acceptedResponses.length > 0 ? 'button' : undefined}
          tabIndex={acceptedResponses.length > 0 ? 0 : -1}
          onKeyDown={(e) => {
            if (acceptedResponses.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              const resp = acceptedResponses[0];
              setSelectedResponse({ pharmacy: resp.pharmacyUser });
              setShowContactModal(true);
            }
          }}
        >
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

          {/* Acceptants / Awaiting */}
          {acceptedResponses.length > 0 ? (
            <div className="mb-4 p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-center mb-3">
                <div className="text-base font-semibold text-gray-800">Pharmacies ayant accepté</div>
              </div>
              <div className="space-y-2">
                {acceptedResponses.slice(0, 3).map((response: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="text-sm font-semibold text-gray-800">{response.pharmacyUser?.name}</div>
                    <div className="text-xs text-gray-600">{response.pharmacyUser?.city?.name}</div>
                    <div className="text-xs text-green-600 font-medium">Contact disponible</div>
                  </div>
                ))}
                {acceptedResponses.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">+{acceptedResponses.length - 3} autres pharmacies</div>
                )}
              </div>
            </div>
          ) : awaiting ? (
            <div className="mb-4 p-4 rounded-xl border bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <div className="text-center mb-3">
                <div className="text-base font-semibold text-gray-800">En attente</div>
                <div className="text-xs text-gray-600">En attente qu'une pharmacie confirme la disponibilité de ce médicament</div>
              </div>
              <div className="space-y-2">
                {/* Empty placeholder to keep vertical rhythm consistent */}
              </div>
            </div>
          ) : null}

          {/* Action Buttons (stick to bottom) */}
            <div className="space-y-3 mt-auto">
              {item.status === 'OPEN' && (
                <button
                  onClick={() => handleMarkAsCompleted(item.id)}
                  disabled={!((Array.isArray(item.responses) ? item.responses : []).some((r: any) => String(r.status).toUpperCase() === 'ACCEPTED'))}
                  className={`w-full font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${
                    (Array.isArray(item.responses) ? item.responses : []).some((r: any) => String(r.status).toUpperCase() === 'ACCEPTED')
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>MARQUER COMME TERMINÉ</span>
                  </div>
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleEdit(item)}
                  disabled={isExpiredRequest}
                  className={`font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${
                    isExpiredRequest 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </div>
            </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </div>
                </button>
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Créée le {formatDate(item.createdAt)}
          </div>
        </div>
      </div>
    );
    }

    if (activeTab === 'jai-accepte') {
      return (
        <div className="group relative overflow-hidden h-full min-h-[380px] flex flex-col rounded-xl">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              item.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border border-green-200' :
              item.status === 'REFUSED' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {item.status === 'PENDING' ? 'EN ATTENTE' :
               item.status === 'ACCEPTED' ? 'ACCEPTÉE' :
               item.status === 'REFUSED' ? 'REFUSÉE' :
               item.status}
            </div>
          </div>

          {/* Medicine Header */}
          <div className="p-6 pb-4 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.request?.medicine?.brandName || 'Nom non disponible'}</h3>
              <div className="text-sm text-gray-600 mb-1">{item.request?.medicine?.dci || 'DCI non disponible'}</div>
              <div className="text-xs text-gray-500">{item.request?.medicine?.laboratoire || 'Laboratoire non disponible'}</div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-blue-700">{item.request?.quantity || 0}</div>
                <div className="text-xs text-blue-600 font-medium">Quantité demandée</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-gray-700">{formatDate(item.request?.createdAt || item.createdAt)}</div>
                <div className="text-xs text-gray-600 font-medium">Date de création</div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Pharmacie demandeuse</div>
              <div className="text-sm text-gray-600 mb-1">{item.request?.user?.name || 'Non spécifiée'}</div>
              <div className="text-xs text-gray-500">{item.request?.user?.city?.name}, {item.request?.user?.city?.region}</div>
            </div>

            {/* Contact Info - Toujours affiché car status ACCEPTED */}
            <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-sm font-semibold text-gray-800 mb-2">Contact du demandeur</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>{item.request?.user?.phone || 'Non disponible'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span>{item.request?.user?.email || 'Non disponible'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>{item.request?.user?.address || 'Non disponible'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (stick to bottom) */}
            <div className="mt-auto">
              <button
                onClick={() => {
                  const reqId = item.request?.id || item.requestId;
                  if (reqId) {
                    handleMarkAsCompleted(reqId);
                  } else {
                    error('ID de demande introuvable');
                  }
                }}
                disabled={String(item.status).toUpperCase() !== 'ACCEPTED' || !(item.request?.id || item.requestId)}
                className={`w-full font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${
                  String(item.status).toUpperCase() === 'ACCEPTED' && (item.request?.id || item.requestId)
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>MARQUER COMME TERMINÉ</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Proposé le {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'archives') {
      return (
        <div className="group relative overflow-hidden h-full min-h-[380px] flex flex-col rounded-xl">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-full border border-gray-200">
              ARCHIVÉE
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
                <div className="text-xs text-blue-600 font-medium">Quantité demandée</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-gray-700">{formatDate(item.createdAt)}</div>
                <div className="text-xs text-gray-600 font-medium">Date de création</div>
              </div>
            </div>

            {/* Status Info - Enhanced */}
            <div className="mb-4">
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

            {/* Action Buttons (stick to bottom) */}
            <div className="mt-auto">
              {item.status === 'EXPIRED' && (
                <button
                  onClick={() => handleRenew(item)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>RENOUVELER LA DEMANDE</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Archivée le {formatDate(item.updatedAt)}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Filter options
  const filterOptions: FilterOption[] = [
    { key: 'status', label: 'Statut', type: 'select' as const, options: [
      { value: 'OPEN', label: 'Ouvert' },
      { value: 'ACCEPTED', label: 'Accepté' },
      { value: 'CLOSED', label: 'Fermé' },
      { value: 'EXPIRED', label: 'Expiré' }
    ]},
    { key: 'region', label: 'Région', type: 'select' as const, options: TUNISIA_REGIONS.map(region => ({ value: region, label: region })) }
  ];

  if (loading && (requests.length === 0 && responses.length === 0)) {
    return <SkeletonTable rows={10} columns={6} />;
  }

  const currentData = activeTab === 'jai-accepte' ? responses : requests;

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Demandes"
        description="Gérez vos demandes de médicaments"
        icon={ShoppingCart}
        actions={
          <div className="flex space-x-3">
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </div>
        }
        search={{
          placeholder: 'Rechercher des demandes...',
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
      ) : currentData.length === 0 ? (
        <EmptyState
          title={`Aucune ${activeTab} trouvée`}
          description={`Vous n'avez aucune ${activeTab} pour le moment.`}
          action={
            activeTab === 'mes-demandes' ? {
              label: 'Créer une demande',
              onClick: handleCreate,
              variant: 'default' as const
            } : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentData.map((item, index) => (
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRequest ? 'Modifier la demande' : 'Nouvelle demande'}
        size="xl"
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
            label="Portée de la demande"
            required
            error={errors.scope}
          >
            <Select
              placeholder="Sélectionner la portée"
              value={formData.scope || ''}
              onChange={(value) => setFormData({ ...formData, scope: value, cities: [], regions: [] })}
              options={REQUEST_SCOPE_OPTIONS as any}
            />
          </FormField>

          {formData.scope === 'CITY' && (
            <>
              <FormField
                label="Régions"
                required
                error={errors.regions}
              >
                <MultiSelect
                  placeholder="Sélectionner les régions"
                  value={formData.regions || []}
                  onChange={(values: string[]) => setFormData({ ...formData, regions: values, cities: [] })}
                  options={regions as any}
                />
              </FormField>

              <FormField
                label="Villes"
                required
                error={errors.cities}
              >
                <MultiSelect
                  placeholder={formData.regions?.length ? 'Sélectionner les villes' : 'Sélectionner d\'abord une ou plusieurs régions'}
                  value={formData.cities || []}
                  onChange={(values: string[]) => setFormData({ ...formData, cities: values })}
                  options={(formData.regions?.length ? cities.filter((c: any) => (formData.regions as string[]).includes(c.region)) : [])
                    .map((city: any) => ({ value: city.id, label: `${city.name} (${city.region})` }))}
                  disabled={!formData.regions || formData.regions.length === 0}
                />
              </FormField>
            </>
          )}

          {formData.scope === 'REGION' && (
            <FormField
              label="Régions"
              required
              error={errors.regions}
            >
              <MultiSelect
                placeholder="Sélectionner les régions"
                value={formData.regions || []}
                onChange={(values: string[]) => setFormData({ ...formData, regions: values })}
                options={regions as any}
              />
            </FormField>
          )}

          {formData.scope && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Cette demande expirera dans {
                    formData.scope === 'CITY' ? '24h' :
                    formData.scope === 'REGION' ? '24h' : '48h'
                  }
                </span>
              </div>
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
            {editingRequest ? 'Modifier' : 'Créer'}
          </ModalActionButton>
        </ModalFooter>
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="Répondre à la demande"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{selectedRequest?.medicine?.brandName}</h4>
            <p className="text-sm text-muted-foreground">
              Quantité demandée: {selectedRequest?.quantity}
            </p>
          </div>

          <FormField
            label="Message"
            required
            error={errors.message}
          >
            <Textarea
              placeholder="Votre message de réponse..."
              value={responseData.message || ''}
              onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
              rows={4}
            />
          </FormField>
        </div>

        <ModalFooter>
          <ModalActionButton
            onClick={() => setIsResponseModalOpen(false)}
            variant="outline"
          >
            Annuler
          </ModalActionButton>
          <ModalActionButton
            onClick={handleSubmitResponse}
            variant="default"
          >
            Envoyer
          </ModalActionButton>
        </ModalFooter>
      </Modal>

      {/* Responses Management Modal */}
      {showResponsesModal && selectedRequestForResponses && (
        <Modal
          isOpen={showResponsesModal}
          onClose={() => setShowResponsesModal(false)}
          title="Gérer les réponses"
          size="lg"
        >
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{selectedRequestForResponses.medicine?.brandName}</div>
              <div className="text-sm text-gray-600">Quantité: {selectedRequestForResponses.quantity}</div>
            </div>
            
            {selectedRequestForResponses.responses?.length > 0 ? (
              selectedRequestForResponses.responses.map((response: any) => (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{response.pharmacyUser?.name || 'Pharmacie'}</div>
                      <div className="text-sm text-gray-500">
                        {response.pharmacyUser?.city?.name}, {response.pharmacyUser?.city?.region}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(response.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={response.status} />
                  </div>
                  
                  {response.status === 'PENDING' && (
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptResponse(response.id)}
                      >
                        Accepter
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        onClick={() => handleRefuseResponse(response.id)}
                      >
                        Refuser
                      </Button>
                    </div>
                  )}
                  
                  {response.status === 'ACCEPTED' && (
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Contact</div>
                      <div className="text-sm">Tél: {response.pharmacyUser?.phone}</div>
                      <div className="text-sm">Email: {response.pharmacyUser?.email}</div>
                      <div className="text-sm">Adresse: {response.pharmacyUser?.address}</div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune réponse reçue pour cette demande
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedResponse && (
        <Modal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          title="Contact de la pharmacie"
          size="md"
        >
          <ContactCard
            contact={{
              name: selectedResponse.pharmacy?.name,
              email: selectedResponse.pharmacy?.email,
              phone: selectedResponse.pharmacy?.phone,
              address: selectedResponse.pharmacy?.address,
              city: selectedResponse.pharmacy?.city?.name,
              region: selectedResponse.pharmacy?.city?.region
            }}
          />
        </Modal>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen ?? true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => {
            if (confirmDialog.onConfirm) {
              confirmDialog.onConfirm();
            }
          }}
          title={confirmDialog.title}
          description={confirmDialog.description || confirmDialog.message || (confirmDialog.subMessage ? `${confirmDialog.message}\n${confirmDialog.subMessage}` : '')}
          variant={confirmDialog.variant || 'default'}
        />
      )}
    </div>
  );
}