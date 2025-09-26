import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedBusinesses = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchBusinesses = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Optimized query - only fetch essential fields
        const { data, error: fetchError } = await supabase
          .from('business_profiles')
          .select(`
            id,
            business_name,
            business_category,
            description,
            address,
            is_verified,
            city
          `)
          .eq('is_active', true)
          .limit(10); // Limit results for better performance

        if (fetchError) throw fetchError;

        // Transform data with minimal processing
        const transformedData = data?.map(business => ({
          id: business.id,
          name: business.business_name,
          type: business.business_category || 'Non spécifié',
          description: business.description,
          address: `${business.address}${business.city ? ', ' + business.city : ''}`,
          verified: business.is_verified || false,
          rating: 4.5, // Default rating
          distance: "N/A"
        })) || [];

        setBusinesses(transformedData);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Erreur lors du chargement des entreprises');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refreshBusinesses: fetchBusinesses
  };
};