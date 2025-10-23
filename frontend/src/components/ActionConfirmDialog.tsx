'use client';

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Archive, 
  RefreshCw,
  User,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal, ModalActionButton, ModalFooter } from '@/components';

interface ActionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
}

export default function ActionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
  icon: Icon,
  loading = false,
  className
}: ActionConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-500',
          title: 'text-red-800',
          description: 'text-red-600',
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
        };
      case 'warning':
        return {
          icon: 'text-orange-500',
          title: 'text-orange-800',
          description: 'text-orange-600',
          confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white'
        };
      case 'success':
        return {
          icon: 'text-green-500',
          title: 'text-green-800',
          description: 'text-green-600',
          confirmButton: 'bg-green-500 hover:bg-green-600 text-white'
        };
      default:
        return {
          icon: 'text-blue-500',
          title: 'text-gray-800',
          description: 'text-gray-600',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return Trash2;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const styles = getVariantStyles();
  const IconComponent = Icon || getDefaultIcon();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-full bg-gray-100', styles.icon)}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className={cn('text-lg font-semibold mb-2', styles.title)}>
              {title}
            </h3>
            <p className={cn('text-sm', styles.description)}>
              {description}
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={styles.confirmButton}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Specific confirmation dialogs for common actions
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Supprimer l'élément"
      description={`Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`}
      confirmText="Supprimer"
      variant="danger"
      icon={Trash2}
      loading={loading}
    />
  );
}

export function ArchiveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Archiver l'élément"
      description={`Êtes-vous sûr de vouloir archiver "${itemName}" ? Il sera déplacé vers les archives.`}
      confirmText="Archiver"
      variant="warning"
      icon={Archive}
      loading={loading}
    />
  );
}

export function AcceptConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Accepter la demande"
      description={`Êtes-vous sûr de vouloir accepter "${itemName}" ?`}
      confirmText="Accepter"
      variant="success"
      icon={CheckCircle}
      loading={loading}
    />
  );
}

export function RejectConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Refuser la demande"
      description={`Êtes-vous sûr de vouloir refuser "${itemName}" ?`}
      confirmText="Refuser"
      variant="danger"
      icon={XCircle}
      loading={loading}
    />
  );
}

export function ExpireConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Marquer comme expiré"
      description={`Êtes-vous sûr de vouloir marquer "${itemName}" comme expiré ?`}
      confirmText="Marquer expiré"
      variant="warning"
      icon={AlertTriangle}
      loading={loading}
    />
  );
}

export function RestoreConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Restaurer l'élément"
      description={`Êtes-vous sûr de vouloir restaurer "${itemName}" ?`}
      confirmText="Restaurer"
      variant="success"
      icon={RefreshCw}
      loading={loading}
    />
  );
}

// Bulk action confirmation
export function BulkActionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  count,
  loading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'delete' | 'archive' | 'restore' | 'accept' | 'reject';
  count: number;
  loading?: boolean;
}) {
  const getActionConfig = () => {
    switch (action) {
      case 'delete':
        return {
          title: 'Supprimer les éléments sélectionnés',
          description: `Êtes-vous sûr de vouloir supprimer ${count} élément(s) ? Cette action est irréversible.`,
          confirmText: 'Supprimer',
          variant: 'danger' as const,
          icon: Trash2
        };
      case 'archive':
        return {
          title: 'Archiver les éléments sélectionnés',
          description: `${count} élément(s) seront archivés.`,
          confirmText: 'Archiver',
          variant: 'warning' as const,
          icon: Archive
        };
      case 'restore':
        return {
          title: 'Restaurer les éléments sélectionnés',
          description: `${count} élément(s) seront restaurés.`,
          confirmText: 'Restaurer',
          variant: 'success' as const,
          icon: RefreshCw
        };
      case 'accept':
        return {
          title: 'Accepter les éléments sélectionnés',
          description: `${count} élément(s) seront acceptés.`,
          confirmText: 'Accepter',
          variant: 'success' as const,
          icon: CheckCircle
        };
      case 'reject':
        return {
          title: 'Refuser les éléments sélectionnés',
          description: `${count} élément(s) seront refusés.`,
          confirmText: 'Refuser',
          variant: 'danger' as const,
          icon: XCircle
        };
    }
  };

  const config = getActionConfig();

  return (
    <ActionConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      variant={config.variant}
      icon={config.icon}
      loading={loading}
    />
  );
}

