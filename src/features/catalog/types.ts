import { Database } from "@/integrations/supabase/types";

// Fallback since 'catalogs' might not be in generated types yet
export interface Catalog {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_currency: string | null;
  category: string | null;
  subcategory: string | null;
  catalog_type: string; // 'products' | 'services'
  cover_url: string | null;
  images: any; // JSONB
  keywords: string[] | null;
  is_public: boolean | null;
  is_active: boolean | null;
  visibility: string | null;
  seo_score: number | null;
  delivery_available: boolean | null;
  delivery_cost: number | null;
  delivery_zones: string[] | null;
  on_sale: boolean | null;
  sale_percentage: number | null;
  contact_whatsapp: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  geo_city: string | null;
  geo_district: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogInsert {
  business_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  price_currency?: string;
  category?: string | null;
  subcategory?: string | null;
  catalog_type?: string;
  cover_url?: string | null;
  images?: any;
  keywords?: string[] | null;
  is_public?: boolean | null;
  is_active?: boolean | null;
  visibility?: string | null;
  seo_score?: number | null;
  delivery_available?: boolean | null;
  delivery_cost?: number | null;
  delivery_zones?: string[] | null;
  on_sale?: boolean | null;
  sale_percentage?: number | null;
  contact_whatsapp?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  geo_city?: string | null;
  geo_district?: string | null;
}

export interface CatalogUpdate extends Partial<CatalogInsert> {
  id?: string;
  updated_at?: string;
}

export type CatalogVisibility = 'draft' | 'published' | 'archived';

export interface CatalogFormData {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  is_public: boolean;
  is_active: boolean;
  cover_url?: string;
  // Add other fields as necessary from the original types if we want to support them
  // For now keeping it simple as per the "clean" directive
}
