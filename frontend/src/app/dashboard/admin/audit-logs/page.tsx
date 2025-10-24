'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogsAPI, ExportAPI } from '@/lib/api';
import { UnifiedTable, StatusBadge, Modal } from '@/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/enhanced-select';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  User,
  Shield,
  Database
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');

  const columns = [
    { key: 'createdAt', header: 'Date/Heure', sortable: true, render: (value: string) => new Date(value).toLocaleString('fr-FR') },
    { key: 'user', header: 'Utilisateur', sortable: true, render: (value: any) => value?.name || value?.email || 'N/A' },
    { key: 'action', header: 'Action', sortable: true, render: (value: string) => {
        const actionMap: Record<string, string> = {
          'USER_LOGIN': 'Connexion',
          'USER_LOGOUT': 'Déconnexion',
          'USER_REGISTERED': 'Inscription',
          'PHARMACY_CREATED': 'Pharmacie créée',
          'PHARMACY_UPDATED': 'Pharmacie modifiée',
          'ANNOUNCEMENT_CREATED': 'Annonce créée',
          'ANNOUNCEMENT_UPDATED': 'Annonce modifiée',
          'REQUEST_CREATED': 'Demande créée',
          'REQUEST_UPDATED': 'Demande modifiée'
        };
        return actionMap[value] || value;
      }
    },
    { key: 'entityType', header: 'Ressource', sortable: true, render: (value: string) => {
        const entityMap: Record<string, string> = {
          'USER': 'Utilisateur',
          'PHARMACY': 'Pharmacie',
          'ANNOUNCEMENT': 'Annonce',
          'REQUEST': 'Demande',
          'MEDICINE': 'Médicament',
          'SUPPLIER': 'Fournisseur'
        };
        return entityMap[value] || value;
      }
    },
    { key: 'status', header: 'Statut', sortable: true, render: (value: string, row: any) => {
        // Map audit log actions to status badge statuses
        const action = row.action;
        let status = 'ACTIVE'; // default
        
        if (action === 'USER_LOGIN' || action.includes('SUCCESS') || action.includes('CREATE')) {
          status = 'ACTIVE'; // Green dot
        } else if (action.includes('ERROR') || action.includes('FAIL') || action.includes('LOGOUT')) {
          status = 'REFUSED'; // Red dot
        } else if (action.includes('UPDATE') || action.includes('MODIFY')) {
          status = 'PENDING'; // Yellow dot
        }
        
        return <StatusBadge status={status} />;
      }
    },
    { key: 'ipAddress', header: 'IP', sortable: false, render: (value: string, row: any) => row.details?.ip || '-' }
  ];

  const fetchLogs = async () => {
    try {
      const days = parseInt(dateFilter);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await AuditLogsAPI.getAll({ 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      if (response.success && response.data) {
        console.log('Audit logs response:', response.data);
        const logsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setLogs(logsData);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dateFilter, fetchLogs]);

  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportAuditLogs();
      if (response.success) {
        // Handle download
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${dateFilter}days.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.user?.name || log.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entityType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesUser = userFilter === 'all' || (log.user?.name || log.user?.email) === userFilter;
    return matchesSearch && matchesAction && matchesUser;
  });

  console.log('Logs:', logs);
  console.log('Filtered logs:', filteredLogs);

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
    success: logs.filter(l => 
      l.action === 'USER_LOGIN' || 
      l.action.includes('SUCCESS') || 
      l.action.includes('CREATE') ||
      l.action.includes('REGISTERED') ||
      l.action.includes('UPDATED')
    ).length,
    error: logs.filter(l => 
      l.action.includes('ERROR') || 
      l.action.includes('FAIL') ||
      l.action.includes('LOGOUT')
    ).length,
    security: logs.filter(l => 
      l.action === 'USER_LOGIN' || 
      l.action === 'USER_LOGOUT' || 
      l.action.includes('SECURITY') ||
      l.action.includes('AUTH')
    ).length,
    uniqueUsers: [...new Set(logs.map(l => l.user?.name || l.user?.email).filter(Boolean))].length,
    actions: [...new Set(logs.map(l => l.action))].length
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-96 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Logs</h1>
          <p className="text-slate-600">Surveillez l'activité et les actions sur la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <SelectComponent value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Aujourd'hui</SelectItem>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </SelectComponent>
          <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <ScrollText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Logs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Succès</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.success}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Erreurs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.error}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueUsers}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Actions uniques</p>
                <p className="text-2xl font-bold text-slate-900">{stats.actions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Sécurité</p>
                <p className="text-2xl font-bold text-slate-900">{stats.security}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-modern-2025">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher par utilisateur, action ou ressource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <SelectComponent value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="login">Connexion</SelectItem>
                <SelectItem value="logout">Déconnexion</SelectItem>
                <SelectItem value="create">Création</SelectItem>
                <SelectItem value="update">Modification</SelectItem>
                <SelectItem value="delete">Suppression</SelectItem>
              </SelectContent>
            </SelectComponent>
            <SelectComponent value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {[...new Set(logs.map(l => l.user?.name || l.user?.email).filter(Boolean))].map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </SelectComponent>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <CardTitle className="flex items-center text-slate-900">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            Journal d'Audit
          </CardTitle>
          <CardDescription>
            {filteredLogs.length} entrée{filteredLogs.length !== 1 ? 's' : ''} trouvée{filteredLogs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            columns={columns}
            data={filteredLogs}
            pageSize={20}
            searchable={false}
            filterable={false}
            loading={loading}
            emptyMessage="Aucun log d'audit disponible"
          />
        </CardContent>
      </Card>

      {/* Modal for View Details */}
      {isModalOpen && selectedLog && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Détails du Log"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Date/Heure</label>
                <p className="text-slate-900">{new Date(selectedLog.timestamp).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Utilisateur</label>
                <p className="text-slate-900">{selectedLog.user}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Action</label>
                <p className="text-slate-900">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Ressource</label>
                <p className="text-slate-900">{selectedLog.resource}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Statut</label>
                <StatusBadge status={selectedLog.status} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">IP</label>
                <p className="text-slate-900">{selectedLog.ip}</p>
              </div>
            </div>
            {selectedLog.details && (
              <div>
                <label className="text-sm font-medium text-slate-600">Détails</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg text-sm">
                  {selectedLog.details}
                </p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
