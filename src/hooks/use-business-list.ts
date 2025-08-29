import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessListItem {
  id: string;
  name: string;
  type: string;
  owner?: string;
  address?: string;
  rating: number;
  verified: boolean;
  distance: string;
  isFavorite: boolean;
  sponsored: boolean;
  business_category?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  province?: string;
  department?: string;
  quartier?: string;
  created_at?: string;
}

export const useBusinessList = () => {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les business_profiles actifs et visibles
      const { data, error: fetchError } = await supabase
        .from('business_profiles')
        .select(`
          id,
          business_name,
          business_category,
          description,
          address,
          phone,
          email,
          website,
          province,
          department,
          quartier,
          is_verified,
          created_at
        `)
        .eq('is_active', true)
        .eq('is_sleeping', false)
        .eq('is_deactivated', false)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Formatter les données pour correspondre à l'interface attendue
      const formattedBusinesses: BusinessListItem[] = (data || []).map((business) => ({
        id: business.id,
        name: business.business_name,
        type: getCategoryLabel(business.business_category),
        owner: 'Propriétaire', // On pourrait récupérer le nom du propriétaire via une jointure
        address: formatAddress(business),
        rating: 4.5, // Valeur par défaut - on pourrait calculer la moyenne des avis
        verified: business.is_verified || false,
        distance: '1.0km', // Valeur par défaut - on pourrait calculer la distance réelle
        isFavorite: false, // À implémenter avec la table favorites
        sponsored: false, // Les nouvelles entreprises ne sont pas sponsorisées par défaut
        business_category: business.business_category,
        description: business.description || undefined,
        phone: business.phone || undefined,
        email: business.email || undefined,
        website: business.website || undefined,
        province: business.province || undefined,
        department: business.department || undefined,
        quartier: business.quartier || undefined,
        created_at: business.created_at
      }));

      setBusinesses(formattedBusinesses);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des entreprises:', err);
      setError(err.message || 'Erreur lors de la récupération des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const refreshBusinesses = () => {
    fetchBusinesses();
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return {
    businesses,
    loading,
    error,
    refreshBusinesses
  };
};

// Fonctions utilitaires
const getCategoryLabel = (category: string): string => {
  const categoryLabels: Record<string, string> = {
    'manufacturing': 'Artisan',
    'retail': 'Commerce', 
    'services': 'Service',
    'restaurant': 'Restaurant',
    'technology': 'Technologie',
    'automotive': 'Transport',
    'other': 'Autre'
  };
  
  return categoryLabels[category] || category;
};

const formatAddress = (business: any): string => {
  const parts = [
    business.quartier,
    business.department,
    business.province
  ].filter(Boolean);
  
  if (business.address) {
    return business.address;
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Gabon';
};