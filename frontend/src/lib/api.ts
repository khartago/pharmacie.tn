export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pharmacie-tn.onrender.com/api';

// Debug logging for API URL
if (typeof window !== 'undefined') {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
}

// Base types from backend schema
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  role: {
    id: number;
    name: 'ADMIN' | 'PHARMACY' | 'SUPPLIER';
  };
  city?: {
    id: number;
    name: string;
    region: Region;
  };
  companyName?: string;
  subscriptionType?: string;
}

export type Region = 
  | 'TUNIS' | 'ARIANA' | 'BEN_AROUS' | 'MANOUBA' | 'NABEUL' | 'ZAGHOUAN' 
  | 'BIZERTE' | 'BEJA' | 'JENDOUBA' | 'KEF' | 'SILIANA' | 'SOUSSE' 
  | 'MONASTIR' | 'MAHDIA' | 'SFAX' | 'KAIROUAN' | 'KASSERINE' | 'SIDI_BOUZID' 
  | 'GABES' | 'MEDENINE' | 'TATAOUINE' | 'GAFSA' | 'TOZEUR' | 'KEBILI';

export interface Medicine {
  id: number;
  dci: string;
  brandName: string;
  dosage: string;
  form: string;
  laboratoire: string;
  atcCode?: string;
}

export type AnnouncementStatus = 'AVAILABLE' | 'RESERVED' | 'EXPIRED' | 'RETURN_PENDING' | 'RETURN_ACCEPTED' | 'RETURN_REFUSED';
export type RequestStatus = 'OPEN' | 'ACCEPTED' | 'CLOSED' | 'EXPIRED';
export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED';
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type RequestResponseStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED';
export type NotificationType = 'INTEREST' | 'REQUEST' | 'SUBSCRIPTION' | 'SYSTEM' | 'RETOUR';

// Request/Response interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Announcement types
export interface Announcement {
  id: number;
  medicine: Medicine;
  quantity: number;
  expiryDate: string;
  status: AnnouncementStatus;
  user: {
    name: string;
    city: {
      name: string;
      regionName: string;
    };
  };
  createdAt: string;
}

export interface CreateAnnouncementData {
  medicineId: number;
  quantity: number;
  expiryDate: string;
}

export interface UpdateAnnouncementData {
  quantity?: number;
  expiryDate?: string;
}

// Request types
export interface Request {
  id: number;
  medicine: Medicine;
  quantity: number;
  status: RequestStatus;
  user: {
    name: string;
    city: {
      name: string;
      regionName: string;
    };
  };
  createdAt: string;
}

export interface RequestResponse {
  id: number;
  requestId: number;
  pharmacyUserId: string;
  status: RequestResponseStatus;
  createdAt: string;
  updatedAt: string;
  pharmacyUser: User;
  request: Request;
}

export interface CreateRequestData {
  medicineId: number;
  quantity: number;
}

export interface UpdateRequestData {
  quantity?: number;
}

