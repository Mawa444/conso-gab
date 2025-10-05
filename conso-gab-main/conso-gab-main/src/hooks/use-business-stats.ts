import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', businessId);

        // Récupérer les produits (via catalogues)
        const { data: catalogsData } = await supabase
          .from('catalogs')
          .select('id')
          .eq('business_id', businessId)
          .eq('is_active', true);

        const catalogIds = catalogsData?.map(c => c.id) || [];
        
        const { count: productsCount } = await supabase
          .from('product')
          .select('*', { count: 'exact', head: true })
          .in('catalog_id', catalogIds.length > 0 ? catalogIds : ['00000000-0000-0000-0000-000000000000']);

        // Récupérer les conversations
        const { count: messagesCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('origin_type', 'business')
          .eq('origin_id', businessId);

        // Récupérer les abonnés
        const { count: subscribersCount } = await supabase
          .from('business_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('is_active', true);

        // Récupérer le nombre de catalogues
        const { count: catalogsCount } = await supabase
          .from('catalogs')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('is_active', true);

        // Pour les vues, on peut utiliser activity_log si disponible
        const { count: viewsCount } = await supabase
          .from('activity_log')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('action_type', 'view_business');

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
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [businessId]);

  return { stats, loading, error };
};
