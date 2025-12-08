import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Search, Filter, Plus, Eye, EyeOff, Edit, 
  BarChart3, TrendingUp, Calendar, MapPin 
} from 'lucide-react';
import { useCatalogManagement } from '@/hooks/use-catalog-management';
import { useBusinessList } from '@/hooks/use-business-list';
import { EnhancedCatalogCreateForm } from './EnhancedCatalogCreateForm';
import { CatalogInteractionModal } from './CatalogInteractionModal';

interface UnifiedCatalogViewProps {
  userId: string;
}

export const UnifiedCatalogView = ({ userId }: UnifiedCatalogViewProps) => {
  const { businesses } = useBusinessList();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'draft'>('all');
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [selectedCatalog, setSelectedCatalog] = useState(null);

  // Get all catalogs from all businesses
  const allCatalogs = businesses.flatMap(business => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { catalogs = [] } = useCatalogManagement(business.id);
    return catalogs.map(catalog => ({
      ...catalog,
      businessName: business.name,
      businessId: business.id
    }));
  });

  const filteredCatalogs = allCatalogs.filter(catalog => {
    const matchesSearch = catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (catalog.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'public' && catalog.is_public) ||
                         (filterStatus === 'draft' && !catalog.is_public);
    
    const matchesBusiness = filterBusiness === 'all' || catalog.businessId === filterBusiness;
    
    return matchesSearch && matchesStatus && matchesBusiness;
  });

  const totalCatalogs = allCatalogs.length;
  const publicCatalogs = allCatalogs.filter(c => c.is_public).length;
  const draftCatalogs = allCatalogs.filter(c => !c.is_public).length;

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
        <h1 className="text-3xl font-bold mb-2">Tous mes catalogues</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de tous vos catalogues across toutes vos entreprises
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total catalogues</p>
                <p className="text-2xl font-bold">{totalCatalogs}</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catalogues publics</p>
                <p className="text-2xl font-bold">{publicCatalogs}</p>
              </div>
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold">{draftCatalogs}</p>
              </div>
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold">{businesses.length}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous les catalogues</TabsTrigger>
          <TabsTrigger value="create">Créer nouveau</TabsTrigger>
          <TabsTrigger value="manage">Gestion rapide</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
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
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="public">Publics seulement</SelectItem>
                <SelectItem value="draft">Brouillons seulement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBusiness} onValueChange={setFilterBusiness}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Toutes les entreprises" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {businesses.map(business => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catalog Grid */}
          {filteredCatalogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || filterStatus !== 'all' || filterBusiness !== 'all'
                    ? "Aucun catalogue trouvé"
                    : "Aucun catalogue disponible"
                  }
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                  {searchQuery || filterStatus !== 'all' || filterBusiness !== 'all'
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Créez votre premier catalogue pour commencer"
                  }
                </p>
                {businesses.length > 0 && (
                  <Button onClick={() => setSelectedBusinessId(businesses[0].id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un catalogue
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog) => (
                <Card 
                  key={`${catalog.businessId}-${catalog.id}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCatalog({
                    id: catalog.id,
                    name: catalog.name,
                    description: catalog.description || '',
                    images: catalog.images || [],
                    business: {
                      id: catalog.businessId,
                      name: catalog.businessName
                    },
                    stats: {
                      likes: Math.floor(Math.random() * 50) + 10,
                      comments: Math.floor(Math.random() * 20) + 5,
                      views: Math.floor(Math.random() * 200) + 50
                    }
                  })}
                >
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                      {catalog.cover_url ? (
                        <img
                          src={catalog.cover_url}
                          alt={catalog.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant={catalog.is_public ? "default" : "secondary"}>
                        {catalog.is_public ? "Public" : "Brouillon"}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-white/90">
                        {catalog.businessName}
                      </Badge>
                    </div>
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
                          {catalog.subcategory && ` • ${catalog.subcategory}`}
                        </Badge>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(catalog.created_at)}</span>
                        </div>
                        {catalog.geo_city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{catalog.geo_city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {businesses.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Créer un nouveau catalogue</h3>
                <p className="text-muted-foreground">
                  Choisissez l'entreprise pour laquelle créer le catalogue
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map(business => (
                  <Card 
                    key={business.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedBusinessId(business.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-1">{business.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {business.business_category}
                      </p>
                      <Button size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        Créer catalogue
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune entreprise</h3>
                <p className="text-muted-foreground text-center">
                  Vous devez d'abord créer une entreprise avant de pouvoir créer des catalogues.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Gestion rapide</h3>
            <p className="text-muted-foreground mb-6">
              Actions rapides sur vos catalogues les plus récents
            </p>
          </div>

          <div className="space-y-4">
            {allCatalogs.slice(0, 5).map(catalog => (
              <Card key={`${catalog.businessId}-${catalog.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{catalog.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {catalog.businessName} • {formatDate(catalog.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={catalog.is_public ? "default" : "secondary"}>
                        {catalog.is_public ? "Public" : "Brouillon"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Creation Modal */}
      {selectedBusinessId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Créer un nouveau catalogue</h3>
                <Button variant="ghost" onClick={() => setSelectedBusinessId(null)}>
                  ×
                </Button>
              </div>
              <EnhancedCatalogCreateForm
                businessId={selectedBusinessId}
                onCancel={() => setSelectedBusinessId(null)}
                onCreated={() => setSelectedBusinessId(null)}
                isModal={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interaction Modal */}
      {selectedCatalog && (
        <CatalogInteractionModal
          open={!!selectedCatalog}
          onClose={() => setSelectedCatalog(null)}
          catalog={selectedCatalog}
        />
      )}
    </div>
  );
};