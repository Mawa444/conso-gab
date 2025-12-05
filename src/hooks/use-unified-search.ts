import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation } from './use-user-location';

// Fonction pour calculer la distance entre deux points (Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
};

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
  latitude?: number;
  longitude?: number;
  distance_meters?: number;
}

export interface UnifiedSearchFilters {
  location?: string;
  category?: string;
  verified?: boolean;
  minRating?: number;
  businessType?: string;
  subcategory?: string;
}

export const useUnifiedSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { location: userLocation } = useUserLocation();

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
        businessQuery = businessQuery.eq('business_category', filters.category as any);
      }

      if (filters?.location) {
        businessQuery = businessQuery.or(`city.ilike.%${filters.location}%,quartier.ilike.%${filters.location}%,department.ilike.%${filters.location}%`);
      }

      const { data: allBusinesses } = await businessQuery;

      const businessResults: SearchResult[] = [];
      
      allBusinesses?.forEach((business: any) => {
        let score = 0;
        
        // Recherche dans le nom de l'entreprise
        if (business.business_name?.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        // Recherche dans la description
        if (business.description?.toLowerCase().includes(searchTerm)) {
          score += 60;
        }
        
        // Recherche dans l'adresse et localisation
        if (business.address?.toLowerCase().includes(searchTerm)) {
          score += 40;
        }
        
        if (business.quartier?.toLowerCase().includes(searchTerm)) {
          score += 30;
        }

        if (business.city?.toLowerCase().includes(searchTerm)) {
          score += 25;
        }

        // Recherche floue
        const businessWords = (business.business_name || '').toLowerCase().split(' ');
        const queryWords = searchTerm.split(' ');
        
        queryWords.forEach(queryWord => {
          businessWords.forEach(businessWord => {
            if (businessWord.startsWith(queryWord) && queryWord.length >= 2) {
              score += 10;
            }
          });
        });
        
        if (business.is_verified) score += 15;
        
        if (score > 0) {
          businessResults.push({
            id: business.id,
            name: business.business_name,
            type: 'business' as const,
            title: business.business_name,
            description: business.description,
            category: business.business_category,
            address: `${business.address || ''} ${business.quartier || ''} ${business.city || ''}`.trim(),
            verified: business.is_verified,
            score,
            businessId: business.id,
            latitude: business.latitude ? Number(business.latitude) : undefined,
            longitude: business.longitude ? Number(business.longitude) : undefined
          });
        }
      });
      
      return businessResults.filter(item => item.score > 0);
      
    } catch (error) {
      console.error('Error searching businesses:', error);
      return [];
    }
  }, []);

  const searchCatalogs = useCallback(async (query: string, filters?: UnifiedSearchFilters): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    try {
      const searchTerm = query.toLowerCase().trim();
      
      const { data: catalogs, error: catalogError } = await (supabase as any)
        .from('catalogs')
        .select(`
          *,
          business_profiles (
            business_name,
            is_verified,
            city,
            quartier,
            latitude,
            longitude
          )
        `)
        .eq('is_active', true);

      if (catalogError) throw catalogError;

      return catalogs?.map((catalog: any) => {
        let score = 0;
        
        if (catalog.name?.toLowerCase().includes(searchTerm)) {
          score += 90;
        }
        
        if (catalog.description?.toLowerCase().includes(searchTerm)) {
          score += 40;
        }
        
        if (catalog.keywords && Array.isArray(catalog.keywords)) {
          catalog.keywords.forEach((keyword: string) => {
            if (keyword?.toLowerCase().includes(searchTerm)) {
              score += 30;
            }
          });
        }
        
        if (catalog.synonyms && Array.isArray(catalog.synonyms)) {
          catalog.synonyms.forEach((synonym: string) => {
            if (synonym?.toLowerCase().includes(searchTerm)) {
              score += 25;
            }
          });
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
          catalogId: catalog.id,
          latitude: catalog.business_profiles?.latitude ? Number(catalog.business_profiles.latitude) : undefined,
          longitude: catalog.business_profiles?.longitude ? Number(catalog.business_profiles.longitude) : undefined
        } as SearchResult;
      }).filter((item: SearchResult) => item.score > 0) || [];
      
    } catch (error) {
      console.error('Error searching catalogs:', error);
      return [];
    }
  }, []);

  const searchProducts = useCallback(async (query: string, filters?: UnifiedSearchFilters): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    try {
      const searchTerm = query.toLowerCase().trim();
      
      const { data: products, error: productError } = await (supabase as any)
        .from('products')
        .select(`
          *,
          business_profiles (
            business_name,
            is_verified,
            latitude,
            longitude
          )
        `)
        .eq('is_available', true);

      if (productError) throw productError;

      return products?.map((product: any) => {
        let score = 0;
        
        if (product.name?.toLowerCase().includes(searchTerm)) {
          score += 80;
        }
        
        if (product.description?.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            if (tag?.toLowerCase().includes(searchTerm)) {
              score += 20;
            }
          });
        }
        
        return {
          id: product.id,
          name: product.name,
          type: 'product' as const,
          title: product.name,
          description: product.description,
          category: product.category,
          verified: product.business_profiles?.is_verified,
          score,
          businessId: product.business_id,
          catalogId: product.catalog_id,
          latitude: product.business_profiles?.latitude ? Number(product.business_profiles.latitude) : undefined,
          longitude: product.business_profiles?.longitude ? Number(product.business_profiles.longitude) : undefined
        } as SearchResult;
      }).filter((item: SearchResult) => item.score > 0) || [];
      
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

      // Calculer la distance pour chaque résultat
      const resultsWithDistance = [...businessResults, ...catalogResults, ...productResults].map(result => {
        if (result.latitude && result.longitude && userLocation?.latitude && userLocation?.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            result.latitude,
            result.longitude
          );
          return {
            ...result,
            distance_meters: distance,
            distance: distance < 1000 
              ? `${Math.round(distance)}m`
              : `${(distance / 1000).toFixed(1)}km`
          };
        }
        return result;
      });
      
      // Trier par distance (du plus proche au plus éloigné)
      resultsWithDistance.sort((a, b) => {
        const distA = a.distance_meters || Infinity;
        const distB = b.distance_meters || Infinity;
        return distA - distB;
      });
      
      // Limiter à 20 résultats
      setResults(resultsWithDistance.slice(0, 20));
    } catch (error) {
      console.error('Search error:', error);
      setError('Erreur lors de la recherche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchBusinesses, searchCatalogs, searchProducts, userLocation]);

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
