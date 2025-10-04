/**
 * ============================================
 * CATALOG SERVICE LAYER
 * ============================================
 * Logique métier pour les opérations catalog
 */

import { supabase } from "@/integrations/supabase/client";
import { createDomainLogger } from "@/lib/logger";
import type { Catalog, CatalogBooking } from "@/types/entities/catalog.types";

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

    let query = supabase
      .from('catalogs')
      .select('*, business_profiles!inner(*)')
      .eq('is_public', true)
      .eq('is_active', true)
      .eq('visibility', 'published');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.city) {
      query = query.eq('geo_city', filters.city);
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

    return data as Catalog[];
  }

  /**
   * Récupère un catalogue par ID
   */
  static async fetchCatalogById(catalogId: string) {

    const { data, error } = await supabase
      .from('catalogs')
      .select('*, business_profiles!inner(*)')
      .eq('id', catalogId)
      .single();

    if (error) {
      logger.error('Failed to fetch catalog', {}, error);
      throw new Error('Catalogue introuvable');
    }

    logger.info('Catalog fetched');
    return data as Catalog;
  }

  /**
   * Crée un nouveau catalogue
   */
  static async createCatalog(
    businessId: string,
    catalogData: any
  ) {
    logger.info('Creating catalog');

    const { data, error } = await supabase
      .from('catalogs')
      .insert([{
        business_id: businessId,
        ...catalogData,
      } as any])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create catalog', {}, error);
      throw new Error(error.message || 'Impossible de créer le catalogue');
    }

    logger.info('Catalog created successfully');
    
    return data as Catalog;
  }

  /**
   * Met à jour un catalogue
   */
  static async updateCatalog(catalogId: string, updates: Partial<Catalog>) {
    logger.info('Updating catalog');
    const { data, error } = await supabase.from('catalogs').update(updates).eq('id', catalogId).select().single();
    if (error) throw new Error('Impossible de mettre à jour le catalogue');
    logger.info('Catalog updated successfully');
    return data as Catalog;
  }

  static async deleteCatalog(catalogId: string) {
    logger.info('Deleting catalog');
    const { error } = await supabase.from('catalogs').update({ is_active: false, visibility: 'archived' }).eq('id', catalogId);
    if (error) throw new Error('Impossible de supprimer le catalogue');
    logger.info('Catalog deleted successfully');
  }

  static async toggleVisibility(catalogId: string, isPublic: boolean) {
    logger.info('Toggling catalog visibility');
    const { error } = await supabase.from('catalogs').update({ is_public: isPublic, visibility: isPublic ? 'published' : 'draft' }).eq('id', catalogId);
    if (error) throw new Error('Impossible de modifier la visibilité');
    logger.info('Visibility toggled successfully');
  }

  static async createBooking(bookingData: any) {
    logger.info('Creating booking');
    const { data, error } = await supabase.from('catalog_bookings').insert([bookingData as any]).select().single();
    if (error) throw new Error(error.message || 'Impossible de créer la réservation');
    logger.info('Booking created successfully');
    return data as CatalogBooking;
  }

  static async fetchCatalogBookings(catalogId: string) {
    const { data, error } = await supabase.from('catalog_bookings').select('*').eq('catalog_id', catalogId).order('booking_date', { ascending: false });
    if (error) throw new Error('Impossible de charger les réservations');
    return data as CatalogBooking[];
  }
}
