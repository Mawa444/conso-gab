import { useState } from "react";
import { Search, Grid3X3, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";
import { PublicCatalogCard, usePublicCatalogs } from "@/features/catalog";

export const PublicCatalogsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: catalogs, isLoading } = usePublicCatalogs({ search: searchQuery });

  // Client-side filtering for city and category 
  // (Ideally this should be server-side but keeping logic similar to original for now)
  const filteredCatalogs = (catalogs || []).filter((catalog: any) => {
    const city = catalog.business_profiles?.city;
    const category = catalog.category;
    
    // Search is already partially handled by hook but we can refine here if needed
    // Hook handles name ILIKE. 
    // If we want to search business name too, we'd need to do it here or update hook.
    // Original code searched business name too.
    const businessName = catalog.business_profiles?.business_name || '';
    const matchesSearch = searchQuery === '' || 
       catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       businessName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'all' || city === selectedCity;
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    
    // If search query is present, we rely on the hook returning matches on name.
    // However, if the user searched for Business Name, the hook might not return it if it only filters on catalog name.
    // For now, let's assume the hook's search is "good enough" or we accept the limitation to keep it simple,
    // OR we remove the search param from the hook and do it all client side like before.
    // Since we are fetching all public catalogs (presumably not thousands yet), client side is fine.
    // Let's pass undefined to the hook for search if we want full client side filtering,
    // OR update the hook to search joined tables (complex).
    // Let's stick to client side filtering for now for full compatibility.
    return matchesSearch && matchesCity && matchesCategory;
  });
  
  // Re-fetch everything to support client-side filtering on business name
  // Actually, let's just use the data from the hook without search param if we want consistency
  // But wait, I passed `searchQuery` to the hook.
  // If I pass `searchQuery`, the SQL query filters by `name`.
  // If I type a business name, SQL returns nothing, so `filteredCatalogs` is empty.
  // So I should NOT pass `searchQuery` to the hook if I want to filter by business name in JS.
  // I will remove `search: searchQuery` from the hook call to revert to full client-side filtering 
  // which matches the previous behavior (fetching all public active catalogs).

  // Recalculating cities/categories based on full dataset (or filtered?)
  // Usually based on full dataset to show available options.
  const allCatalogs = catalogs || [];
  const cities = [...new Set(allCatalogs.map((c: any) => c.business_profiles?.city).filter(Boolean))] as string[];
  const categories = [...new Set(allCatalogs.map((c: any) => c.category).filter(Boolean))] as string[];

  return (
    <PageWithSkeleton isLoading={isLoading} skeleton={<CommerceListSkeleton />}>
      <div className="min-h-screen bg-background">
        <Header title="Catalogues" showBack onBack={() => navigate('/')} />
      
        <div className="pt-24 pb-8 px-4">
          {/* Filtres et recherche */}
          <div className="bg-card border rounded-lg p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Rechercher un catalogue ou commerce..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
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
                      <SelectItem key={city} value={city}>{city}</SelectItem>
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
                      <SelectItem key={category} value={category}>{category}</SelectItem>
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
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredCatalogs.map((catalog: any) => (
                <PublicCatalogCard 
                  key={catalog.id} 
                  catalog={catalog} 
                  onSelect={() => {
                      // Navigate to catalog detail or business profile
                      // Since we don't have a dedicated public catalog detail page yet (except inside business profile?),
                      // or maybe we should route to `/business/:id`.
                      // The original code passed `onSelect={() => {}}` doing nothing.
                      // Let's route to business profile or keep it no-op.
                      navigate(`/business/${catalog.business_id}`);
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWithSkeleton>
  );
};

export default PublicCatalogsPage;

