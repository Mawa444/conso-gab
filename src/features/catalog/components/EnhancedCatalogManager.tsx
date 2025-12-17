import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, EyeOff, Edit, Trash2, Package, TrendingUp } from 'lucide-react';
import { useCatalogManagement } from '@/hooks/use-catalog-management';
import { ProductManager } from './ProductManager';
import { SEOScoreCoach } from './SEOScoreCoach';
import { CatalogCreateForm } from './CatalogCreateForm';

interface EnhancedCatalogManagerProps {
  businessId: string;
}

export const EnhancedCatalogManager = ({ businessId }: EnhancedCatalogManagerProps) => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const {
    catalogs,
    isLoading,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    toggleVisibility,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling
  } = useCatalogManagement(businessId);

  const handleToggleVisibility = async (catalogId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'public' ? 'draft' : 'public';
    await toggleVisibility({ catalogId, isPublic: newVisibility === 'public' });
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Badge variant="default" className="bg-green-500">Publié</Badge>;
      case 'private':
        return <Badge variant="secondary">Privé</Badge>;
      default:
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default">Exemplaire</Badge>;
    if (score >= 75) return <Badge variant="secondary">Très bon</Badge>;
    if (score >= 50) return <Badge variant="outline">À améliorer</Badge>;
    return <Badge variant="destructive">Insuffisant</Badge>;
  };

  if (showCreateWizard) {
    return (
      <div className="max-w-3xl mx-auto">
        <CatalogCreateForm
          businessId={businessId}
          onCancel={() => setShowCreateWizard(false)}
          onCreated={() => setShowCreateWizard(false)}
          isModal={false}
        />
      </div>
    );
  }

  if (selectedCatalog) {
    const catalog = catalogs.find(c => c.id === selectedCatalog);
    if (!catalog) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCatalog(null)}
            >
              ← Retour
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{catalog.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getVisibilityBadge(catalog.visibility || 'draft')}
                {getScoreBadge(catalog.seo_score || 0)}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="seo">Coach SEO</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Gestion des produits prochainement disponible pour ce catalogue</p>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <SEOScoreCoach 
              data={{
                name: catalog.name,
                category: catalog.category,
                subcategory: catalog.subcategory,
                keywords: catalog.keywords,
                synonyms: catalog.synonyms,
                geo_city: catalog.geo_city,
                geo_district: catalog.geo_district,
                cover_url: catalog.cover_url
              }}
              type="catalog"
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du catalogue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Visibilité</h4>
                    <p className="text-sm text-muted-foreground">
                      {catalog.visibility === 'public' ? 'Visible par tous les utilisateurs' : 'Visible uniquement par vous'}
                    </p>
                  </div>
                  <Button
                    variant={catalog.visibility === 'public' ? 'outline' : 'default'}
                    onClick={() => handleToggleVisibility(catalog.id, catalog.visibility || 'draft')}
                    disabled={isToggling}
                  >
                    {catalog.visibility === 'public' ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Retirer
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Publier
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce catalogue ?')) {
                        deleteCatalog(catalog.id);
                        setSelectedCatalog(null);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le catalogue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Catalogues</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos catalogues produits avec images 1300×1300px
          </p>
        </div>
        <Button onClick={() => setShowCreateWizard(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un catalogue
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg" />
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
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun catalogue</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre premier catalogue pour commencer à présenter vos produits
            </p>
            <Button onClick={() => setShowCreateWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier catalogue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Card 
              key={catalog.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCatalog(catalog.id)}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                {catalog.cover_url ? (
                  <img 
                    src={catalog.cover_url} 
                    alt={catalog.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {getVisibilityBadge(catalog.visibility || 'draft')}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{catalog.name}</h3>
                    {catalog.category && (
                      <p className="text-sm text-muted-foreground">
                        {catalog.category} {catalog.subcategory && `• ${catalog.subcategory}`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Score SEO</span>
                    </div>
                    {getScoreBadge(catalog.seo_score || 0)}
                  </div>

                  {catalog.keywords && catalog.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {catalog.keywords.slice(0, 3).map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {catalog.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{catalog.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="pt-2 border-t flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(catalog.id, catalog.visibility || 'draft');
                      }}
                      disabled={isToggling}
                      className="flex-1"
                    >
                      {catalog.visibility === 'public' ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Retirer
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Publier
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCatalog(catalog.id);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Gérer
                    </Button>
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
