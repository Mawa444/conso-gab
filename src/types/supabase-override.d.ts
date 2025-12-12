// Types manuels pour les tables créées via migration SQL mais pas encore générées
// Permet d'éviter @ts-ignore

import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

declare global {
  type Database = GeneratedDatabase & {
    public: {
      Tables: {
        business_visits: {
          Row: {
            id: string;
            business_id: string;
            visitor_id: string | null;
            visited_at: string;
            source: string | null;
            user_agent: string | null;
            device_type: string | null;
            ip_hash: string | null;
          };
          Insert: {
            id?: string;
            business_id: string;
            visitor_id?: string | null;
            visited_at?: string;
            source?: string | null;
            user_agent?: string | null;
            device_type?: string | null;
            ip_hash?: string | null;
          };
          Update: Partial<Database['public']['Tables']['business_visits']['Insert']>;
        };
      };
    };
    Functions: {
      get_nearest_businesses: {
        Args: {
          lat: number;
          lng: number;
          radius_meters?: number;
          limit_count?: number;
          offset_count?: number;
          search_query?: string | null;
          category_filter?: string | null;
        };
        Returns: {
          id: string;
          business_name: string;
          business_category: string;
          logo_url: string;
          cover_image_url: string;
          city: string;
          slug: string;
          latitude: number;
          longitude: number;
          distance_meters: number;
        }[];
      };
      get_nearest_catalogs: {
        Args: {
          lat: number;
          lng: number;
          radius_meters?: number;
          limit_count?: number;
          offset_count?: number;
          search_query?: string | null;
        };
        Returns: {
          id: string;
          title: string;
          description: string;
          cover_image: string;
          business_id: string;
          business_name: string;
          business_city: string;
          distance_meters: number;
          product_count: number;
        }[];
      };
      get_nearest_products: {
        Args: {
          lat: number;
          lng: number;
          radius_meters?: number;
          limit_count?: number;
          offset_count?: number;
          search_query?: string | null;
        };
        Returns: {
          id: string;
          name: string;
          description: string;
          price: number;
          image_url: string;
          catalog_id: string;
          business_id: string;
          business_name: string;
          distance_meters: number;
        }[];
      };
      get_nearest_stories: {
        Args: {
          lat: number;
          lng: number;
          radius_meters?: number;
          limit_count?: number;
          offset_count?: number;
        };
        Returns: {
          id: string;
          business_id: string;
          business_name: string;
          business_logo_url: string;
          media_url: string;
          media_type: string;
          caption: string;
          created_at: string;
          expires_at: string;
          distance_meters: number;
        }[];
      };
    };
  };
}
