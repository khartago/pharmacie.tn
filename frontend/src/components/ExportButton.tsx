'use client';

import React, { useState } from 'react';
import { 
  Download, 
  FileDown,
  FileText,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface ExportButtonProps {
  type: 'csv' | 'pdf';
  endpoint: keyof typeof ExportAPI;
  filename?: string;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  type,
  endpoint,
  filename,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get icon based on type and state
  const getIcon = () => {
    if (loading) return Loader2;
    if (success) return Check;
    if (type === 'pdf') return FileText;
    return FileDown;
  };

  const Icon = getIcon();

  const handleExport = async () => {
    if (loading || disabled) return;

    setLoading(true);
    setSuccess(false);

    try {
      let response;
      
      // Call the appropriate export function
      switch (endpoint) {
        case 'exportPharmacies':
          response = await ExportAPI.exportPharmacies();
          break;
        case 'exportSuppliers':
          response = await ExportAPI.exportSuppliers();
          break;
        case 'exportAccounts':
          response = await ExportAPI.exportAccounts();
          break;
        case 'exportMedicines':
          response = await ExportAPI.exportMedicines();
          break;
        case 'exportAnnouncements':
          response = await ExportAPI.exportAnnouncements();
          break;
        case 'exportRequests':
          response = await ExportAPI.exportRequests();
          break;
        case 'exportSupportTickets':
          response = await ExportAPI.exportSupportTickets();
          break;
        case 'exportAuditLogs':
          response = await ExportAPI.exportAuditLogs();
          break;
        case 'exportAnalytics':
          response = await ExportAPI.exportAnalytics();
          break;
        case 'exportHealth':
          response = await ExportAPI.exportHealth();
          break;
        case 'exportRetourPDF':
          // This requires a retourId parameter
          console.warn('exportRetourPDF requires a retourId parameter');
          return;
        default:
          throw new Error('Endpoint non supporté');
      }

      if (response.success) {
        // Handle the response based on type
        if (type === 'csv' && response.data) {
          // Create and download CSV file
          const blob = new Blob([response.data as BlobPart], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename || `${endpoint}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === 'pdf' && response.data) {
          // Handle PDF download
          const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || `${endpoint}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

        setSuccess(true);
        onSuccess?.();
        
        // Reset success state after 2 seconds
        setTimeout(() => setSuccess(false), 2000);
      } else {
        throw new Error(response.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'export';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Export en cours...';
    if (success) return 'Export réussi!';
    return `Exporter ${type.toUpperCase()}`;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      <Icon className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
      {getButtonText()}
    </Button>
  );
};

export default ExportButton;