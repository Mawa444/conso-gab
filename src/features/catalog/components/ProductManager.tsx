import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

interface ProductManagerProps {
  catalogId: string;
  businessId: string;
}

export const ProductManager = ({ catalogId, businessId }: ProductManagerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

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

      {/* Liste des produits - à implémenter */}
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
    </div>
  );
};
