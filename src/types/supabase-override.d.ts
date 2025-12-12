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
        user_listings: {
          Row: {
            id: string;
            user_id: string;
            title: string;
            description: string | null;
            price: number;
            currency: string | null;
            images: string[] | null;
            category: string;
            condition: string | null;
            location: unknown | null;
            city: string | null;
            is_active: boolean | null;
            view_count: number | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            title: string;
            description?: string | null;
            price: number;
            currency?: string | null;
            images?: string[] | null;
            category: string;
            condition?: string | null;
            location?: unknown | null;
            city?: string | null;
            is_active?: boolean | null;
            view_count?: number | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: Partial<Database['public']['Tables']['user_listings']['Insert']>;
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
      get_nearest_user_listings: {
        Args: {
          lat: number;
          lng: number;
          radius_meters?: number;
          limit_count?: number;
          offset_count?: number;
          search_query?: string | null;
          category_filter?: string | null;
          min_price?: number | null;
          max_price?: number | null;
        };
        Returns: {
          id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          images: string[];
          category: string;
          condition: string;
          city: string;
          user_id: string;
          user_full_name: string;
          user_avatar_url: string;
          created_at: string;
          distance_meters: number;
        }[];
      };
      get_unified_feed: {
        Args: {
          lat: number;
          lng: number;
          radius_meters?: number;
          limit_count?: number;
          offset_count?: number;
        };
        Returns: {
          item_type: 'story' | 'listing' | 'business';
          id: string;
          title: string;
          subtitle: string;
          image_url: string;
          distance_meters: number;
          created_at: string;
          data: any; // JSONB
        }[];
      };
      get_business_customers: {
        Args: {
          p_business_id: string;
          p_search?: string;
          p_status?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          customer_id: string;
          full_name: string;
          avatar_url: string;
          email: string;
          status: string;
          tags: string[];
          notes: string;
          total_spent: number;
          total_orders: number;
          last_interaction_at: string;
          created_at: string;
        }[];
      };
      toggle_business_feature: {
        Args: {
          p_business_id: string;
          p_feature_key: string;
          p_is_enabled: boolean;
        };
        Returns: any; // JSONB
      };
    };
  };
}
