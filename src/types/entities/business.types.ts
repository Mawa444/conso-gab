/**
 * Business Entity Types
 */

export interface BusinessProfile {
  id: string;
  user_id: string;
  owner_id?: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  carousel_images?: string[];
  category: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  opening_hours?: Record<string, any>;
  is_verified: boolean;
  is_active: boolean;
  is_primary: boolean;
  is_sleeping?: boolean;
  deactivation_scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessCollaborator {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  status: 'pending' | 'accepted' | 'rejected';
  permissions?: Record<string, boolean>;
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
}

export interface BusinessSubscription {
  id: string;
  subscriber_user_id: string;
  business_id: string;
  notification_types: {
    new_order: boolean;
    new_catalog: boolean;
    new_comment: boolean;
    new_message: boolean;
    business_update: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BusinessRole = 'owner' | 'admin' | 'manager' | 'staff';
export type BusinessStatus = 'pending' | 'accepted' | 'rejected';
