import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation } from './use-user-location';
import { useGeoLocation } from "@/features/geolocation/hooks/useGeoLocation";

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
  cover_image_url?: string;
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
  const { position } = useGeoLocation();

  const search = useCallback(async (query: string, filters?: UnifiedSearchFilters) => {
    // If no position, we can't do geo-search effectively. 
    // Fallback? Ideally we should have a default position or IP-based one, 
    // but the RPCs require coords. 
    // If position is null, we can pass 0,0 and large radius, or handle gracefully.
    // For this implementation, let's assume position is available or use defaults (Libreville).
    const lat = position?.latitude || 0.4162; // Libreville fallback
    const lng = position?.longitude || 9.4673;

    if (!query.trim() && !filters?.category) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchTerm = query.trim() || null;
      
      // 1. Search Businesses via RPC
      const businessPromise = supabase.rpc('get_nearest_businesses' as any, {
        lat,
        lng,
        radius_meters: 500000, // Large radius for search (500km)
        limit_count: 10,
        search_query: searchTerm,
        category_filter: filters?.category || null
      });

      // 2. Search Catalogs via RPC
      const catalogPromise = supabase.rpc('get_nearest_catalogs' as any, {
        lat,
        lng,
        radius_meters: 500000,
        limit_count: 10,
        search_query: searchTerm
      });

      // 3. Search Products via RPC
      const productPromise = supabase.rpc('get_nearest_products' as any, {
        lat,
        lng,
        radius_meters: 500000,
        limit_count: 10,
        search_query: searchTerm
      });

      const [businessResponse, catalogResponse, productResponse] = await Promise.all([
        businessPromise,
        catalogPromise,
        productPromise
      ]);

      if (businessResponse.error) throw businessResponse.error;
      if (catalogResponse.error) throw catalogResponse.error;
      if (productResponse.error) throw productResponse.error;

      // Transform Results
      const businessResults: SearchResult[] = (businessResponse.data || []).map((b: any) => ({
        id: b.id,
        name: b.business_name,
        type: 'business',
        title: b.business_name,
        description: b.business_category, // RPC doesn't return description yet, using category
        category: b.business_category,
        address: b.city,
        verified: true, // Assuming active businesses in RPC are verified enough
        score: 1, // RPC already sorts by distance
        businessId: b.id,
        latitude: b.latitude,
        longitude: b.longitude,
        distance_meters: b.distance_meters,
        cover_image_url: b.cover_image_url,
        distance: b.distance_meters < 1000 
          ? `${Math.round(b.distance_meters)}m` 
          : `${(b.distance_meters / 1000).toFixed(1)}km`
      }));

      const catalogResults: SearchResult[] = (catalogResponse.data || []).map((c: any) => ({
        id: c.id,
        name: c.title,
        type: 'catalog',
        title: c.title,
        description: c.description,
        category: 'Catalogue',
        verified: true,
        score: 1,
        businessId: c.business_id,
        catalogId: c.id,
        distance_meters: c.distance_meters,
        distance: c.distance_meters < 1000 
          ? `${Math.round(c.distance_meters)}m` 
          : `${(c.distance_meters / 1000).toFixed(1)}km`
      }));

      const productResults: SearchResult[] = (productResponse.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'product',
        title: p.name,
        description: p.description,
        category: 'Produit',
        verified: true,
        score: 1,
        businessId: p.business_id,
        catalogId: p.catalog_id,
        distance_meters: p.distance_meters,
        distance: p.distance_meters < 1000 
          ? `${Math.round(p.distance_meters)}m` 
          : `${(p.distance_meters / 1000).toFixed(1)}km`
      }));

      // Combine and Sort by Distance (RPC sorts by distance each, but combining needs re-sort)
      const combined = [...businessResults, ...catalogResults, ...productResults].sort((a, b) => 
        (a.distance_meters || 0) - (b.distance_meters || 0)
      );

      setResults(combined);

    } catch (error) {
      console.error('Unified Search Error:', error);
      setError("Une erreur est survenue lors de la recherche.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [position]);

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