// Interest types
export interface Interest {
  id: number;
  announcementId: number;
  status: InterestStatus;
  announcement: {
    id: number;
    medicine: Medicine;
    quantity: number;
    expiryDate: string;
    pharmacy: {
      name: string;
      region: string;
      phone: string;
    };
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterestResponse {
  data: Interest[];
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// Support types
export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface CreateSupportTicketData {
  title: string;
  description: string;
  priority?: string;
  category?: string;
}

export interface UpdateSupportTicketData {
  title?: string;
  description?: string;
  priority?: string;
  category?: string;
  status?: SupportTicketStatus;
}

export interface ReplyToTicketData {
  replyMessage: string;
}

// Retour types
export interface Retour {
  id: number;
  title: string;
  description: string;
  medicineName: string;
  quantity: number;
  expiryDate: string;
  status: string;
  pharmacyName: string;
  pharmacyRegion: string;
  createdAt: string;
}

export interface CreateRetourData {
  title: string;
  description: string;
  medicineName: string;
  quantity: number;
  expiryDate: string;
}

// Analytics types
export interface AnalyticsOverview {
  totalPharmacies: number;
  totalSuppliers: number;
  activeAnnouncements: number;
  openRequests: number;
  todayAnnouncements: number;
  todayRequests: number;
  totalMedicines: number;
}

export interface DashboardStatsWithGrowth extends AnalyticsOverview {
  userGrowth: number;
  announcementGrowth: number;
  requestGrowth: number;
  conversionGrowth: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  specialty?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
}

export interface TopMedicine {
  id: number;
  dci: string;
  brandName: string;
  laboratoire: string;
  requestCount: number;
}

export interface RegionStats {
  regionName: string;
  requestCount: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface ActivityData {
  date: string;
  announcements: number;
  requests: number;
  retours: number;
  total: number;
}

export interface ActivePharmacy {
  id: string;
  name: string;
  email: string;
  cityName: string;
  regionName: string;
  announcementsCount: number;
  requestsCount: number;
  lastLoginAt: string;
}

export interface ActiveSupplier {
  id: string;
  name: string;
  email: string;
  cityName: string;
  regionName: string;
  announcementsCount: number;
  retoursCount: number;
  lastLoginAt: string;
}

export interface ImportHistory {
  id: number;
  filename: string;
  importedCount: number;
  status: string;
  createdAt: string;
}

// Audit types
export interface AuditLog {
  id: number;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// Admin types
export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'PHARMACY' | 'SUPPLIER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreateAccountData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cityName?: string;
  regionName?: string;
  role: 'ADMIN' | 'PHARMACY' | 'SUPPLIER';
}

export interface CreateAccountData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cityName?: string;
  regionName?: string;
  role: 'ADMIN' | 'PHARMACY' | 'SUPPLIER';
}

export interface UpdateAccountData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityName?: string;
  regionName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Pharmacy types
export interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreatePharmacyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
}

export interface UpdatePharmacyData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Utility function for API requests
const fetcher = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config: RequestInit = {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Only set Content-Type for JSON requests
  if (!(options.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        const message = data.error || 'Trop de requêtes. Veuillez patienter un moment.';
        throw new Error(message);
      }
      
      throw new Error(data.error || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const AuthAPI = {
  login: (credentials: LoginCredentials) => 
    fetcher<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  forgotPassword: (data: ForgotPasswordData) => 
    fetcher('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (token: string, password: string) => 
    fetcher('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  getCurrentUser: () => 
    fetcher<User>('/auth/me'),

  // Profile management methods
  getProfile: () => 
    fetcher<User>('/auth/me'),

  updateProfile: (data: Partial<User>) => 
    fetcher<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

};

// Contact API
export const ContactAPI = {
  submitForm: (data: ContactFormData) => 
    fetcher('/support/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Announcements API
export const AnnouncementsAPI = {
  getAll: (params?: PaginationParams & { status?: string; excludeMine?: boolean; userOnly?: boolean; visibleToSupplier?: boolean; excludeInterested?: boolean }) => 
    fetcher<PaginatedResponse<Announcement>>(`/announcements?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<Announcement>(`/announcements/${id}`),

  create: (data: CreateAnnouncementData) => 
    fetcher<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateAnnouncementData & { status?: string }) => 
    fetcher<Partial<Announcement>>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => 
    fetcher(`/announcements/${id}`, {
      method: 'DELETE',
    }),

  expressInterest: (id: string) => 
    fetcher<{ id: number; announcementId: number; status: InterestStatus; createdAt: string }>(`/announcements/${id}/interest`, {
      method: 'POST',
    }),

  interest: (id: string) => 
    fetcher<{ id: number; announcementId: number; status: InterestStatus; createdAt: string }>(`/announcements/${id}/interest`, {
      method: 'POST',
    }),

  getMyInterests: (params?: PaginationParams) => 
    fetcher<{ data: Interest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/announcements/my-interests?${new URLSearchParams(params as Record<string, string>)}`),

  cancelInterest: (interestId: string) => 
    fetcher(`/announcements/interests/${interestId}`, {
      method: 'DELETE',
    }),

  updateInterestStatus: (announcementId: string, interestId: string, status: 'ACCEPTED' | 'REFUSED') =>
    fetcher(`/announcements/${announcementId}/interests/${interestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Interest management methods
  acceptInterest: (announcementId: string, interestId: string) =>
    fetcher(`/announcements/${announcementId}/interests/${interestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'ACCEPTED' }),
    }),

  refuseInterest: (announcementId: string, interestId: string) =>
    fetcher(`/announcements/${announcementId}/interests/${interestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'REFUSED' }),
    }),

  // Supplier direct acceptance (for retours)
  supplierAccept: (id: string) => 
    fetcher(`/announcements/${id}/supplier-accept`, { 
      method: 'POST' 
    }),

  // Direct retour management for suppliers
  acceptRetour: (id: string) =>
    fetcher(`/announcements/${id}/accept-retour`, {
      method: 'POST',
    }),

  getArchived: (params?: PaginationParams) => 
    fetcher<PaginatedResponse<Announcement>>(`/archive/announcements?${new URLSearchParams(params as Record<string, string>)}`),

  // New dual status workflow methods
  markAsSold: (id: string) => 
    fetcher(`/announcements/${id}/sold`, { method: 'POST' }),
  
  refuseRetour: (id: string, reason?: string) => 
    fetcher(`/announcements/${id}/retour-refuse`, { 
      method: 'POST', 
      body: JSON.stringify({ reason }) 
    }),
  
  markRetourDone: (id: string) => 
    fetcher(`/announcements/${id}/retour-done`, { method: 'POST' }),
  
  renewAnnouncement: (id: string) => 
    fetcher(`/archive/announcements/${id}/renew`, { method: 'POST' }),

  restore: (id: string) => 
    fetcher(`/archive/announcements/${id}/restore`, {
      method: 'POST',
    }),
};

// Requests API
export const RequestsAPI = {
  getAll: (params?: PaginationParams & { status?: string; statusIn?: string; excludeMine?: boolean; userOnly?: boolean; hasResponse?: boolean; archives?: string | boolean }) => 
    fetcher<PaginatedResponse<Request>>(`/requests?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<Request>(`/requests/${id}`),

  create: (data: CreateRequestData) => 
    fetcher<Request>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateRequestData & { status?: string }) => 
    fetcher<Partial<Request>>(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => 
    fetcher(`/requests/${id}`, {
      method: 'DELETE',
    }),

  respond: (id: string, data: { message: string }) => 
    fetcher<{ id: number; requestId: number; status: string; createdAt: string }>(`/requests/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResponseStatus: (requestId: string, responseId: string, status: 'ACCEPTED' | 'REFUSED') =>
    fetcher(`/requests/${requestId}/responses/${responseId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getMyResponses: (params?: PaginationParams & { status?: string }) => 
    fetcher<PaginatedResponse<RequestResponse>>(`/requests/my-responses?${new URLSearchParams(params as Record<string, string>)}`),

  markAsCompleted: (id: string) => 
    fetcher<Request>(`/requests/${id}/complete`, {
      method: 'POST',
    }),
};


// Pharmacies API
export const PharmaciesAPI = {
  getAll: (params?: PaginationParams & { status?: string }) => 
    fetcher<PaginatedResponse<Pharmacy>>(`/pharmacies?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<Pharmacy>(`/pharmacies/${id}`),

  create: (data: CreatePharmacyData) => 
    fetcher<Pharmacy>('/pharmacies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePharmacyData) => 
    fetcher<Partial<Pharmacy>>(`/pharmacies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, isActive: boolean) => 
    fetcher(`/pharmacies/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    }),

  createSubscription: (id: string, data: { startDate: string; endDate: string; status: string }) => 
    fetcher(`/pharmacies/${id}/subscription`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSubscription: (id: string, subId: number, data: { endDate?: string; status?: string }) => 
    fetcher(`/pharmacies/${id}/subscription/${subId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => 
    fetcher(`/admin/accounts/${id}`, {
      method: 'DELETE',
    }),
};

// Medicines API
export const MedicinesAPI = {
  search: (params?: { query?: string; dci?: string; brandName?: string; laboratoire?: string }) => 
    fetcher<PaginatedResponse<Medicine>>(`/medicines/search?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<Medicine>(`/medicines/${id}`),

  getAll: (params?: PaginationParams) => 
    fetcher<PaginatedResponse<Medicine>>(`/admin/medicines?${new URLSearchParams(params as Record<string, string>)}`),

  import: (formData: FormData) => 
    fetcher<{ total: number; importedAt: string }>('/admin/medicines/import', {
      method: 'POST',
      body: formData,
    }),

  getLastImport: () => 
    fetcher<{ filename: string; importedCount: number; importedAt: string } | null>('/admin/medicines/last-import'),

  getStats: () => 
    fetcher<{ totalMedicines: number; lastImport: { filename: string; importedCount: number; importedAt: string } | null }>('/admin/medicines/stats'),
};

// Notifications API
export const NotificationsAPI = {
  getAll: (params?: PaginationParams & { read?: boolean; unreadOnly?: boolean; type?: string; search?: string }) => 
    fetcher<PaginatedResponse<Notification> & { unreadCount: number }>(`/notifications?${new URLSearchParams(params as Record<string, string>)}`),

  markAsRead: (id: string) => 
    fetcher(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () => 
    fetcher<{ updatedCount: number }>('/notifications/read-all', {
      method: 'PUT',
    }),

  getUnreadCount: () => 
    fetcher<{ unreadCount: number }>('/notifications/unread-count'),

  getStats: () => 
    fetcher<{ unreadCount: number; totalCount: number }>('/notifications/stats'),

  delete: (id: string) => 
    fetcher(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// Support API
export const SupportAPI = {
  getAll: (params?: PaginationParams & { status?: string; archived?: boolean }) => 
    fetcher<PaginatedResponse<SupportTicket>>(`/support?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<SupportTicket>(`/support/${id}`),

  create: (data: CreateSupportTicketData) => 
    fetcher<SupportTicket>('/support', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSupportTicketData) => 
    fetcher<Partial<SupportTicket>>(`/support/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => 
    fetcher(`/support/${id}`, {
      method: 'DELETE',
    }),

  reply: (id: string, data: ReplyToTicketData) => 
    fetcher<{ id: number; replyMessage: string; createdAt: string }>(`/support/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  archive: (id: string) => 
    fetcher(`/support/${id}/archive`, {
      method: 'POST',
    }),

  unarchive: (id: string) => 
    fetcher(`/support/${id}/unarchive`, {
      method: 'POST',
    }),
};

// Accounts API
export const AccountsAPI = {
  getAll: (params?: PaginationParams & { role?: string; status?: string }) => 
    fetcher<PaginatedResponse<AdminAccount>>(`/admin/accounts?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<AdminAccount>(`/admin/accounts/${id}`),

  update: (id: string, data: UpdateAccountData) => 
    fetcher<Partial<AdminAccount>>(`/admin/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  create: (data: CreateAccountData) => 
    fetcher<AdminAccount>('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, isActive: boolean) => 
    fetcher(`/admin/accounts/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: isActive ? 'active' : 'inactive' }),
    }),

  delete: (id: string) => 
    fetcher(`/admin/accounts/${id}`, {
      method: 'DELETE',
    }),

  activate: (id: string) => 
    fetcher(`/admin/accounts/${id}/activate`, {
      method: 'POST',
    }),

  deactivate: (id: string) => 
    fetcher(`/admin/accounts/${id}/deactivate`, {
      method: 'POST',
    }),

  resetPassword: (id: string) => 
    fetcher(`/admin/accounts/${id}/reset-password`, {
      method: 'POST',
    }),
};

// Suppliers API
export const FournisseursAPI = {
  getAll: (params?: PaginationParams & { status?: string }) => 
    fetcher<PaginatedResponse<Supplier>>(`/admin/suppliers?${new URLSearchParams(params as Record<string, string>)}`),

  create: (data: CreateAccountData) => 
    fetcher<Supplier>('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'SUPPLIER' }),
    }),

  update: (id: string, data: UpdateAccountData) => 
    fetcher<Partial<Supplier>>(`/admin/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, isActive: boolean) => 
    fetcher(`/admin/accounts/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: isActive ? 'active' : 'inactive' }),
    }),

  delete: (id: string) => 
    fetcher(`/admin/accounts/${id}`, {
      method: 'DELETE',
    }),
};

// Analytics API
export const AnalyticsAPI = {
  getOverview: (period?: string) => 
    fetcher<AnalyticsOverview>(`/analytics/overview?period=${period || '30'}`),

  getTopMedicines: (period?: string) => 
    fetcher<TopMedicine[]>(`/analytics/top-medicines?period=${period || '30'}`),

  getRequestsByRegion: (period?: string) => 
    fetcher<RegionStats[]>(`/analytics/requests-by-region?period=${period || '30'}`),

  getAnnouncementsTrend: (period?: string) => 
    fetcher<TrendData[]>(`/analytics/announcements-trend?period=${period || '30'}`),

  getActivePharmacies: (period?: string) => 
    fetcher<ActivePharmacy[]>(`/analytics/active-pharmacies?period=${period || '30'}`),

  getActiveSuppliers: (period?: string) => 
    fetcher<ActiveSupplier[]>(`/analytics/active-suppliers?period=${period || '30'}`),

  getActivityTimeline: (period?: string) => 
    fetcher<ActivityData[]>(`/analytics/activity?period=${period || '30'}`),

  // User-specific analytics
  getMyStats: () => 
    fetcher<{ 
      activeAnnouncements: number; 
      openRequests: number; 
      pendingInterests: number; 
      unreadNotifications: number;
      acceptedInterests?: number;
      availableAnnouncements?: number;
    }>('/analytics/my-stats'),

  getActivity: (period?: string) => 
    fetcher<ActivityData[]>(`/analytics/activity?period=${period || '30'}`),

  // Dashboard-specific analytics
  getDashboardStats: (period?: string) => 
    fetcher<DashboardStatsWithGrowth>(`/analytics/dashboard-stats?period=${period || '30'}`),

  // Admin-specific analytics
  getAnnouncementsStats: () => 
    fetcher<{ total: number; active: number; pending: number; urgent: number; requests: number; openRequests: number }>('/analytics/announcements/stats'),

  getRequestsStats: () => 
    fetcher<{ total: number; open: number; closed: number; accepted: number; expired: number }>('/analytics/requests/stats'),

  getPharmaciesStats: () => 
    fetcher<{ total: number; active: number; inactive: number; new: number }>('/analytics/pharmacies/stats'),

  getSuppliersStats: () => 
    fetcher<{ total: number; active: number; inactive: number; new: number }>('/analytics/suppliers/stats'),

  getAccountsStats: () => 
    fetcher<{ total: number; active: number; inactive: number; new: number; byRole: Record<string, number> }>('/analytics/accounts/stats'),
};

// Export API
export const ExportAPI = {
  exportPharmacies: () => 
    fetcher('/export/pharmacies'),

  exportSuppliers: () => 
    fetcher('/export/suppliers'),

  exportAccounts: () => 
    fetcher('/export/accounts'),

  exportMedicines: () => 
    fetcher('/export/medicines'),

  exportAnnouncements: () => 
    fetcher('/export/announcements'),

  exportRequests: () => 
    fetcher('/export/requests'),

  exportSupportTickets: () => 
    fetcher('/export/support-tickets'),

  exportAuditLogs: () => 
    fetcher('/export/audit-logs'),

  exportAnalytics: () => 
    fetcher('/export/analytics'),

  exportHealth: () => 
    fetcher('/export/health'),

  exportRetourPDF: (retourId: string) => 
    fetcher(`/export/retour/${retourId}/pdf`),

  exportInterests: () => 
    fetcher('/export/interests'),

  exportRetours: () => 
    fetcher('/export/retours'),
};

// Archive API
export const ArchiveAPI = {
  archiveAnnouncements: () => 
    fetcher('/archive/announcements', {
      method: 'POST',
    }),

  archiveRequests: () => 
    fetcher('/archive/requests', {
      method: 'POST',
    }),

  archiveRetours: () => 
    fetcher('/archive/retours', {
      method: 'POST',
    }),
};

// Health API
export const HealthAPI = {
  getStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return {
        success: response.ok && data.status === 'OK',
        data: data
      };
    } catch {
      return { success: false, error: 'Failed to fetch API status' };
    }
  },
    
  getDatabaseStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/db`);
      const data = await response.json();
      return {
        success: response.ok && data.status === 'OK',
        data: data
      };
    } catch {
      return { success: false, error: 'Failed to fetch database status' };
    }
  },
    
  getAppStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/app`);
      const data = await response.json();
      return {
        success: response.ok && data.status === 'OK',
        data: data
      };
    } catch {
      return { success: false, error: 'Failed to fetch app status' };
    }
  },
    
  getEmailStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/email`);
      const data = await response.json();
      return {
        success: response.ok && data.status === 'OK',
        data: data
      };
    } catch {
      return { success: false, error: 'Failed to fetch email status' };
    }
  },
    
  getQueueStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/queue`);
      const data = await response.json();
      return {
        success: response.ok && data.status === 'OK',
        data: data
      };
    } catch {
      return { success: false, error: 'Failed to fetch queue status' };
    }
  },

  getSystemHealth: async () => {
    try {
      const [apiStatus, dbStatus, appStatus, emailStatus, queueStatus, metrics] = await Promise.all([
        HealthAPI.getStatus(),
        HealthAPI.getDatabaseStatus(),
        HealthAPI.getAppStatus(),
        HealthAPI.getEmailStatus(),
        HealthAPI.getQueueStatus(),
        fetcher('/health/metrics')
      ]);

      const overallStatus = apiStatus.success && dbStatus.success && appStatus.success ? 'healthy' : 'error';
      
      return {
        success: true,
        data: {
          status: overallStatus,
          cpu: (metrics as any)?.data?.cpu || { usage: 0 },
          memory: (metrics as any)?.data?.memory || { usage: 0 },
          database: (metrics as any)?.data?.database || { connections: 0, latency: 0 },
          network: (metrics as any)?.data?.network || { latency: 0 },
          uptime: (metrics as any)?.data?.uptime || '0j 0h 0m',
          services: {
            api: apiStatus,
            database: dbStatus,
            app: appStatus,
            email: emailStatus,
            queue: queueStatus
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch {
      return { 
        success: false, 
        error: 'Failed to fetch system health',
        data: {
          status: 'error',
          services: {},
          timestamp: new Date().toISOString()
        }
      };
    }
  },
};

// Audit Logs API
export const AuditLogsAPI = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    action?: string; 
    userId?: string; 
    startDate?: string; 
    endDate?: string; 
    entityType?: string; 
    entityId?: string; 
  }) => 
    fetcher<PaginatedResponse<AuditLog>>(`/audit?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<AuditLog>(`/audit/${id}`),

  getStats: (period?: string) => 
    fetcher(`/audit/stats/overview?period=${period || '30'}`),

  getAvailableFilters: () => 
    fetcher('/audit/filters/available'),
};

// Cities API
export interface City {
  id: string;
  name: string;
  region: string;
  userCount: number;
  createdAt: string;
}

export interface CityStats {
  total: number;
  byRegion: Record<string, number>;
  mostUsed: { name: string; count: number };
  recentlyAdded: number;
}

// Public Cities API (for regular users)
export const CitiesAPI = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    region?: string; 
    search?: string; 
  }) => 
    fetcher<PaginatedResponse<City>>(`/cities?${new URLSearchParams(params as Record<string, string>)}`),

  getByRegion: (region: string) => 
    fetcher<City[]>(`/cities/region/${region}`),
};

// Admin Cities API (for admin users only)
export const AdminCitiesAPI = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    region?: string; 
    search?: string; 
  }) => 
    fetcher<PaginatedResponse<City>>(`/admin/cities?${new URLSearchParams(params as Record<string, string>)}`),

  getById: (id: string) => 
    fetcher<City>(`/admin/cities/${id}`),

  create: (data: { name: string; region: string }) => 
    fetcher<City>('/admin/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name: string; region: string }) => 
    fetcher<City>(`/admin/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => 
    fetcher(`/admin/cities/${id}`, {
      method: 'DELETE',
    }),

  getStats: () => 
    fetcher<CityStats>('/admin/cities/stats'),
};

// Legacy API service for backward compatibility
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return fetcher<T>(endpoint, options);
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    return AuthAPI.login(credentials);
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    return AuthAPI.forgotPassword(data);
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return AuthAPI.resetPassword(token, password);
  }

  // Contact form
  async submitContactForm(data: ContactFormData): Promise<ApiResponse> {
    return ContactAPI.submitForm(data);
  }

  // Get current user (if authenticated)
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return AuthAPI.getCurrentUser();
  }
}

export const apiService = new ApiService();

// API Aliases for backward compatibility
export const ComptesAPI = AccountsAPI;
export const MedicamentsAPI = MedicinesAPI;
export const AnnoncesAPI = AnnouncementsAPI;
export const AuditAPI = {
  getLogs: AuditLogsAPI.getAll,
  getById: AuditLogsAPI.getById,
  getStats: AuditLogsAPI.getStats,
  getAvailableFilters: AuditLogsAPI.getAvailableFilters
}; 
