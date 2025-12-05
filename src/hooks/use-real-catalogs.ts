import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealCatalog {
  id: string;
  name: string;
  description?: string;
  business_id: string;
  business_name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useRealCatalogs = (businessId?: string) => {
  const [catalogs, setCatalogs] = useState<RealCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('catalogs')
          .select(`
            id,
            name,
            description,
            business_id,
            is_active,
            display_order,
            created_at,
            updated_at,
            business_profiles!inner(
              business_name
            )
          `)
          .eq('is_active', true);

        if (businessId) {
          query = query.eq('business_id', businessId);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        const transformedCatalogs: RealCatalog[] = (data || []).map((catalog: any) => ({
          id: catalog.id,
          name: catalog.name,
          description: catalog.description,
          business_id: catalog.business_id,
          business_name: catalog.business_profiles?.business_name || 'Entreprise inconnue',
          is_active: catalog.is_active,
          display_order: catalog.display_order || 0,
          created_at: catalog.created_at,
          updated_at: catalog.updated_at
        }));

        setCatalogs(transformedCatalogs);
      } catch (err) {
        console.error('Error fetching catalogs:', err);
        setError('Erreur lors du chargement des catalogues');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, [businessId]);

  const refreshCatalogs = () => {
    setLoading(true);
    const fetchCatalogs = async () => {
      try {
        setError(null);

        let query = supabase
          .from('catalogs')
          .select(`
            id,
            name,
            description,
            business_id,
            is_active,
            display_order,
            created_at,
            updated_at,
            business_profiles!inner(
              business_name
            )
          `)
          .eq('is_active', true);

        if (businessId) {
          query = query.eq('business_id', businessId);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        const transformedCatalogs: RealCatalog[] = (data || []).map((catalog: any) => ({
          id: catalog.id,
          name: catalog.name,
          description: catalog.description,
          business_id: catalog.business_id,
          business_name: catalog.business_profiles?.business_name || 'Entreprise inconnue',
          is_active: catalog.is_active,
          display_order: catalog.display_order || 0,
          created_at: catalog.created_at,
          updated_at: catalog.updated_at
        }));

        setCatalogs(transformedCatalogs);
      } catch (err) {
        console.error('Error fetching catalogs:', err);
        setError('Erreur lors du chargement des catalogues');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  };

  return {
    catalogs,
    loading,
    error,
    refreshCatalogs
  };
};