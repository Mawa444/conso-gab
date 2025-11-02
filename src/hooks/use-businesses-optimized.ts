/**
 * ============================================
 * OPTIMIZED BUSINESSES HOOK
 * ============================================
 * Hook optimisé sans duplication de code
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('BusinessesHook');

export interface RealBusiness {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_verified: boolean;
  is_active: boolean;
  is_sleeping: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

interface BusinessesHookResult {
  businesses: RealBusiness[];
  loading: boolean;
  error: string | null;
  refreshBusinesses: () => Promise<void>;
}

/**
 * Fonction centralisée pour fetcher les businesses (DRY principle)
 */
async function fetchBusinessesFromDB(): Promise<RealBusiness[]> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      id,
      business_name,
      business_category,
      description,
      address,
      city,
      phone,
      email,
      website,
      logo_url,
      cover_image_url,
      is_verified,
      is_active,
      is_sleeping,
      latitude,
      longitude,
      created_at
    `)
    .eq('is_active', true)
    .eq('is_sleeping', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(business => ({
    id: business.id,
    name: business.business_name,
    category: business.business_category,
    description: business.description,
    address: business.address,
    city: business.city,
    phone: business.phone,
    email: business.email,
    website: business.website,
    logo_url: business.logo_url,
    cover_image_url: business.cover_image_url,
    is_verified: business.is_verified,
    is_active: business.is_active,
    is_sleeping: business.is_sleeping,
    latitude: business.latitude,
    longitude: business.longitude,
    created_at: business.created_at
  }));
}

/**
 * Hook optimisé avec une seule fonction de fetch réutilisée
 */
export const useRealBusinesses = (): BusinessesHookResult => {
  const [businesses, setBusinesses] = useState<RealBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction de fetch réutilisable (memoized)
  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBusinessesFromDB();
      setBusinesses(data);
    } catch (err) {
      logger.error('Error fetching businesses', { error: err });
      setError('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Expose refresh function
  const refreshBusinesses = useCallback(async () => {
    await loadBusinesses();
  }, [loadBusinesses]);

  return {
    businesses,
    loading,
    error,
    refreshBusinesses
  };
};
