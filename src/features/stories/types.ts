/**
 * Types pour les Business Stories (annonces éphémères 24h)
 */

export type StoryType = 'announcement' | 'flash_sale' | 'promo' | 'new_arrival' | 'event' | 'discount';

export interface BusinessStory {
  id: string;
  business_id: string;
  title: string | null;
  description: string | null;
  images: string[];
  cover_url: string | null;
  story_type: StoryType;
  original_price: number | null;
  promo_price: number | null;
  discount_percentage: number | null;
  promo_code: string | null;
  latitude: number | null;
  longitude: number | null;
  geo_city: string | null;
  geo_district: string | null;
  catalog_id: string | null;
  product_id: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  expires_at: string;
  updated_at: string;
  // Relations
  business_profiles?: {
    id: string;
    business_name: string;
    logo_url: string | null;
    business_category: string;
    city: string | null;
    quartier: string | null;
  };
}

export interface StoryInsert {
  business_id: string;
  title?: string;
  description?: string;
  images?: string[];
  cover_url?: string;
  story_type: StoryType;
  original_price?: number;
  promo_price?: number;
  discount_percentage?: number;
  promo_code?: string;
  catalog_id?: string;
  product_id?: string;
}

export interface StoryUpdate extends Partial<StoryInsert> {
  id: string;
  is_active?: boolean;
}

export const STORY_TYPE_CONFIG: Record<StoryType, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  announcement: {
    label: 'Annonce',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📢'
  },
  flash_sale: {
    label: 'Vente Flash',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '⚡'
  },
  promo: {
    label: 'Promotion',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '🔥'
  },
  new_arrival: {
    label: 'Nouveauté',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✨'
  },
  event: {
    label: 'Événement',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '🎉'
  },
  discount: {
    label: 'Solde',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    icon: '🏷️'
  }
};
