import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Calendar, Store } from "lucide-react";
import { useCatalogs, CatalogInteractionModal, CatalogCard } from "@/features/catalog";
import { Catalog } from "@/types/entities/catalog.types";

interface BusinessCatalogViewProps {
  businessId: string;
  businessName: string;
}

export const BusinessCatalogView = ({ businessId, businessName }: BusinessCatalogViewProps) => {
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  
  const { data: catalogsRaw, isLoading } = useCatalogs(businessId);
  const catalogs = catalogsRaw || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const catalogList = (catalogs as Catalog[]) || [];

  if (catalogList.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun catalogue</h3>
          <p className="text-muted-foreground">
            Cette entreprise n'a pas encore ajouté de produits ou services.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Séparer produits et services
  const products = catalogList.filter(c => c.catalog_type === 'products');
  const services = catalogList.filter(c => c.catalog_type === 'services');

  // Adapter function removed as types are now unified

  return (
    <div className="space-y-8">
      {/* Produits */}
      {products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produits ({products.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(catalog => (
              <CatalogCard 
                key={catalog.id}
                businessId={businessId}
                catalog={catalog}
                showActions={false}
                onClick={() => setSelectedCatalog(catalog)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Services ({services.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {services.map(catalog => (
              <CatalogCard 
                key={catalog.id}
                businessId={businessId}
                catalog={catalog}
                showActions={false}
                onClick={() => setSelectedCatalog(catalog)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal d'interaction */}
      {selectedCatalog && (
        <CatalogInteractionModal
          catalog={selectedCatalog as any}
          businessName={businessName}
          open={!!selectedCatalog}
          onClose={() => setSelectedCatalog(null)}
        />
      )}
    </div>
  );
};
