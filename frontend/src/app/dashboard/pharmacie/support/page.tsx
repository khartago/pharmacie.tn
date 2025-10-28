'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { SupportAPI } from '@/lib/api';
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
  EmptyState,
  SkeletonTable
} from '@/components';
import { FilterOption } from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Archive,
  Clock
} from 'lucide-react';
import { useApi, usePagination, useFilters, useDebounce, useToast } from '@/lib/hooks';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { SUPPORT_CATEGORIES, PRIORITIES } from '@/lib/utils/constants';

export default function PharmacieSupportPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PharmacieSupportContent />
    </Suspense>
  );
}

function PharmacieSupportContent() {
  const [activeTab, setActiveTab] = useState('ouverts');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [replyData, setReplyData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<any>(null);

  // Hooks
  const { execute: getTickets } = useApi(SupportAPI.getAll);
  const { execute: createTicket, loading: creating } = useApi(SupportAPI.create);
  const { execute: updateTicket, loading: updating } = useApi(SupportAPI.update);
  const { execute: deleteTicket } = useApi(SupportAPI.delete);
  const { execute: replyToTicket } = useApi(SupportAPI.reply);
  const { execute: archiveTicket } = useApi(SupportAPI.archive);
  
  const { pagination, setPage, setTotal } = usePagination();
  const { filters, setFilter, clearAllFilters, hasActiveFilters } = useFilters();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { success, error } = useToast();

  // Tab configuration
  const tabs = [
    { key: 'ouverts', label: 'Ouverts', count: tickets.filter(t => t.status === 'OPEN').length },
    { key: 'en-cours', label: 'En Cours', count: tickets.filter(t => t.status === 'IN_PROGRESS').length },
    { key: 'resolus', label: 'Résolus', count: tickets.filter(t => t.status === 'RESOLVED').length },
    { key: 'archives', label: 'Archivés', count: tickets.filter(t => t.isArchived).length }
  ];

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, debouncedSearch, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: activeTab === 'archives' ? undefined : activeTab.toUpperCase().replace('-', '_'),
        archived: activeTab === 'archives',
        ...filters
      };

      const response = await getTickets(params);
      
      if (response?.success && response.data) {
        setTickets(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err) {
      error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleCreate = () => {
    setEditingTicket(null);
    setFormData({});
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setFormData({
      subject: ticket.subject,
      message: ticket.message,
      priority: ticket.priority,
      category: ticket.category
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (ticketId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer le ticket',
      description: 'Êtes-vous sûr de vouloir supprimer ce ticket ?',
      onConfirm: async () => {
        try {
          const response = await deleteTicket(ticketId.toString());
          if (response?.success) {
            success('Ticket supprimé avec succès');
            loadData();
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
    if (!formData.subject?.trim()) newErrors.subject = 'Sujet requis';
    if (!formData.message?.trim()) newErrors.message = 'Message requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let response;
      if (editingTicket) {
        response = await updateTicket(editingTicket.id.toString(), formData);
      } else {
        response = await createTicket(formData);
      }

      if (response?.success) {
        success(editingTicket ? 'Ticket modifié' : 'Ticket créé');                                                                  
        setIsModalOpen(false);
        loadData();
      } else {
        error(response?.error || 'Erreur lors de l\'opération');
      }
    } catch (err) {
      error('Erreur lors de l\'opération');
    }
  };

  const handleReply = (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyData({ replyMessage: '' });
    setErrors({});
    setIsReplyModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!replyData.replyMessage?.trim()) {
      setErrors({ replyMessage: 'Message requis' });
      return;
    }

    try {
      const response = await replyToTicket(selectedTicket.id.toString(), {
        replyMessage: replyData.replyMessage
      });
      
      if (response?.success) {
        success('Réponse envoyée avec succès');
        setIsReplyModalOpen(false);
        loadData();
      }
    } catch (err) {
      error('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleArchive = async (ticketId: number) => {
    try {
      const response = await archiveTicket(ticketId.toString());
      if (response?.success) {
        success('Ticket archivé');
        loadData();
      }
    } catch (err) {
      error('Erreur lors de l\'archivage');
    }
  };

  // Table columns
  const getColumns = () => {
    return [
      { 
        key: 'subject', 
        header: 'Sujet', 
        sortable: true, 
        render: (value: string, row: any) => (
          <div className="flex items-start space-x-2">
            <div className="flex-1">
              <div className="font-medium">{value}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {row.message}
              </div>
            </div>
            {row.isImportant && (
              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
        )
      },
      { 
        key: 'priority', 
        header: 'Priorité', 
        sortable: true, 
        render: (value: string) => {
          const priority = (PRIORITIES as any)[value?.toUpperCase()];
          return (
            <StatusBadge
              status={value}
            />
          );
        }
      },
      { 
        key: 'category', 
        header: 'Catégorie', 
        sortable: true, 
        render: (value: string) => (
          <span className="text-sm text-muted-foreground">
            {(SUPPORT_CATEGORIES as any)[value?.toUpperCase()]?.label || value}
          </span>
        )
      },
      { 
        key: 'status', 
        header: 'Statut', 
        sortable: true, 
        render: (value: string) => <StatusBadge status={value} />
      },
      { 
        key: 'createdAt', 
        header: 'Créé le', 
        sortable: true, 
        render: (value: string) => (
          <div>
            <div className="text-sm">{formatDate(value)}</div>
            <div className="text-xs text-muted-foreground">{formatRelativeTime(value)}</div>
          </div>
        )
      },
      { 
        key: 'actions', 
        header: 'Actions', 
        render: (value: any, row: any) => {
          const actions = [
            {
              key: 'reply',
              label: 'Répondre',
              icon: MessageSquare,
              onClick: () => handleReply(row)
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: Edit,
              onClick: () => handleEdit(row)
            }
          ];

          if (row.status === 'RESOLVED' && !row.isArchived) {
            actions.push({
              key: 'archive',
              label: 'Archiver',
              icon: Archive,
              onClick: () => handleArchive(row.id)
            });
          }

          actions.push({
            key: 'delete',
            label: 'Supprimer',
            icon: Trash2,
            onClick: () => handleDelete(row.id)
          });

          return <ActionMenu actions={actions} />;
        }
      }
    ];
  };

  // Filter options
  const filterOptions: FilterOption[] = [
    { key: 'status', label: 'Statut', type: 'select' as const, options: [
      { value: 'OPEN', label: 'Ouvert' },
      { value: 'IN_PROGRESS', label: 'En cours' },
      { value: 'RESOLVED', label: 'Résolu' }
    ]},
    { key: 'priority', label: 'Priorité', type: 'select' as const, options: [
      { value: 'low', label: 'Faible' },
      { value: 'medium', label: 'Moyenne' },
      { value: 'high', label: 'Élevée' }
    ]},
    { key: 'category', label: 'Catégorie', type: 'select' as const, options: [
      { value: 'technical', label: 'Technique' },
      { value: 'account', label: 'Compte' },
      { value: 'billing', label: 'Facturation' },
      { value: 'other', label: 'Autre' }
    ]},
    { key: 'isImportant', label: 'Important', type: 'checkbox' as const }
  ];

  if (loading && tickets.length === 0) {
    return <SkeletonTable rows={10} columns={6} />;
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Support"
        description="Gérez vos tickets de support"
        icon={HelpCircle}
        actions={
          <div className="flex space-x-3">
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau ticket
            </Button>
          </div>
        }
        search={{
          placeholder: 'Rechercher dans les tickets...',
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

      {/* Table */}
      {tickets.length === 0 && !loading ? (
        <EmptyState
          title="Aucun ticket trouvé"
          description="Vous n'avez aucun ticket de support pour le moment."
          action={{
            label: 'Créer un ticket',
            onClick: handleCreate,
            variant: 'default' as const
          }}
        />
      ) : (
        <UnifiedTable
          data={tickets}
          columns={getColumns()}
          loading={loading}
          searchable={true}
          searchPlaceholder="Rechercher dans les tickets..."
          pagination={true}
          pageSize={10}
          emptyMessage="Aucun ticket trouvé"
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTicket ? 'Modifier le ticket' : 'Nouveau ticket'}
        size="lg"
      >
        <div className="space-y-4">
          <FormField
            label="Sujet"
            required
            error={errors.subject}
          >
            <Input
              placeholder="Sujet du ticket"
              value={formData.subject || ''}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </FormField>

          <FormField
            label="Message"
            required
            error={errors.message}
          >
            <Textarea
              placeholder="Décrivez votre problème..."
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Priorité"
              error={errors.priority}
            >
              <Select
                placeholder="Sélectionner une priorité"
                value={formData.priority || ''}
                onChange={(value) => setFormData({ ...formData, priority: value })}
                options={[
                  { value: 'low', label: 'Faible' },
                  { value: 'medium', label: 'Moyenne' },
                  { value: 'high', label: 'Élevée' }
                ]}
              />
            </FormField>

            <FormField
              label="Catégorie"
              error={errors.category}
            >
              <Select
                placeholder="Sélectionner une catégorie"
                value={formData.category || ''}
                onChange={(value) => setFormData({ ...formData, category: value })}
                options={[
                  { value: 'technical', label: 'Technique' },
                  { value: 'account', label: 'Compte' },
                  { value: 'billing', label: 'Facturation' },
                  { value: 'other', label: 'Autre' }
                ]}
              />
            </FormField>
          </div>
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
            {editingTicket ? 'Modifier' : 'Créer'}
          </ModalActionButton>
        </ModalFooter>
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title="Répondre au ticket"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{selectedTicket?.subject}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedTicket?.message}
            </p>
          </div>

          <FormField
            label="Votre réponse"
            required
            error={errors.replyMessage}
          >
            <Textarea
              placeholder="Votre message de réponse..."
              value={replyData.replyMessage || ''}
              onChange={(e) => setReplyData({ ...replyData, replyMessage: e.target.value })}
              rows={4}
            />
          </FormField>
        </div>

        <ModalFooter>
          <ModalActionButton
            onClick={() => setIsReplyModalOpen(false)}
            variant="outline"
          >
            Annuler
          </ModalActionButton>
          <ModalActionButton
            onClick={handleSubmitReply}
            variant="default"
          >
            Envoyer
          </ModalActionButton>
        </ModalFooter>
      </Modal>

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