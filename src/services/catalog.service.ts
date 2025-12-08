/**
 * ============================================
 * CATALOG SERVICE LAYER
 * ============================================
 * Logique métier pour les opérations catalog
 */

import { CreateCatalogInput } from "@/types/entities/catalog.types";

import { supabase } from "@/integrations/supabase/client";
import { createDomainLogger } from "@/lib/logger";

const logger = createDomainLogger('catalog-service');

export class CatalogService {
  /**
   * Récupère les catalogues publics avec filtres
   */
  static async fetchPublicCatalogs(filters?: {
    category?: string;
    city?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = (supabase as any)
      .from('catalogs')
      .select('*, business_profiles(*)')
      .eq('is_public', true)
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch public catalogs', {}, error);
      throw new Error('Impossible de charger les catalogues');
    }

    logger.info('Public catalogs fetched', { 
      action: 'fetch_catalogs',
      status: 'success'
    });

    return data as any[];
  }

  /**
   * Récupère un catalogue par ID
   */
  static async fetchCatalogById(catalogId: string) {
    const { data, error } = await (supabase as any)
      .from('catalogs')
      .select('*, business_profiles(*)')
      .eq('id', catalogId)
      .single();

    if (error) {
      logger.error('Failed to fetch catalog', {}, error);
      throw new Error('Catalogue introuvable');
    }

    logger.info('Catalog fetched');
    return data as any;
  }

  /**
   * Crée un nouveau catalogue
   */
  /**
   * Crée un nouveau catalogue avec mapping complet des données
   */
  static async createCatalog(businessId: string, payload: CreateCatalogInput) {
    logger.info('Creating catalog', { businessId });

    // Build the insert data with all necessary fields (Centralized logic)
    const insertData = {
      business_id: businessId,
      name: payload.name?.trim() || "Catalogue sans nom",
      description: payload.description?.trim(),
      category: payload.category,
      subcategory: payload.subcategory,
      catalog_type: payload.catalog_type,
      is_public: payload.isPublic ?? false,
      visibility: payload.isPublic ? 'published' : 'draft',

      // Images handling
      // Cast images to string/json if needed by DB, or let Supabase client handle it if defined as Json in types
      // Using 'any' cast for images to avoid TS conflicts with Json type
      images: payload.images ? JSON.parse(JSON.stringify(payload.images)) : null,
      cover_url: payload.cover_image_url || payload.cover_url,

      // Location & SEO
      geo_city: payload.geo_city,
      geo_district: payload.geo_district,
      keywords: payload.keywords,
      synonyms: payload.synonyms,

      // Commerce settings
      has_limited_quantity: payload.has_limited_quantity,
      on_sale: payload.on_sale,
      sale_percentage: payload.sale_percentage,
      delivery_available: payload.delivery_available,
      delivery_zones: payload.delivery_zones,
      delivery_cost: payload.delivery_cost,

      // Contact
      contact_whatsapp: payload.contact_whatsapp,
      contact_phone: payload.contact_phone,
      contact_email: payload.contact_email,
      business_hours: payload.business_hours,

      // Pricing
      min_price: payload.base_price,
      max_price: payload.base_price,
      price_type: payload.price_type,
      price_currency: payload.price_currency || 'FCFA',
      price_details: payload.price_details ? JSON.parse(JSON.stringify(payload.price_details)) : null,

      is_active: true,
      display_order: 0
    };

    const { data, error } = await (supabase as any)
      .from('catalogs')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create catalog', {}, error);
      throw new Error(error.message || 'Impossible de créer le catalogue');
    }

    logger.info('Catalog created successfully');
    return data;
  }


  /**
   * Met à jour un catalogue
   */
  static async updateCatalog(catalogId: string, updates: any) {
    logger.info('Updating catalog');
    const { data, error } = await (supabase as any)
      .from('catalogs')
      .update(updates)
      .eq('id', catalogId)
      .select()
      .single();
    
    if (error) throw new Error('Impossible de mettre à jour le catalogue');
    logger.info('Catalog updated successfully');
    return data as any;
  }

  static async deleteCatalog(catalogId: string) {
    logger.info('Deleting catalog');
    const { error } = await (supabase as any)
      .from('catalogs')
      .update({ is_active: false, visibility: 'archived' })
      .eq('id', catalogId);
    
    if (error) throw new Error('Impossible de supprimer le catalogue');
    logger.info('Catalog deleted successfully');
  }

  static async toggleVisibility(catalogId: string, isPublic: boolean) {
    logger.info('Toggling catalog visibility');
    const { error } = await (supabase as any)
      .from('catalogs')
      .update({ is_public: isPublic, visibility: isPublic ? 'published' : 'draft' })
      .eq('id', catalogId);
    
    if (error) throw new Error('Impossible de modifier la visibilité');
    logger.info('Visibility toggled successfully');
  }

  static async createBooking(bookingData: any) {
    logger.info('Creating booking');
    const { data, error } = await (supabase as any)
      .from('catalog_bookings')
      .insert([bookingData])
      .select()
      .single();
    
    if (error) throw new Error(error.message || 'Impossible de créer la réservation');
    logger.info('Booking created successfully');
    return data as any;
  }

  static async fetchCatalogBookings(catalogId: string) {
    const { data, error } = await (supabase as any)
      .from('catalog_bookings')
      .select('*')
      .eq('catalog_id', catalogId)
      .order('booking_date', { ascending: false });
    
    if (error) throw new Error('Impossible de charger les réservations');
    return data as any[];
  }
}
