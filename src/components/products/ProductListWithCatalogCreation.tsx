import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Trash2, ImageIcon } from 'lucide-react';
import { useProductManagement } from '@/hooks/use-product-management';
import { useCatalogManagement } from '@/hooks/use-catalog-management';
import { EnhancedProductCreationWizard } from './EnhancedProductCreationWizard';

interface ProductListWithCatalogCreationProps {
  businessId: string;
  catalogId?: string;
  showCatalogCreation?: boolean;
}

export const ProductListWithCatalogCreation = ({ 
  businessId, 
  catalogId,
  showCatalogCreation = true 
}: ProductListWithCatalogCreationProps) => {
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { products, isLoading, deleteProduct } = useProductManagement(businessId, catalogId);
  const { catalogs } = useCatalogManagement(businessId);

  const filteredProducts = catalogId 
    ? products.filter(p => p.catalog_id === catalogId)
    : products;

  const handleCreateProduct = () => {
    setShowCreateProduct(true);
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setShowCreateProduct(true);
  };

  const handleProductComplete = () => {
    setShowCreateProduct(false);
    setSelectedProductId(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteProduct(productId);
    }
  };

  if (showCreateProduct) {
    return (
        <EnhancedProductCreationWizard
          onComplete={handleProductComplete}
          onCancel={handleProductComplete}
          businessId={businessId}
          businessCategory="commerce_distribution"
        />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Produits</h3>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {catalogId ? 'Produits du catalogue' : 'Tous les produits'}
          </h3>
          <Button onClick={handleCreateProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
            <p className="text-muted-foreground text-center mb-4">
              {catalogId 
                ? 'Ce catalogue ne contient encore aucun produit' 
                : 'Vous n\'avez pas encore de produit'
              }
            </p>
            <Button onClick={handleCreateProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter mon premier produit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to safely get images
  const getProductImages = (product: any): string[] => {
    if (!product.images) return [];
    if (Array.isArray(product.images)) {
      return product.images.map((img: any) => typeof img === 'string' ? img : img?.url || '');
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {catalogId ? 'Produits du catalogue' : 'Tous les produits'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
            {catalogId && catalogs.length > 0 && ` dans ce catalogue`}
          </p>
        </div>
        <Button onClick={handleCreateProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: any) => {
          const catalog = catalogs.find(c => c.id === product.catalog_id);
          const productImages = getProductImages(product);
          const isActive = product.is_available !== false;
          
          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative overflow-hidden">
                {productImages.length > 0 ? (
                  <img 
                    src={productImages[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {isActive ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">Actif</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactif</Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold truncate">{product.name}</h4>
                    {catalog && (
                      <p className="text-sm text-muted-foreground">
                        Catalogue: {catalog.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">
                      <span>{product.price} FCFA</span>
                    </div>
                    <div className="text-muted-foreground">
                      Stock: {product.stock_quantity || 0}
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product.id)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};