/**
 * Catalog Entity Types
 */

export interface Catalog {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_currency: string | null;
  category: string | null;
  subcategory: string | null;
  catalog_type: 'products' | 'services';
  cover_url: string | null;
  images: any; // JSONB
  keywords: string[] | null;
  is_public: boolean | null;
  is_active: boolean | null;
  visibility: 'draft' | 'published' | 'archived' | null;
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
  
  // Virtual/Computed fields for UI (Optional)
  business_name?: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export type CatalogInsert = Omit<Catalog, 'id' | 'created_at' | 'updated_at'>;
export type CatalogUpdate = Partial<CatalogInsert>;

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

export type CatalogType = 'products' | 'services';
export type CatalogVisibility = 'draft' | 'published' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
