/**
 * ============================================
 * BUSINESS SERVICE LAYER
 * ============================================
 * Logique métier centralisée pour les opérations business
 * Sépare la logique de la présentation (hooks/composants)
 */

import { supabase } from "@/integrations/supabase/client";
import { createDomainLogger } from "@/lib/logger";
import type { ProfileMode } from "@/hooks/use-profile-mode";

const logger = createDomainLogger('business-service');

export interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  is_primary: boolean;
  role: string;
  is_owner: boolean;
}

export interface UserCurrentMode {
  current_mode: ProfileMode;
  current_business_id?: string;
}

/**
 * ============================================
 * BUSINESS PROFILES OPERATIONS
 * ============================================
 */

export class BusinessService {
  /**
   * Récupère les profils business d'un utilisateur
   */
  static async fetchBusinessProfiles(userId: string): Promise<BusinessProfile[]> {

    const { data, error } = await supabase
      .from('business_profiles')
      .select('id, business_name, logo_url, is_primary, user_id, owner_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch business profiles', { user_id: userId }, error);
      throw new Error('Impossible de charger les profils business');
    }

    logger.info('Business profiles fetched', { 
      user_id: userId,
      action: 'fetch_profiles',
      status: 'success'
    }, { count: data?.length || 0 });

    return (data || []).map(profile => ({
      id: profile.id,
      business_name: profile.business_name,
      logo_url: profile.logo_url,
      is_primary: profile.is_primary || false,
      role: 'owner',
      is_owner: true
    }));
  }

  /**
   * Récupère le mode actuel d'un utilisateur
   */
  static async fetchCurrentMode(userId: string): Promise<UserCurrentMode> {

    const { data, error } = await supabase
      .from('user_current_mode')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to fetch current mode', { user_id: userId }, error);
      throw new Error('Impossible de charger le mode utilisateur');
    }

    if (data) {
      logger.info('Current mode fetched', { 
        user_id: userId,
        action: 'fetch_mode',
        status: 'success'
      }, { mode: data.current_mode });
      
      return {
        current_mode: data.current_mode as ProfileMode,
        current_business_id: data.current_business_id || undefined
      };
    }

    // Initialiser en mode consumer si aucun mode défini
    logger.info('Initializing consumer mode', { user_id: userId });
    
    await supabase
      .from('user_current_mode')
      .insert({
        user_id: userId,
        current_mode: 'consumer',
        current_business_id: null
      });

    return { current_mode: 'consumer' };
  }

  /**
   * Change le mode utilisateur (consumer/business)
   */
  static async switchMode(
    userId: string,
    mode: ProfileMode,
    businessId?: string
  ): Promise<void> {
    logger.info('Switching mode', { 
      user_id: userId,
      business_id: businessId,
      action: 'switch_mode'
    }, { mode });

    const { error } = await supabase.rpc('switch_user_profile', {
      profile_id: businessId || null
    });

    if (error) {
      logger.error('Failed to switch mode', { 
        user_id: userId,
        business_id: businessId,
        action: 'switch_mode'
      }, { error, mode });
      throw new Error(error.message || 'Impossible de changer de mode');
    }

    logger.info('Mode switched successfully', { 
      user_id: userId,
      business_id: businessId,
      action: 'switch_mode',
      status: 'success'
    }, { mode });
  }

  /**
   * Vérifie si un utilisateur est propriétaire d'un business
   */
  static async isBusinessOwner(userId: string, businessId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('user_id, owner_id')
      .eq('id', businessId)
      .single();

    if (error || !data) return false;

    return data.user_id === userId || data.owner_id === userId;
  }

  /**
   * Récupère un profil business par ID
   */
  static async fetchBusinessById(businessId: string) {

    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessId)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.error('Failed to fetch business', { business_id: businessId }, error);
      throw new Error('Profil business introuvable');
    }

    logger.info('Business fetched', { business_id: businessId });
    return data;
  }

  /**
   * Met à jour un profil business
   */
  static async updateBusiness(
    businessId: string,
    userId: string,
    updates: Record<string, any>
  ) {
    logger.info('Updating business', { business_id: businessId, user_id: userId });

    // Vérifier les permissions
    const isOwner = await this.isBusinessOwner(userId, businessId);
    if (!isOwner) {
      throw new Error('Vous n\'avez pas les permissions pour modifier ce profil');
    }

    const { data, error } = await supabase
      .from('business_profiles')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update business', { 
        business_id: businessId, 
        user_id: userId 
      }, error);
      throw new Error('Impossible de mettre à jour le profil');
    }

    logger.info('Business updated successfully', { business_id: businessId });
    return data;
  }

  /**
   * Supprime (désactive) un profil business
   */
  static async deleteBusiness(businessId: string, userId: string) {
    logger.info('Deleting business', { business_id: businessId, user_id: userId });

    // Vérifier les permissions
    const isOwner = await this.isBusinessOwner(userId, businessId);
    if (!isOwner) {
      throw new Error('Vous n\'avez pas les permissions pour supprimer ce profil');
    }

    const { error } = await supabase
      .from('business_profiles')
      .update({ is_active: false })
      .eq('id', businessId);

    if (error) {
      logger.error('Failed to delete business', { 
        business_id: businessId, 
        user_id: userId 
      }, error);
      throw new Error('Impossible de supprimer le profil');
    }

    logger.info('Business deleted successfully', { business_id: businessId });
  }
}
