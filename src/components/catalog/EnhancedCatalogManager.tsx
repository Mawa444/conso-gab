/**
 * EnhancedCatalogManager - Simplifié, utilise le nouveau hook useCatalogs
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, EyeOff, Edit, Trash2, Package, TrendingUp, ArrowLeft } from 'lucide-react';
import { useCatalogs, Catalog } from '@/hooks/use-catalogs';
import { CatalogForm } from './CatalogForm';

interface EnhancedCatalogManagerProps {
  businessId: string;
}

export const EnhancedCatalogManager = ({ businessId }: EnhancedCatalogManagerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);

  const {
    catalogs,
    isLoading,
    deleteCatalog,
    toggleVisibility,
    isDeleting
  } = useCatalogs(businessId);

  const handleToggleVisibility = async (catalog: Catalog) => {
    await toggleVisibility(catalog.id, !catalog.is_public);
  };

  const getVisibilityBadge = (isPublic: boolean) => {
    return isPublic 
      ? <Badge variant="default" className="bg-green-500">Publié</Badge>
      : <Badge variant="outline">Brouillon</Badge>;
  };

  // Mode création/édition
  if (showCreateForm || editingCatalog) {
    return (
      <div className="max-w-3xl mx-auto">
        <CatalogForm
          businessId={businessId}
          catalog={editingCatalog || undefined}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingCatalog(null);
          }}
          onSuccess={() => {
            setShowCreateForm(false);
            setEditingCatalog(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Catalogues</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos catalogues produits
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Créer
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
              Créez votre premier catalogue
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Card 
              key={catalog.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground" />
                <div className="absolute top-2 right-2">
                  {getVisibilityBadge(catalog.is_public || false)}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{catalog.name}</h3>
                    {catalog.category && (
                      <p className="text-sm text-muted-foreground">
                        {catalog.category}
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleVisibility(catalog)}
                      className="flex-1"
                    >
                      {catalog.is_public ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Masquer
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
                      onClick={() => setEditingCatalog(catalog)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
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
