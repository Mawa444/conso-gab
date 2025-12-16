import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Calendar, Store } from "lucide-react"; // Keep only used icons
import { useCatalogs, CatalogInteractionModal } from "@/features/catalog";
import { EnhancedCatalogCard } from "@/features/catalog/components/EnhancedCatalogCard"; // Import new card
import type { CatalogData } from "@/lib/supabase-helpers";

interface BusinessCatalogViewProps {
  businessId: string;
  businessName: string;
  businessLocation?: {
    city?: string;
    district?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export const BusinessCatalogView = ({ businessId, businessName, businessLocation }: BusinessCatalogViewProps) => {
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogData | null>(null);
  
  const { data: catalogsRaw, isLoading } = useCatalogs(businessId);
  const catalogs = catalogsRaw || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-[350px] bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const catalogList = (catalogs as unknown as CatalogData[]) || [];

  if (catalogList.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed">
        <CardContent>
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Aucun catalogue</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Cette entreprise n'a pas encore ajouté de produits ou services à sa vitrine.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Séparer produits et services
  const products = catalogList.filter(c => c.catalog_type === 'products');
  const services = catalogList.filter(c => c.catalog_type === 'services');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Produits */}
      {products.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Produits <span className="text-muted-foreground text-sm font-normal">({products.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(catalog => (
              <EnhancedCatalogCard 
                key={catalog.id} 
                catalog={catalog}
                businessName={businessName}
                businessLocation={businessLocation}
                onView={() => setSelectedCatalog(catalog)}
                onContact={() => setSelectedCatalog(catalog)} // Or open chat directly
                // isLiked={...} // Implement like logic if needed
              />
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Services <span className="text-muted-foreground text-sm font-normal">({services.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(catalog => (
              <EnhancedCatalogCard 
                key={catalog.id} 
                catalog={catalog}
                businessName={businessName}
                businessLocation={businessLocation}
                onView={() => setSelectedCatalog(catalog)}
                onContact={() => setSelectedCatalog(catalog)}
              />
            ))}
          </div>
        </section>
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
