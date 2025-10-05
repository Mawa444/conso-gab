/**
 * Types communs pour l'application GABOMA
 * Remplace tous les usages de `any` par des types stricts
 */

// ========= TYPES GÉNÉRAUX =========

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

export type UnknownRecord = Record<string, unknown>;

// ========= TYPES ERREURS =========

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: UnknownRecord;
}

export interface ValidationError extends AppError {
  field?: string;
  constraint?: string;
}

export interface NetworkError extends AppError {
  url?: string;
  method?: string;
  statusCode?: number;
}

// ========= TYPES BUSINESS =========

export interface BusinessLocation {
  latitude: number;
  longitude: number;
  address: string;
  formatted_address?: string;
  quartier?: string;
  department?: string;
  province?: string;
}

export interface EncryptedLocation {
  encrypted_data: string;
  address?: string;
  formatted_address?: string;
  updated_at?: string;
}

export interface BusinessAddress {
  quartier?: string;
  department?: string;
  province?: string;
  address?: string;
  full_address?: string;
}

// ========= TYPES CATALOG =========

export interface CatalogImage {
  url: string;
  alt?: string;
  order?: number;
}

export interface CatalogMetadata {
  conversation_id?: string;
  source?: string;
  [key: string]: JSONValue | undefined;
}

export type CatalogVisibility = 'public' | 'private' | 'unlisted';
export type CatalogType = 'product' | 'service' | 'promotion' | 'menu' | 'portfolio';

// ========= TYPES LOCATION REQUESTS =========

export type LocationShareMode = 'one_time' | 'temporary' | 'persistent';
export type LocationRequestPurpose = 
  | 'delivery' 
  | 'meeting' 
  | 'emergency' 
  | 'general'
  | 'service_location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  formatted_address?: string;
  accuracy?: number;
  timestamp?: string;
}

export interface SharedLocationData {
  encrypted_data: string;
  shared_at: string;
  expires_at?: string;
}

// ========= TYPES SUPABASE RESPONSES =========

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// ========= TYPES NOTIFICATIONS =========

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  data?: UnknownRecord;
  read?: boolean;
  created_at?: string;
}

export type NotificationType = 
  | 'new_message'
  | 'new_order'
  | 'order_status_update'
  | 'new_booking'
  | 'booking_confirmed'
  | 'new_catalog'
  | 'new_comment'
  | 'system';

// ========= TYPES RETRY/API =========

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: AppError) => boolean;
  onRetry?: (attemptNumber: number, error: AppError) => void;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// ========= TYPES MONITORING =========

export interface LogData {
  [key: string]: JSONValue;
}

export interface ErrorContext {
  user_id?: string;
  business_id?: string;
  action?: string;
  url?: string;
  component?: string;
  [key: string]: JSONValue | undefined;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  metadata?: UnknownRecord;
}

// ========= TYPES MEDIA =========

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  size?: number;
  mime_type?: string;
  thumbnail_url?: string;
  metadata?: UnknownRecord;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

// ========= TYPES CONVERSATIONS =========

export interface MessageMetadata extends Record<string, JSONValue> {
  catalog_id?: string;
  business_id?: string;
  order_id?: string;
}

// ========= TYPES SEARCH =========

export interface SearchFilters extends Record<string, JSONValue> {
  category?: string;
  priceRange?: JSONObject;
  rating?: number;
  availability?: boolean;
}

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========= TYPES UTILS =========

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ========= TYPE GUARDS =========

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as AppError).message === 'string'
  );
}

export function isValidJSON(value: unknown): value is JSONValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isValidJSON);
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isValidJSON);
  }
  return false;
}

// ========= TYPES FROM SHARED/TYPES =========

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