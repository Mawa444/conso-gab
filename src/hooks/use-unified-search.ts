import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  name: string;
  type: 'business' | 'catalog' | 'product';
  title: string;
  description?: string;
  category?: string;
  address?: string;
  rating?: number;
  verified?: boolean;
  distance?: string;
  score: number;
  businessId?: string;
  catalogId?: string;
}

export interface UnifiedSearchFilters {
  location?: string;
  category?: "restaurant" | "retail" | "services" | "technology" | "healthcare" | "education" | "finance" | "real_estate" | "automotive" | "beauty" | "fitness" | "entertainment" | "agriculture" | "manufacturing" | "other";
  verified?: boolean;
  minRating?: number;
  businessType?: string;
}

export const useUnifiedSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchBusinesses = useCallback(async (query: string, filters?: UnifiedSearchFilters): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    try {
      const searchTerm = query.toLowerCase().trim();
      
      // Recherche dans business_profiles
      let businessQuery = supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_sleeping', false)
        .eq('is_deactivated', false);

      if (filters?.verified) {
        businessQuery = businessQuery.eq('is_verified', true);
      }

      if (filters?.category) {
        businessQuery = businessQuery.eq('business_category', filters.category);
      }

      if (filters?.location) {
        businessQuery = businessQuery.or(`city.ilike.%${filters.location}%,quartier.ilike.%${filters.location}%,department.ilike.%${filters.location}%`);
      }

      const { data: businesses, error: businessError } = await businessQuery;
      
      if (businessError) throw businessError;

      return businesses?.map(business => {
        let score = 0;
        
        // Calcul du score de pertinence
        if (business.business_name.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        if (business.description && business.description.toLowerCase().includes(searchTerm)) {
          score += 50;
        }
        
        if (business.address && business.address.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        if (business.quartier && business.quartier.toLowerCase().includes(searchTerm)) {
          score += 20;
        }
        
        // Recherche floue par caractères partagés
        const sharedChars = searchTerm.split('').filter(char => 
          business.business_name.toLowerCase().includes(char)
        ).length;
        
        if (sharedChars >= Math.min(3, searchTerm.length)) {
          score += sharedChars * 5;
        }
        
        // Bonus pour les commerces vérifiés
        if (business.is_verified) score += 15;
        
        return {
          id: business.id,
          name: business.business_name,
          type: 'business' as const,
          title: business.business_name,
          description: business.description,
          category: business.business_category,
          address: `${business.address || ''} ${business.quartier || ''} ${business.city || ''}`.trim(),
          verified: business.is_verified,
          score,
          businessId: business.id
        } as SearchResult;
      }).filter(item => item.score > 0) || [];
      
    } catch (error) {
      console.error('Error searching businesses:', error);
      return [];
    }
  }, []);

  const searchCatalogs = useCallback(async (query: string, filters?: UnifiedSearchFilters): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    try {
      const searchTerm = query.toLowerCase().trim();
      
      let catalogQuery = supabase
        .from('catalogs')
        .select(`
          *,
          business_profiles!inner(
            business_name,
            is_verified,
            city,
            quartier
          )
        `)
        .eq('is_active', true)
        .eq('is_public', true);

      if (filters?.category) {
        catalogQuery = catalogQuery.eq('category', filters.category);
      }

      const { data: catalogs, error: catalogError } = await catalogQuery;
      
      if (catalogError) throw catalogError;

      return catalogs?.map(catalog => {
        let score = 0;
        
        if (catalog.name.toLowerCase().includes(searchTerm)) {
          score += 90;
        }
        
        if (catalog.description && catalog.description.toLowerCase().includes(searchTerm)) {
          score += 40;
        }
        
        if (catalog.keywords && catalog.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchTerm)
        )) {
          score += 30;
        }
        
        if (catalog.synonyms && catalog.synonyms.some((synonym: string) => 
          synonym.toLowerCase().includes(searchTerm)
        )) {
          score += 25;
        }
        
        return {
          id: catalog.id,
          name: catalog.name,
          type: 'catalog' as const,
          title: catalog.name,
          description: catalog.description,
          category: catalog.category,
          verified: catalog.business_profiles?.is_verified,
          score,
          businessId: catalog.business_id,
          catalogId: catalog.id
        } as SearchResult;
      }).filter(item => item.score > 0) || [];
      
    } catch (error) {
      console.error('Error searching catalogs:', error);
      return [];
    }
  }, []);

  const searchProducts = useCallback(async (query: string, filters?: UnifiedSearchFilters): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    try {
      const searchTerm = query.toLowerCase().trim();
      
      let productQuery = supabase
        .from('products')
        .select(`
          *,
          catalogs!inner(
            name,
            category,
            business_id,
            business_profiles!inner(
              business_name,
              is_verified
            )
          )
        `)
        .eq('is_active', true);

      if (filters?.category) {
        productQuery = productQuery.eq('catalogs.category', filters.category);
      }

      const { data: products, error: productError } = await productQuery;
      
      if (productError) throw productError;

      return products?.map(product => {
        let score = 0;
        
        if (product.name.toLowerCase().includes(searchTerm)) {
          score += 80;
        }
        
        if (product.description && product.description.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        if (product.tags && product.tags.some((tag: string) => 
          tag.toLowerCase().includes(searchTerm)
        )) {
          score += 20;
        }
        
        return {
          id: product.id,
          name: product.name,
          type: 'product' as const,
          title: product.name,
          description: product.description,
          category: product.catalogs?.category,
          verified: product.catalogs?.business_profiles?.is_verified,
          score,
          businessId: product.business_id,
          catalogId: product.catalog_id
        } as SearchResult;
      }).filter(item => item.score > 0) || [];
      
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }, []);

  const search = useCallback(async (query: string, filters?: UnifiedSearchFilters) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Recherche parallèle dans toutes les tables
      const [businessResults, catalogResults, productResults] = await Promise.all([
        searchBusinesses(query, filters),
        searchCatalogs(query, filters),
        searchProducts(query, filters)
      ]);

      // Fusion et tri des résultats par score
      const allResults = [...businessResults, ...catalogResults, ...productResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Limite à 20 résultats

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('Erreur lors de la recherche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchBusinesses, searchCatalogs, searchProducts]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    search,
    results,
    loading,
    error,
    clearResults
  };
};