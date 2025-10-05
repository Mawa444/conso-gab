// ✅ TYPES AVEC VALIDATION RUNTIME - APPROCHE MODERNE

import { z } from 'zod';

// ✅ SCHÉMAS ZOD POUR VALIDATION RUNTIME
export const BusinessSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  business_name: z.string().min(2).max(100),
  business_category: z.string().min(2).max(50),
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  email: z.string().email().optional(),
  logo_url: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  is_verified: z.boolean(),
  is_active: z.boolean(),
  is_sleeping: z.boolean(),
  pin_code: z.string().optional(), // Hashé côté serveur
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const BusinessCreationDataSchema = z.object({
  business_name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  business_category: z.string().min(2).max(50),
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Format téléphone invalide').optional(),
  email: z.string().email('Email invalide').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  pin_code: z.string().min(4, 'PIN trop court').max(10, 'PIN trop long'),
}).strict();

export const BusinessUpdateDataSchema = BusinessCreationDataSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_sleeping: z.boolean().optional(),
});

// ✅ TYPES INFÉRÉS DEPUIS ZOD (Single source of truth)
export type Business = z.infer<typeof BusinessSchema>;
export type BusinessCreationData = z.infer<typeof BusinessCreationDataSchema>;
export type BusinessUpdateData = z.infer<typeof BusinessUpdateDataSchema>;

export interface MapBusiness extends Pick<Business,
  'id' | 'business_name' | 'business_category' | 'description' |
  'address' | 'city' | 'phone' | 'email' | 'logo_url' |
  'latitude' | 'longitude' | 'is_verified' | 'is_active'
> {
  distance_meters?: number;
}

export interface BusinessStats {
  total_businesses: number;
  active_businesses: number;
  verified_businesses: number;
  businesses_by_category: Record<string, number>;
}

export interface BusinessFilters {
  category?: string;
  city?: string;
  is_verified?: boolean;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
}

// ✅ TYPES POUR LES ERREURS AVEC ZOD
export interface BusinessError {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'DUPLICATE' | 'SERVER_ERROR';
  message: string;
  field?: keyof BusinessCreationData;
  zodErrors?: z.ZodError['errors'];
}

// ✅ TYPE GUARDS POUR SÉCURITÉ RUNTIME
export const isBusiness = (data: unknown): data is Business => {
  return BusinessSchema.safeParse(data).success;
};

export const isBusinessCreationData = (data: unknown): data is BusinessCreationData => {
  return BusinessCreationDataSchema.safeParse(data).success;
};

export const validateBusinessData = (data: unknown): BusinessCreationData => {
  return BusinessCreationDataSchema.parse(data);
};

// ✅ TYPES POUR LES HOOKS (SIMPLIFIÉS)
export interface UseBusinessListResult {
  businesses: Business[];
  loading: boolean;
  error: BusinessError | null;
  refetch: () => Promise<void>;
  filters: BusinessFilters;
  setFilters: (filters: Partial<BusinessFilters>) => void;
}

export interface UseBusinessCreationResult {
  createBusiness: (data: BusinessCreationData) => Promise<Business>;
  isCreating: boolean;
  error: BusinessError | null;
  reset: () => void;
}