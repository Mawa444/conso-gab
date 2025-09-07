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
  const { toast } = useToast();
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
      const { data, error } = await supabase
        .from('catalogs')
        .select(`
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
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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
    const matchesSearch = searchQuery === '' || 
      catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalog.business_profiles?.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = selectedCity === 'all' || catalog.geo_city === selectedCity;
    const matchesCategory = selectedCategory === 'all' || catalog.category === selectedCategory;

    return matchesSearch && matchesCity && matchesCategory;
  });

  const toggleFavorite = (catalogId: string) => {
    setFavorites(prev => 
      prev.includes(catalogId) 
        ? prev.filter(id => id !== catalogId)
        : [...prev, catalogId]
    );
  };

  const handleCatalogClick = (catalog: PublicCatalog) => {
    navigate(`/business/${catalog.business_id}`);
  };

  const cities = [...new Set(catalogs.map(c => c.geo_city).filter(Boolean))];
  const categories = [...new Set(catalogs.map(c => c.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Catalogues" showBack onBack={() => navigate(-1)} />
        <div className="pt-24 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Catalogues" showBack onBack={() => navigate(-1)} />
      
      <div className="pt-24 px-4 pb-8">
        {/* Filtres et recherche */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un catalogue ou commerce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city!}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
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
        {filteredCatalogs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun catalogue trouvé</h3>
              <p className="text-muted-foreground">
                Aucun catalogue ne correspond à vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredCatalogs.map(catalog => (
              <Card 
                key={catalog.id} 
                className="group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleCatalogClick(catalog)}
              >
                <CardContent className="p-4">
                  {viewMode === 'grid' ? (
                    <div className="space-y-4">
                      {/* Image de couverture */}
                      <div className="relative h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden">
                        {catalog.cover_url ? (
                          <img 
                            src={catalog.cover_url} 
                            alt={catalog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Grid3X3 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(catalog.id);
                          }}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(catalog.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>

                      {/* Infos du catalogue */}
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{catalog.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {catalog.business_profiles?.business_name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {catalog.description || "Pas de description disponible"}
                        </p>
                      </div>

                      {/* Badges et infos */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {catalog.category && (
                            <Badge variant="outline" className="text-xs">
                              {catalog.category}
                            </Badge>
                          )}
                          {catalog.geo_city && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {catalog.geo_city}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span>Public</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {/* Image miniature */}
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex-shrink-0 overflow-hidden">
                        {catalog.cover_url ? (
                          <img 
                            src={catalog.cover_url} 
                            alt={catalog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold truncate">{catalog.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {catalog.business_profiles?.business_name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(catalog.id);
                            }}
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(catalog.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {catalog.description || "Pas de description disponible"}
                        </p>

                        <div className="flex items-center gap-2">
                          {catalog.category && (
                            <Badge variant="outline" className="text-xs">
                              {catalog.category}
                            </Badge>
                          )}
                          {catalog.geo_city && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {catalog.geo_city}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};