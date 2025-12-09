import { Database } from "@/integrations/supabase/types";

export type Catalog = Database['public']['Tables']['catalogs']['Row'];
export type CatalogInsert = Database['public']['Tables']['catalogs']['Insert'];
export type CatalogUpdate = Database['public']['Tables']['catalogs']['Update'];

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
