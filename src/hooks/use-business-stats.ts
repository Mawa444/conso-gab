import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper pour tables non typées
const table = (name: string) => (supabase as any).from(name);

interface BusinessStats {
  orders: number;
  products: number;
  messages: number;
  views: number;
  catalogs: number;
  subscribers: number;
}

export const useBusinessStats = (businessId: string | undefined) => {
  const [stats, setStats] = useState<BusinessStats>({
    orders: 0,
    products: 0,
    messages: 0,
    views: 0,
    catalogs: 0,
    subscribers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer les commandes
        const { count: ordersCount } = await table('orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId);

        // Récupérer les catalogues
        const { data: catalogsData } = await table('catalogs')
          .select('id')
          .eq('business_id', businessId)
          .eq('is_active', true);

        const catalogIds = catalogsData?.map((c: any) => c.id) || [];
        
        // Récupérer les produits
        const { count: productsCount } = await table('products')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId);

        // Récupérer les conversations
        const { count: messagesCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId);

        // Récupérer les abonnés
        const { count: subscribersCount } = await table('business_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('is_active', true);

        // Récupérer le nombre de catalogues
        const { count: catalogsCount } = await table('catalogs')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('is_active', true);

        // Pour les vues
        const { count: viewsCount } = await table('activity_log')
          .select('*', { count: 'exact', head: true })
          .eq('action_type', 'PROFILE_VIEWED')
          .eq('business_id', businessId);

        setStats({
          orders: ordersCount || 0,
          products: productsCount || 0,
          messages: messagesCount || 0,
          views: viewsCount || 0,
          catalogs: catalogsCount || 0,
          subscribers: subscribersCount || 0
        });
      } catch (err) {
        console.error('Error fetching business stats:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [businessId]);

  return { stats, loading, error };
};
