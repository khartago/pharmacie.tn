'use client';

import { useState, useEffect } from 'react';
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
  ExportButton,
  EmptyState,
  SkeletonTable
} from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TabConfig {
  key: string;
  label: string;
  api: any;
  columns: any[];
  formFields?: any[];
  exportEndpoint?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface TabbedDataLayoutProps {
  title: string;
  description: string;
  tabs: TabConfig[];
  userRole: string;
  defaultTab?: string;
}

export default function TabbedDataLayout({
  title,
  description,
  tabs,
  userRole,
  defaultTab
}: TabbedDataLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || '');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const currentTab = tabs.find(tab => tab.key === activeTab);

  useEffect(() => {
    if (activeTab) {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    if (!currentTab) return;
    
    setLoading(true);
    try {
      const response = await currentTab.api.getAll();
      if (response.success && response.data) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error(`Failed to load ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (itemId: number) => {
    if (!currentTab) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        const response = await currentTab.api.delete(itemId.toString());
        if (response.success) {
          loadData();
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentTab) return;
    
    setErrors({});
    const newErrors: any = {};

    // Basic validation
    if (currentTab.formFields) {
      currentTab.formFields.forEach((field: any) => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} est requis`;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let response;
      if (editingItem) {
        response = await currentTab.api.update(editingItem.id.toString(), formData);
      } else {
        response = await currentTab.api.create(formData);
      }

      if (response.success) {
        setModalOpen(false);
        loadData();
      } else {
        setErrors({ general: response.error || 'Erreur lors de l\'opération' });
      }
    } catch (error) {
      setErrors({ general: 'Erreur lors de l\'opération' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && data.length === 0) {
    return <SkeletonTable rows={10} columns={6} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">{title}</h1>
          <p className="mt-1 text-body-small text-muted-foreground">{description}</p>
        </div>
        <div className="flex space-x-3">
          {currentTab?.canCreate && (
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Ajouter
            </Button>
          )}
          {currentTab?.exportEndpoint && (
            <ExportButton
              type="csv"
              endpoint={currentTab.exportEndpoint as any}
              filename={`${activeTab}_${new Date().toISOString().split('T')[0]}`}
              variant="outline"
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover-lift',
                activeTab === tab.key
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-muted/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {data.length === 0 && !loading ? (
        <EmptyState
          title={`Aucun ${activeTab} trouvé`}
          description={`Vous n'avez aucun ${activeTab} pour le moment.`}
          action={
            currentTab?.canCreate ? {
              label: `Ajouter un ${activeTab}`,
              onClick: handleCreate,
              variant: 'default' as const
            } : undefined
          }
        />
      ) : (
        <UnifiedTable
          data={data}
          columns={currentTab?.columns || []}
          loading={loading}
          searchable={true}
          searchPlaceholder={`Rechercher dans les ${activeTab}...`}
          pagination={true}
          pageSize={10}
          emptyMessage={`Aucun ${activeTab} trouvé`}
        />
      )}

      {/* Create/Edit Modal */}
      {currentTab?.formFields && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingItem ? `Modifier ${activeTab}` : `Nouveau ${activeTab}`}
          size="lg"
        >
          <div className="space-y-4">
            {currentTab.formFields.map((field: any) => {
              const commonProps = {
                label: field.label,
                value: formData[field.name] || '',
                onChange: (e: any) => handleInputChange(field.name, e.target.value),
                error: errors[field.name],
                placeholder: field.placeholder,
                required: field.required
              };

              switch (field.type) {
                case 'textarea':
                  return (
                    <Textarea
                      key={field.name}
                      {...commonProps}
                      rows={field.rows || 4}
                    />
                  );
                case 'select':
                  return (
                    <Select
                      key={field.name}
                      {...commonProps}
                      options={field.options || []}
                    />
                  );
                default:
                  return (
                    <Input
                      key={field.name}
                      {...commonProps}
                      type={field.inputType || 'text'}
                    />
                  );
              }
            })}
          </div>

          {errors.general && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{errors.general}</p>
            </div>
          )}

          <ModalFooter>
            <ModalActionButton
              onClick={() => setModalOpen(false)}
              variant="outline"
            >
              Annuler
            </ModalActionButton>
            <ModalActionButton
              onClick={handleSubmit}
              variant="default"
            >
              {editingItem ? 'Modifier' : 'Créer'}
            </ModalActionButton>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
} 