'use client';

import React, { useState, useEffect } from 'react';
import { SupportAPI } from '@/lib/api';
import { UnifiedTable, StatusBadge, Modal } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  MessageSquare,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Send
} from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'title', header: 'Titre', sortable: true },
    { key: 'user', header: 'Utilisateur', sortable: true },
    { key: 'priority', header: 'Priorité', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'status', header: 'Statut', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'createdAt', header: 'Créé le', sortable: true, render: (value: string) => new Date(value).toLocaleDateString('fr-FR') },
    { key: 'actions', header: 'Actions', sortable: false }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await SupportAPI.getAllTickets();
      if (response.success && response.data) {
        setTickets(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleView = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await SupportAPI.updateTicketStatus(ticketId, newStatus);
      if (response.success) {
        fetchTickets();
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    try {
      const response = await SupportAPI.addMessage(selectedTicket.id, newMessage);
      if (response.success) {
        setNewMessage('');
        fetchTickets();
        // Refresh the selected ticket to show new message
        const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    high: tickets.filter(t => t.priority === 'high').length,
    today: tickets.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Support Client</h1>
          <p className="text-slate-600">Gérez les tickets de support et l'assistance client</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-4 w-4" />
            <span>Nouveau Ticket</span>
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
                  <LifeBuoy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tickets</p>
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
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Ouverts</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.open}</p>
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
                  <p className="text-sm font-medium text-slate-600">Résolus</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
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
                  <p className="text-sm font-medium text-slate-600">Urgents</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.urgent}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Urgent</p>
                <p className="text-2xl font-bold text-slate-900">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern-2025">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Élevée</p>
                <p className="text-2xl font-bold text-slate-900">{stats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  placeholder="Rechercher par ID, titre ou utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="open">Ouverts</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="closed">Fermés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
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
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            Tickets de Support
          </CardTitle>
          <CardDescription>
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} trouvé{filteredTickets.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedTable
            columns={columns}
            data={filteredTickets}
            pageSize={10}
            onEdit={handleEdit}
            onView={handleView}
          />
        </CardContent>
      </Card>

      {/* Modal for View/Edit Ticket */}
      {isModalOpen && selectedTicket && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Ticket #${selectedTicket.id} - ${selectedTicket.title}`}
        >
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Utilisateur</label>
                <p className="text-slate-900">{selectedTicket.user}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Priorité</label>
                <StatusBadge status={selectedTicket.priority} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Statut</label>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Créé le</label>
                <p className="text-slate-900">{new Date(selectedTicket.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-600">Description</label>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg text-sm mt-1">
                {selectedTicket.description}
              </p>
            </div>

            {/* Messages */}
            <div>
              <label className="text-sm font-medium text-slate-600">Messages</label>
              <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                {selectedTicket.messages?.map((message: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-slate-900">{message.author}</span>
                        <span className="text-xs text-slate-500">{new Date(message.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-slate-700 text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Message */}
            <div>
              <label className="text-sm font-medium text-slate-600">Ajouter un message</label>
              <div className="flex space-x-2 mt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Button onClick={handleSendMessage} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                  disabled={selectedTicket.status === 'in_progress'}
                >
                  Marquer en cours
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  disabled={selectedTicket.status === 'resolved'}
                >
                  Marquer résolu
                </Button>
              </div>
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
