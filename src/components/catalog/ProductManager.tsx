import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Package } from 'lucide-react';
import { RealProductCreationWizard } from '@/components/products/RealProductCreationWizard';
import { useProductManagement } from '@/hooks/use-product-management';
import { adaptProductFormDataToSupabase } from '@/lib/adapters/product-adapter';

interface ProductManagerProps {
  catalogId: string;
  businessId: string;
}

export const ProductManager = ({ catalogId, businessId }: ProductManagerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { createProduct, isCreating } = useProductManagement(businessId, catalogId);

  const handleCreateProduct = async (formData: any) => {
    try {
      const productData = adaptProductFormDataToSupabase(formData, businessId, catalogId);
      await createProduct(productData, {
        onSuccess: () => {
          setShowCreateForm(false);
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Produits du catalogue</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les produits de ce catalogue avec des images 1300×1300px
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Liste des produits - à implémenter plus tard avec useProductManagement */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
          <p className="text-muted-foreground text-center mb-4">
            Ajoutez votre premier produit pour commencer à remplir ce catalogue
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter mon premier produit
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <RealProductCreationWizard 
            onSubmit={handleCreateProduct}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};