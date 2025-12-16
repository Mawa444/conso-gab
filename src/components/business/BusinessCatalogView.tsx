import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Calendar, Store } from "lucide-react";
import { useCatalogs, CatalogInteractionModal, CatalogCard } from "@/features/catalog";
import type { CatalogData } from "@/lib/supabase-helpers";
import { Catalog } from "@/features/catalog/types";

interface BusinessCatalogViewProps {
  businessId: string;
  businessName: string;
}

export const BusinessCatalogView = ({ businessId, businessName }: BusinessCatalogViewProps) => {
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogData | null>(null);
  
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

  const catalogList = (catalogs as unknown as CatalogData[]) || [];

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

  // Adapter function to convert CatalogData to Catalog type expected by CatalogCard
  const adaptCatalog = (c: CatalogData): Catalog => {
    // Extract string URLs from object array if needed
    let images: string[] = [];
    if (Array.isArray(c.images)) {
      images = c.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
    }

    return {
      id: c.id,
      business_id: c.business_id,
      name: c.name,
      description: c.description || null,
      price: c.base_price || null,
      price_currency: c.price_currency || 'XAF',
      category: c.category || null,
      subcategory: c.subcategory || null,
      catalog_type: c.catalog_type || 'products',
      cover_url: c.cover_url || c.cover_image_url || null,
      images: images,
      keywords: c.keywords || null,
      is_public: c.is_public ?? true, // Default to true if undefined
      is_active: c.is_active ?? true,
      visibility: c.visibility || 'public',
      seo_score: c.seo_score || null,
      delivery_available: c.delivery_available || null,
      delivery_cost: c.delivery_cost || null,
      delivery_zones: c.delivery_zones || null,
      on_sale: c.on_sale || null,
      sale_percentage: c.sale_percentage || null,
      contact_whatsapp: c.contact_whatsapp || null,
      contact_phone: c.contact_phone || null,
      contact_email: c.contact_email || null,
      geo_city: c.geo_city || null,
      geo_district: c.geo_district || null,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
    };
  };

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
                catalog={adaptCatalog(catalog)}
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
                catalog={adaptCatalog(catalog)}
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
