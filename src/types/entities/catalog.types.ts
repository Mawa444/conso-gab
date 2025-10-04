/**
 * Catalog Entity Types
 */

export interface Catalog {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  cover_image_url?: string;
  cover_blurhash?: string;
  images?: string[] | Record<string, any>;
  category?: string;
  subcategory?: string;
  catalog_type: 'products' | 'services' | 'mixed';
  base_price?: number;
  price_type: 'fixed' | 'range' | 'quote';
  price_currency: string;
  price_details?: Record<string, any>[];
  has_limited_quantity: boolean;
  on_sale: boolean;
  sale_percentage?: number;
  delivery_available: boolean;
  delivery_cost?: number;
  delivery_zones?: string[];
  geo_city?: string;
  geo_district?: string;
  availability_zone: string;
  business_hours?: Record<string, any>;
  contact_phone?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  is_public: boolean;
  is_active: boolean;
  visibility: 'draft' | 'published' | 'archived';
  display_order: number;
  seo_score: number;
  keywords?: string[];
  synonyms?: string[];
  phonetics?: string[];
  language: string;
  folder?: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogBooking {
  id: string;
  catalog_id: string;
  business_id: string;
  customer_id: string;
  booking_number: string;
  booking_type: string;
  booking_date: string;
  booking_time: string;
  end_time?: string;
  total_amount?: number;
  deposit_paid?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'partial' | 'paid';
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  special_requests?: string;
  notes?: string;
  cancellation_reason?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogBookingConfig {
  id: string;
  catalog_id: string;
  business_id: string;
  booking_enabled: boolean;
  booking_type: 'appointment' | 'reservation' | 'service';
  require_approval: boolean;
  allow_online_payment: boolean;
  advance_booking_days: number;
  booking_slots_duration: number;
  booking_hours: { start: string; end: string };
  available_days: string[];
  max_bookings_per_slot: number;
  deposit_required: boolean;
  deposit_amount?: number;
  cancellation_policy?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export type CatalogType = 'products' | 'services' | 'mixed';
export type CatalogVisibility = 'draft' | 'published' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
