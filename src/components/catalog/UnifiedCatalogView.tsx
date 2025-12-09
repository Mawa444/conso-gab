/**
 * UnifiedCatalogView - Vue unifiée de tous les catalogues
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Search, Filter, Plus, Eye, EyeOff, 
  BarChart3, Calendar, MapPin 
} from 'lucide-react';
import { usePublicCatalogs } from '@/hooks/use-catalogs';

interface UnifiedCatalogViewProps {
  userId: string;
}

export const UnifiedCatalogView = ({ userId }: UnifiedCatalogViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: catalogs = [], isLoading } = usePublicCatalogs({
    search: searchQuery || undefined,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    limit: 50
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Catalogues publics</h1>
        <p className="text-muted-foreground">
          Découvrez les catalogues des commerces près de chez vous
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{catalogs.length}</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avec livraison</p>
                <p className="text-2xl font-bold">
                  {catalogs.filter(c => c.delivery_available).length}
                </p>
              </div>
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catégories</p>
                <p className="text-2xl font-bold">
                  {new Set(catalogs.map(c => c.category).filter(Boolean)).size}
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un catalogue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="Restauration">Restauration</SelectItem>
            <SelectItem value="Mode">Mode</SelectItem>
            <SelectItem value="Services">Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : catalogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun catalogue trouvé
            </h3>
            <p className="text-muted-foreground text-center">
              Modifiez vos critères de recherche
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Card 
              key={catalog.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
                {catalog.business_profiles?.business_name && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-background/90">
                      {catalog.business_profiles.business_name}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{catalog.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {catalog.description || "Aucune description"}
                    </p>
                  </div>

                  {catalog.category && (
                    <Badge variant="outline" className="text-xs">
                      {catalog.category}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(catalog.created_at)}</span>
                    </div>
                    {catalog.business_profiles?.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{catalog.business_profiles.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
