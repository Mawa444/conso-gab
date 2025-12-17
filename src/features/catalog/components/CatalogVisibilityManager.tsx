import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Package, TrendingUp, Users, Clock } from 'lucide-react';
import { useCatalogManagement } from '@/hooks/use-catalog-management';
import { useProductManagement } from '@/hooks/use-product-management';

interface CatalogVisibilityManagerProps {
  businessId: string;
}

export const CatalogVisibilityManager = ({ businessId }: CatalogVisibilityManagerProps) => {
  const { catalogs, isLoading, toggleVisibility } = useCatalogManagement(businessId);
  const { products } = useProductManagement(businessId);

  const getProductCountForCatalog = (catalogId: string) => {
    return products.filter(p => p.catalog_id === catalogId).length;
  };

  const getVisibilityIcon = (isPublic: boolean) => {
    return isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />;
  };

  const getVisibilityBadge = (isPublic: boolean, isActive: boolean) => {
    if (!isActive) return <Badge variant="secondary">Inactif</Badge>;
    return isPublic ? 
      <Badge className="bg-green-100 text-green-800">Publié</Badge> : 
      <Badge variant="outline">Privé</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!catalogs || catalogs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun catalogue trouvé</h3>
          <p className="text-muted-foreground text-center">
            Vos catalogues créés apparaîtront ici pour gestion de la visibilité
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestion de la visibilité</h3>
          <p className="text-sm text-muted-foreground">
            Contrôlez qui peut voir vos catalogues et produits
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {catalogs.filter(c => c.is_public).length} / {catalogs.length} publiés
        </Badge>
      </div>

      <div className="grid gap-4">
        {catalogs.map((catalog) => {
          const productCount = getProductCountForCatalog(catalog.id);
          return (
            <Card key={catalog.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{catalog.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{productCount} produits</span>
                          {catalog.seo_score !== null && (
                            <>
                              <TrendingUp className="w-3 h-3 ml-2" />
                              <span>SEO: {catalog.seo_score}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {getVisibilityBadge(catalog.is_public || false, catalog.is_active || false)}
                      {catalog.category && (
                        <Badge variant="outline" className="text-xs">
                          {catalog.category}
                        </Badge>
                      )}
                    </div>

                    {catalog.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {catalog.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Mis à jour le {new Date(catalog.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant={catalog.is_public ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleVisibility({ 
                        catalogId: catalog.id, 
                        isPublic: !catalog.is_public 
                      })}
                      className="flex items-center gap-2"
                    >
                      {getVisibilityIcon(catalog.is_public || false)}
                      {catalog.is_public ? 'Publié' : 'Privé'}
                    </Button>
                    
                    {!catalog.is_active && (
                      <p className="text-xs text-muted-foreground text-center">
                        Catalogue désactivé
                      </p>
                    )}
                  </div>
                </div>

                {!catalog.is_public && (
                  <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600">
                      Ce catalogue est privé et n'apparaît pas dans les recherches publiques
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
