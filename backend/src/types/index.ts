import { Request } from 'express';
import { User, Role, City, Region } from '@prisma/client';
import { Socket } from 'socket.io';

// User with relations
export type UserWithRelations = User & {
  role: Role;
  city?: (City & {
    region: Region;
  }) | null;
};

// Request interface with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: UserWithRelations;
}

// Socket interface with authenticated user
export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
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

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  cityName?: string;
  regionName?: string;
  role: 'PHARMACY' | 'SUPPLIER';
}

// Medicine search types
export interface MedicineSearchParams {
  query?: string;
  dci?: string;
  brandName?: string;
  laboratoire?: string;
  atcCode?: string;
}

// Announcement types
export interface CreateAnnouncementData {
  medicineId: number;
  quantity: number;
  expiryDate: string;
  supplierUserId: string;
  visibleToSupplier?: boolean;
}

// Request types
export interface CreateRequestData {
  medicineId: number;
  quantity: number;
  scope: 'CITY' | 'REGION' | 'ALL_TUNISIA';
  cities?: number[];
  regions?: string[];
}