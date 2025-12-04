import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Eye, Star, Package, Calendar, Store } from "lucide-react";
import { useCatalogManagement } from "@/hooks/use-catalog-management";
import { CatalogInteractionModal } from "@/components/catalog/CatalogInteractionModal";
import type { CatalogData } from "@/lib/supabase-helpers";

interface BusinessCatalogViewProps {
  businessId: string;
  businessName: string;
}

export const BusinessCatalogView = ({ businessId, businessName }: BusinessCatalogViewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogData | null>(null);
  
  const { catalogs, isLoading } = useCatalogManagement(businessId);

  const nextImage = (catalogId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [catalogId]: ((prev[catalogId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (catalogId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [catalogId]: ((prev[catalogId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const setImageIndex = (catalogId: string, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [catalogId]: index
    }));
  };

  const getImageUrl = (catalog: CatalogData) => {
    const images = catalog.images || [];
    const index = currentImageIndex[catalog.id] || 0;
    if (images.length > 0 && images[index]) {
      return images[index].url;
    }
    return catalog.cover_url || catalog.cover_image_url || '/placeholder.svg';
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    return `${price.toLocaleString()} ${currency || 'XAF'}`;
  };

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

  const renderCatalogCard = (catalog: CatalogData) => {
    const images = catalog.images || [];
    const imageCount = images.length || 1;
    const currentIndex = currentImageIndex[catalog.id] || 0;

    return (
      <Card 
        key={catalog.id} 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => setSelectedCatalog(catalog)}
      >
        {/* Image avec carousel */}
        <div className="relative aspect-square bg-muted">
          <img
            src={getImageUrl(catalog)}
            alt={catalog.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </Button>
          </div>

          {/* Navigation d'images */}
          {imageCount > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage(catalog.id, imageCount);
                }}
              >
                ‹
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage(catalog.id, imageCount);
                }}
              >
                ›
              </Button>
              
              {/* Indicateurs */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageIndex(catalog.id, idx);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="bg-white/90">
              {catalog.catalog_type === 'services' ? (
                <Calendar className="h-3 w-3 mr-1" />
              ) : (
                <Package className="h-3 w-3 mr-1" />
              )}
              {catalog.catalog_type === 'services' ? 'Service' : 'Produit'}
            </Badge>
            {catalog.on_sale && (
              <Badge className="bg-red-500 text-white">
                -{catalog.sale_percentage}%
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{catalog.name}</h3>
          {catalog.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {catalog.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-primary">
              {formatPrice(catalog.base_price, catalog.price_currency)}
            </span>
            {catalog.category && (
              <Badge variant="outline" className="text-xs">
                {catalog.category}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {catalog.keywords && catalog.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {catalog.keywords.slice(0, 3).map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          {/* Livraison */}
          {catalog.delivery_available && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Livraison disponible
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Produits */}
      {products.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produits ({products.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(renderCatalogCard)}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Services ({services.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(renderCatalogCard)}
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
