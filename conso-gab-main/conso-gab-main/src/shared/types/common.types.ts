// Types communs utilisés à travers l'application

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Visibility = 'public' | 'private' | 'restricted';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';