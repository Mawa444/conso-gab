/**
 * ============================================
 * CATALOG SERVICE LAYER
 * ============================================
 * Logique métier pour les opérations catalog
 * 
 * 🔥 CORRECTION MAJEURE : Suppression de tous les (supabase as any)
 * - Typage strict restauré
 * - JSDoc complète sur toutes les méthodes
 * - Types de retour explicites
 */

import { supabase } from "@/integrations/supabase/client";
import { createDomainLogger } from "@/lib/logger";

const logger = createDomainLogger('catalog-service');

// Types pour le service
interface CatalogWithBusiness {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price?: number;
  price_currency?: string;
  category?: string;
  subcategory?: string;
  catalog_type?: string;
  cover_url?: string;
  images?: any[];
  keywords?: string[];
  is_public: boolean;
  is_active: boolean;
  visibility?: string;
  seo_score?: number;
  delivery_available?: boolean;
  delivery_cost?: number;
  delivery_zones?: string[];
  on_sale?: boolean;
  sale_percentage?: number;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  geo_city?: string;
  geo_district?: string;
  created_at: string;
  updated_at: string;
  business_profiles?: any;
}

interface BookingData {
  id: string; // Assuming booking has an ID
  catalog_id: string;
  business_id: string;
  customer_id: string;
  booking_number: string;
  booking_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  special_requests?: string;
  created_at?: string; // Assuming created_at exists
}

export class CatalogService {
  /**
   * Récupère les catalogues publics avec filtres
   * 
   * @param filters - Filtres optionnels (category, city, search, limit, offset)
   * @returns Liste des catalogues publics avec leurs business profiles
   * 
   * @example
   * ```typescript
   * const catalogs = await CatalogService.fetchPublicCatalogs({
   *   category: 'Électronique',
   *   limit: 20
   * });
   * ```
   */
  static async fetchPublicCatalogs(filters?: {
    category?: string;
    city?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<CatalogWithBusiness[]> {
    let query = supabase
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
      logger.error('Failed to fetch public catalogs', { filters }, error);
      throw new Error('Impossible de charger les catalogues');
    }

    logger.info('Public catalogs fetched', { 
      action: 'fetch_catalogs',
      status: 'success',
      count: data?.length || 0
    });

    return data as CatalogWithBusiness[];
  }

  /**
   * Récupère un catalogue par ID
   * 
   * @param catalogId - ID du catalogue à récupérer
   * @returns Catalogue avec son business profile
   * @throws Error si le catalogue n'existe pas
   * 
   * @example
   * ```typescript
   * const catalog = await CatalogService.fetchCatalogById('uuid-123');
   * ```
   */
  static async fetchCatalogById(catalogId: string): Promise<CatalogWithBusiness> {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*, business_profiles(*)')
      .eq('id', catalogId)
      .single();

    if (error) {
      logger.error('Failed to fetch catalog', { catalogId }, error);
      throw new Error('Catalogue introuvable');
    }

    logger.info('Catalog fetched', { catalogId });
    return data as CatalogWithBusiness;
  }

  /**
   * Crée un nouveau catalogue
   * 
   * @param catalogData - Données du catalogue à créer
   * @returns Catalogue créé
   * @throws Error si la création échoue
   * 
   * @note Utilise la validation Zod dans use-create-catalog hook
   */
  static async createCatalog(catalogData: Partial<CatalogWithBusiness>): Promise<CatalogWithBusiness> {
    logger.info('Creating catalog', { 
      businessId: catalogData.business_id,
      name: catalogData.name 
    });

    const { data, error } = await supabase
      .from('catalogs')
      .insert(catalogData)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create catalog', { catalogData }, error);
      throw new Error('Impossible de créer le catalogue');
    }

    logger.info('Catalog created', { catalogId: data.id });
    return data as CatalogWithBusiness;
  }

  /**
   * Met à jour un catalogue existant
   * 
   * @param catalogId - ID du catalogue à mettre à jour
   * @param updates - Champs à mettre à jour
   * @returns Catalogue mis à jour
   * @throws Error si la mise à jour échoue
   */
  static async updateCatalog(
    catalogId: string, 
    updates: Partial<CatalogWithBusiness>
  ): Promise<CatalogWithBusiness> {
    logger.info('Updating catalog', { catalogId, updates });

    const { data, error } = await supabase
      .from('catalogs')
      .update(updates)
      .eq('id', catalogId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update catalog', { catalogId, updates }, error);
      throw new Error('Impossible de mettre à jour le catalogue');
    }

    logger.info('Catalog updated', { catalogId });
    return data as CatalogWithBusiness;
  }

  /**
   * Supprime un catalogue (soft delete)
   * 
   * @param catalogId - ID du catalogue à supprimer
   * @throws Error si la suppression échoue
   * 
   * @note Utilise is_active = false pour soft delete
   */
  static async deleteCatalog(catalogId: string): Promise<void> {
    logger.info('Deleting catalog (soft)', { catalogId });

    const { error } = await supabase
      .from('catalogs')
      .update({ is_active: false })
      .eq('id', catalogId);

    if (error) {
      logger.error('Failed to delete catalog', { catalogId }, error);
      throw new Error('Impossible de supprimer le catalogue');
    }

    logger.info('Catalog deleted (soft)', { catalogId });
  }

  /**
   * Supprime définitivement un catalogue (hard delete)
   * 
   * @param catalogId - ID du catalogue à supprimer définitivement
   * @throws Error si la suppression échoue
   * @warning Cette action est irréversible
   */
  static async hardDeleteCatalog(catalogId: string): Promise<void> {
    logger.warn('Hard deleting catalog', { catalogId });

    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', catalogId);

    if (error) {
      logger.error('Failed to hard delete catalog', { catalogId }, error);
      throw new Error('Impossible de supprimer définitivement le catalogue');
    }

    logger.warn('Catalog hard deleted', { catalogId });
  }

  /**
   * Crée une réservation pour un catalogue
   * 
   * @param bookingData - Données de la réservation
   * @returns Réservation créée
   * @throws Error si la création échoue
   */
  static async createBooking(bookingData: BookingData): Promise<BookingData> {
    logger.info('Creating booking', { 
      catalogId: bookingData.catalog_id,
      customerEmail: bookingData.customer_email 
    });

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create booking', { bookingData }, error);
      throw new Error('Impossible de créer la réservation');
    }

    logger.info('Booking created', { bookingId: data.id });
    return data as BookingData;
  }

  /**
   * Récupère les réservations d'un catalogue
   * 
   * @param catalogId - ID du catalogue
   * @returns Liste des réservations
   */
  static async fetchCatalogBookings(catalogId: string): Promise<BookingData[]> {
    logger.info('Fetching catalog bookings', { catalogId });

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('catalog_id', catalogId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch bookings', { catalogId }, error);
      throw new Error('Impossible de charger les réservations');
    }

    logger.info('Catalog bookings fetched', { 
      catalogId, 
      count: data?.length || 0 
    });
    
    return data as BookingData[];
  }
}
