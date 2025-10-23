'use client';

// Status mappings
export const STATUS_MAP = {
  // Announcement statuses
  ANNOUNCEMENT: {
    'AVAILABLE': { label: 'Disponible', color: 'green', variant: 'success' },
    'RESERVED': { label: 'Réservé', color: 'blue', variant: 'info' },
    'EXPIRED': { label: 'Expiré', color: 'gray', variant: 'secondary' },
    'RETURN_PENDING': { label: 'Retour en attente', color: 'yellow', variant: 'warning' },
    'RETURN_ACCEPTED': { label: 'Retour accepté', color: 'green', variant: 'success' },
    'RETURN_REFUSED': { label: 'Retour refusé', color: 'red', variant: 'destructive' },
  },
  
  // Request statuses
  REQUEST: {
    'OPEN': { label: 'Ouvert', color: 'green', variant: 'success' },
    'ACCEPTED': { label: 'Accepté', color: 'blue', variant: 'info' },
    'CLOSED': { label: 'Fermé', color: 'gray', variant: 'secondary' },
    'EXPIRED': { label: 'Expiré', color: 'red', variant: 'destructive' },
  },
  
  // Interest statuses
  INTEREST: {
    'PENDING': { label: 'En attente', color: 'yellow', variant: 'warning' },
    'ACCEPTED': { label: 'Accepté', color: 'green', variant: 'success' },
    'REFUSED': { label: 'Refusé', color: 'red', variant: 'destructive' },
  },
  
  // Request response statuses
  REQUEST_RESPONSE: {
    'PENDING': { label: 'En attente', color: 'yellow', variant: 'warning' },
    'ACCEPTED': { label: 'Accepté', color: 'green', variant: 'success' },
    'REFUSED': { label: 'Refusé', color: 'red', variant: 'destructive' },
  },
  
  // Support ticket statuses
  SUPPORT: {
    'OPEN': { label: 'Ouvert', color: 'green', variant: 'success' },
    'IN_PROGRESS': { label: 'En cours', color: 'blue', variant: 'info' },
    'RESOLVED': { label: 'Résolu', color: 'gray', variant: 'secondary' },
  },
  
  // User statuses
  USER: {
    'ACTIVE': { label: 'Actif', color: 'green', variant: 'success' },
    'INACTIVE': { label: 'Inactif', color: 'red', variant: 'destructive' },
  },
} as const;

// Request scope options
export const REQUEST_SCOPE_OPTIONS = [
  { value: 'CITY', label: 'Ville spécifique', description: 'Visible aux pharmacies de la même ville' },
  { value: 'REGION', label: 'Région', description: 'Visible aux pharmacies de la même région' },
  { value: 'ALL_TUNISIA', label: 'Toute la Tunisie', description: 'Visible à toutes les pharmacies' },
] as const;

// Region options (will be fetched from backend)
export const REGIONS = [
  { value: 'TUNIS', label: 'Tunis' },
  { value: 'ARIANA', label: 'Ariana' },
  { value: 'BEN_AROUS', label: 'Ben Arous' },
  { value: 'MANOUBA', label: 'Manouba' },
  { value: 'NABEUL', label: 'Nabeul' },
  { value: 'ZAGHOUAN', label: 'Zaghouan' },
  { value: 'BIZERTE', label: 'Bizerte' },
  { value: 'BEJA', label: 'Béja' },
  { value: 'JENDOUBA', label: 'Jendouba' },
  { value: 'KEF', label: 'Le Kef' },
  { value: 'SILIANA', label: 'Siliana' },
  { value: 'SOUSSE', label: 'Sousse' },
  { value: 'MONASTIR', label: 'Monastir' },
  { value: 'MAHDIA', label: 'Mahdia' },
  { value: 'SFAX', label: 'Sfax' },
  { value: 'KAIROUAN', label: 'Kairouan' },
  { value: 'KASSERINE', label: 'Kasserine' },
  { value: 'SIDI_BOUZID', label: 'Sidi Bouzid' },
  { value: 'GABES', label: 'Gabès' },
  { value: 'MEDENINE', label: 'Médenine' },
  { value: 'TATAOUINE', label: 'Tataouine' },
  { value: 'GAFSA', label: 'Gafsa' },
  { value: 'TOZEUR', label: 'Tozeur' },
  { value: 'KEBILI', label: 'Kébili' },
] as const;

// Expiry times (in milliseconds)
export const EXPIRY_TIMES = {
  CITY: 24 * 60 * 60 * 1000, // 24 hours
  REGION: 24 * 60 * 60 * 1000, // 24 hours
  ALL_TUNISIA: 48 * 60 * 60 * 1000, // 48 hours
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INTEREST: { label: 'Intérêt', icon: 'Heart', color: 'pink' },
  REQUEST: { label: 'Demande', icon: 'FileText', color: 'blue' },
  SUBSCRIPTION: { label: 'Abonnement', icon: 'CreditCard', color: 'purple' },
  SYSTEM: { label: 'Système', icon: 'Settings', color: 'gray' },
  RETOUR: { label: 'Retour', icon: 'RotateCcw', color: 'orange' },
} as const;

// Priority levels
export const PRIORITIES = {
  LOW: { label: 'Faible', color: 'green', value: 'low' },
  MEDIUM: { label: 'Moyenne', color: 'yellow', value: 'medium' },
  HIGH: { label: 'Élevée', color: 'red', value: 'high' },
} as const;

// Support categories
export const SUPPORT_CATEGORIES = {
  TECHNICAL: { label: 'Technique', value: 'technical' },
  ACCOUNT: { label: 'Compte', value: 'account' },
  BILLING: { label: 'Facturation', value: 'billing' },
  OTHER: { label: 'Autre', value: 'other' },
} as const;

// Pagination options
export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 par page' },
  { value: 25, label: '25 par page' },
  { value: 50, label: '50 par page' },
  { value: 100, label: '100 par page' },
] as const;

// Default pagination
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ANNOUNCEMENTS: '/announcements',
  REQUESTS: '/requests',
  INTERESTS: '/interests',
  NOTIFICATIONS: '/notifications',
  SUPPORT: '/support',
  AUTH: '/auth',
  ANALYTICS: '/analytics',
  EXPORT: '/export',
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

// Toast durations
export const TOAST_DURATIONS = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// Search debounce delay
export const SEARCH_DEBOUNCE_DELAY = 300;

// Auto-save delay
export const AUTO_SAVE_DELAY = 2000;

// Cache TTL
export const CACHE_TTL = 60 * 1000; // 1 minute

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry attempts
export const MAX_RETRY_ATTEMPTS = 3;

// Retry delay
export const RETRY_DELAY = 1000; // 1 second
