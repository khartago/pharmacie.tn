'use client';

import React, { useState, useEffect } from 'react';
import { MedicinesAPI, ExportAPI } from '@/lib/api';
import { UnifiedTable, Modal } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Search, 
  Filter, 
  Download, 
  Activity,
  CheckCircle,
  Package,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminMedicamentsPage() {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [laboratoireFilter, setLaboratoireFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<any>(null);

  const columns = [
    { key: 'dci', header: 'DCI', sortable: true },
    { key: 'brandName', header: 'Nom Commercial', sortable: true },
    { key: 'dosage', header: 'Dosage', sortable: true },
    { key: 'form', header: 'Forme', sortable: true },
    { key: 'laboratoire', header: 'Laboratoire', sortable: true },
    { key: 'atcCode', header: 'Code ATC', sortable: true }
  ];

  useEffect(() => {
    fetchMedicaments();
    fetchImportStats();
  }, []);

  const fetchMedicaments = async () => {
    try {
      // Fetch all medicines without pagination
      const response = await MedicinesAPI.getAll({ limit: 10000 });
      if (response.success && response.data) {
        setMedicaments(response.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch medicaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImportStats = async () => {
    try {
      const response = await MedicinesAPI.getStats();
      if (response.success && response.data) {
        setImportStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch import stats:', error);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await MedicinesAPI.import(formData);
      if (response.success) {
        // Refresh the medicaments list
        await fetchMedicaments();
        // Refresh import stats
        await fetchImportStats();
        // Close modal and reset file
        setIsImportModalOpen(false);
        setImportFile(null);
        alert(`Import réussi ! ${response.data?.total || 0} médicaments importés.`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Erreur lors de l\'import. Veuillez réessayer.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      const validExtensions = ['.xls', '.xlsx'];
      
      const isValidType = validTypes.includes(file.type) || 
                         validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        alert('Veuillez sélectionner un fichier Excel (.xls ou .xlsx)');
        return;
      }
      
      setImportFile(file);
    }
  };


  const handleExport = async () => {
    try {
      const response = await ExportAPI.exportMedicines();
      if (response.success) {
        // Handle download
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medicaments.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredMedicaments = medicaments.filter(medicament => {
    const matchesSearch = medicament.dci?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             medicament.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             medicament.laboratoire?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLaboratoire = laboratoireFilter === 'all' || medicament.laboratoire === laboratoireFilter;
    const matchesForm = formFilter === 'all' || medicament.form === formFilter;
    return matchesSearch && matchesLaboratoire && matchesForm;
  });

  const stats = {
    total: medicaments.length,
    laboratoires: [...new Set(medicaments.map(m => m.laboratoire).filter(lab => lab && lab.trim() !== ''))].length,
    forms: [...new Set(medicaments.map(m => m.form).filter(form => form && form.trim() !== ''))].length,
    withAtcCode: medicaments.filter(m => m.atcCode && m.atcCode.trim() !== '').length,
    uniqueDci: [...new Set(medicaments.map(m => m.dci).filter(dci => dci && dci.trim() !== ''))].length
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Médicaments</h1>
          <p className="text-slate-600">Gérez la base de données des médicaments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button 
            onClick={() => setIsImportModalOpen(true)} 
            variant="outline" 
            className="flex items-center space-x-2 hover:bg-slate-50 transition-colors duration-200"
          >
            <Upload className="h-4 w-4" />
            <span>Importer</span>
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
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Médicaments</p>
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
                  <p className="text-sm font-medium text-slate-600">Laboratoires</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.laboratoires}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Formes</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.forms}</p>
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
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">DCI Uniques</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueDci}</p>
                </div>
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
                  placeholder="Rechercher par DCI, nom commercial ou laboratoire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Select value={laboratoireFilter} onValueChange={setLaboratoireFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Laboratoire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {[...new Set(medicaments.map(m => m.laboratoire).filter(lab => lab && lab.trim() !== ''))].map(lab => (
                  <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formFilter} onValueChange={setFormFilter}>
              <SelectTrigger className="w-40">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Forme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {[...new Set(medicaments.map(m => m.form).filter(form => form && form.trim() !== ''))].map(form => (
                  <SelectItem key={form} value={form}>{form}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-modern-2025">
        <CardHeader className="enhanced-card-header">
          <CardTitle className="flex items-center text-slate-900">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Liste des Médicaments
          </CardTitle>
          <CardDescription>
            {filteredMedicaments.length} médicament{filteredMedicaments.length !== 1 ? 's' : ''} trouvé{filteredMedicaments.length !== 1 ? 's' : ''} • Liste nationale des médicaments (AMM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            columns={columns}
            data={filteredMedicaments}
            pageSize={50}
            searchable={false}
            filterable={false}
          />
        </CardContent>
      </Card>


      {/* Import Modal - Refactored */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Importer la liste AMM"
          size="md"
        >
          <div className="space-y-6">
            {/* Current Status - Simplified */}
            {importStats && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800">Base de données actuelle</h4>
                    <p className="text-sm text-blue-600">
                      {importStats.totalMedicines.toLocaleString('fr-FR')} médicaments
                      {importStats.lastImport && (
                        <span className="ml-2">
                          • Dernière mise à jour: {new Date(importStats.lastImport.importedAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload - Cleaner */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionner un fichier Excel</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Formats supportés: .xls, .xlsx (max 10MB)
                </p>
                
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir un fichier
                </label>
              </div>

              {importFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 truncate">{importFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(importFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Warning - Simplified */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-xs">⚠</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Important</h4>
                  <p className="text-sm text-amber-700">
                    L'import remplacera complètement la base de données actuelle. 
                    Assurez-vous que le fichier contient toutes les données nécessaires.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFile(null);
                }}
                disabled={importing}
                className="px-6"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!importFile || importing}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {importing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Import en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Importer</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
