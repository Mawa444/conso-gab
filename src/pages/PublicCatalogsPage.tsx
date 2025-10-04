import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, List, Star, MapPin, Clock, Heart, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";
import { CatalogCard } from "@/components/catalog/CatalogCard";
interface PublicCatalog {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  business_id: string;
  created_at: string;
  geo_city: string | null;
  category: string | null;
  seo_score: number | null;
  business_profiles?: {
    business_name: string;
    business_category: string;
    address: string | null;
    phone: string | null;
  };
}
export const PublicCatalogsPage = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [catalogs, setCatalogs] = useState<PublicCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    fetchPublicCatalogs();
  }, []);
  const fetchPublicCatalogs = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('catalogs').select(`
          id,
          name,
          description,
          cover_url,
          business_id,
          created_at,
          geo_city,
          category,
          seo_score,
          business_profiles!inner (
            business_name,
            business_category,
            address,
            phone
          )
        `).eq('is_public', true).eq('is_active', true).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setCatalogs(data || []);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catalogues.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const filteredCatalogs = catalogs.filter(catalog => {
    const matchesSearch = searchQuery === '' || catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) || catalog.business_profiles?.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || catalog.geo_city === selectedCity;
    const matchesCategory = selectedCategory === 'all' || catalog.category === selectedCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });
  const toggleFavorite = (catalogId: string) => {
    setFavorites(prev => prev.includes(catalogId) ? prev.filter(id => id !== catalogId) : [...prev, catalogId]);
  };
  const handleCatalogClick = (catalog: PublicCatalog) => {
    // L'interaction se fait maintenant via CatalogCard qui ouvre CatalogInteractionModal
  };
  const cities = [...new Set(catalogs.map(c => c.geo_city).filter(Boolean))];
  const categories = [...new Set(catalogs.map(c => c.category).filter(Boolean))];
  return <PageWithSkeleton isLoading={isLoading} skeleton={<CommerceListSkeleton />}>
      <div className="min-h-screen bg-background">
        <Header title="Catalogues" showBack onBack={() => navigate('/')} />
      
      <div className="pt-24 pb-8 px-0 py-[39px]">
        {/* Filtres et recherche */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Rechercher un catalogue ou commerce..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.map(city => <SelectItem key={city} value={city!}>{city}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(category => <SelectItem key={category} value={category!}>{category}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            {filteredCatalogs.length} catalogue(s) trouvé(s)
          </p>
        </div>

        {/* Liste des catalogues */}
        {filteredCatalogs.length === 0 ? <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun catalogue trouvé</h3>
              <p className="text-muted-foreground">
                Aucun catalogue ne correspond à vos critères de recherche.
              </p>
            </CardContent>
          </Card> : <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredCatalogs.map(catalog => {
            // Convertir PublicCatalog vers le format attendu par CatalogCard
            const catalogForCard = {
              id: catalog.id,
              name: catalog.name,
              description: catalog.description,
              category: catalog.category,
              subcategory: null,
              catalog_type: 'products' as const,
              cover_image_url: catalog.cover_url,
              business_id: catalog.business_id,
              geo_city: catalog.geo_city,
              is_public: true,
              is_active: true,
              created_at: catalog.created_at,
              business: {
                business_name: catalog.business_profiles?.business_name || 'Commerce',
                user_id: 'unknown'
              }
            };
            return <CatalogCard key={catalog.id} catalog={catalogForCard} onSelect={cat => {
              // L'interaction se fait via le modal intégré dans CatalogCard
            }} />;
          })}
          </div>}
        </div>
      </div>
    </PageWithSkeleton>;
};
export default PublicCatalogsPage;