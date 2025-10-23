/**
 * Application constants
 */

export const TUNISIA_REGIONS = [
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Kef',
  'Mahdia',
  'Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan'
] as const;

export type TunisiaRegion = typeof TUNISIA_REGIONS[number];

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PHARMACY: 'PHARMACY',
  SUPPLIER: 'SUPPLIER',
  SUPPORT: 'SUPPORT'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const SUBSCRIPTION_STATUS = {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED'
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

export const STATUS_BADGE_VARIANTS = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  TRIAL: 'warning',
  EXPIRED: 'destructive'
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 1000
} as const;

export const PHONE_PATTERNS = {
  TUNISIA: /^(\+216|0)?[2-9]\d{7}$/
} as const;

export const EMAIL_PATTERNS = {
  GENERAL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

