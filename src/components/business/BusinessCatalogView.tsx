import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Star, Package, Calendar, Store } from "lucide-react";
import { useCatalogManagement } from "@/hooks/use-catalog-management";
import { CatalogInteractionModal } from "@/components/catalog/CatalogInteractionModal";
import { BusinessVitrineTab } from "./BusinessVitrineTab";
import type { Tables } from "@/integrations/supabase/types";

interface BusinessCatalogViewProps {
  businessId: string;
  businessName: string;
}

interface ImageData {
  url: string;
  path?: string;
  id?: string;
}

interface CatalogWithImages extends Omit<Tables<'catalogs'>, 'images'> {
  images?: ImageData[];
}

type Catalog = Tables<'catalogs'>;

export const BusinessCatalogView = ({ businessId, businessName }: BusinessCatalogViewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(new Date(dateString));
  };

  const getScoreBadge = (score: number | null) => {
    if (!score) return <Badge variant="secondary">Non évalué</Badge>;
    if (score >= 90) return <Badge className="bg-[hsl(var(--gaboma-green))] text-white">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-[hsl(var(--gaboma-blue))] text-white">Très bon</Badge>;
    if (score >= 70) return <Badge className="bg-[hsl(var(--gaboma-yellow))] text-black">Bon</Badge>;
    return <Badge variant="secondary">À améliorer</Badge>;
  };

  const formatPrice = (catalog: any) => {
    if (!catalog.base_price && (!catalog.price_details || catalog.price_details.length === 0)) {
      return null;
    }

    if (catalog.price_type === 'fixed' && catalog.base_price) {
      return `${catalog.base_price.toLocaleString()} ${catalog.price_currency || 'FCFA'}`;
    }
    
    if (catalog.price_type === 'from' && catalog.base_price) {
      return `À partir de ${catalog.base_price.toLocaleString()} ${catalog.price_currency || 'FCFA'}`;
    }
    
    if (catalog.price_type === 'variable' && catalog.price_details && catalog.price_details.length > 0) {
      const prices = catalog.price_details.map((p: any) => p.price).filter((p: any) => p > 0);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) {
          return `${minPrice.toLocaleString()} ${catalog.price_currency || 'FCFA'}`;
        }
        return `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ${catalog.price_currency || 'FCFA'}`;
      }
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Chargement des catalogues...</h3>
        <p className="text-muted-foreground">
          Récupération des catalogues en cours.
        </p>
      </div>
    );
  }

  if (catalogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun catalogue disponible</h3>
        <p className="text-muted-foreground">
          Ce commerce n'a pas encore publié de catalogues.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="featured" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="featured">Catalogues vedettes</TabsTrigger>
        <TabsTrigger value="showcase">Vitrine complète</TabsTrigger>
      </TabsList>
      
      <TabsContent value="featured" className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Catalogues de {businessName}</h2>
          <p className="text-muted-foreground">
            Découvrez nos {catalogs.length} catalogue{catalogs.length > 1 ? 's' : ''} de produits et services
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {catalogs.slice(0, 3).map((catalog) => {
            // Safely parse images JSON
            let images: ImageData[] = [];
            try {
              if (Array.isArray(catalog.images)) {
                images = catalog.images as unknown as ImageData[];
              } else if (typeof catalog.images === 'string') {
                images = JSON.parse(catalog.images);
              }
            } catch (error) {
              console.warn('Error parsing catalog images:', error);
              images = [];
            }
            
            const currentIndex = currentImageIndex[catalog.id] || 0;
            const currentImage = images[currentIndex];
            const priceInfo = formatPrice(catalog);
            
            return (
              <Card key={catalog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* Image principale avec swipe */}
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    {currentImage?.url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={currentImage.url}
                          alt={catalog.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Carousel avec swipe infini */}
                        {images.length > 1 && (
                          <div className="absolute inset-0">
                            <div 
                              className="flex h-full transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
                              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                              onTouchStart={(e) => {
                                const startX = e.touches[0].clientX;
                                const handleTouchMove = (e: TouchEvent) => {
                                  const currentX = e.touches[0].clientX;
                                  const diff = startX - currentX;
                                  if (Math.abs(diff) > 50) {
                                    if (diff > 0) {
                                      nextImage(catalog.id, images.length);
                                    } else {
                                      prevImage(catalog.id, images.length);
                                    }
                                    document.removeEventListener('touchmove', handleTouchMove);
                                  }
                                };
                                document.addEventListener('touchmove', handleTouchMove, { once: true });
                              }}
                            >
                              {images.concat(images).map((image, index) => (
                                <img
                                  key={index}
                                  src={image.url}
                                  alt={catalog.name}
                                  className="w-full h-full object-cover flex-shrink-0"
                                />
                              ))}
                            </div>
                            
                            {/* Indicateurs de pagination */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setImageIndex(catalog.id, index)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : catalog.cover_image_url || catalog.cover_url ? (
                      <img
                        src={catalog.cover_image_url || catalog.cover_url}
                        alt={catalog.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Badge de statut */}
                    <div className="absolute top-4 left-4">
                      <Badge className={catalog.is_public ? "bg-[hsl(var(--gaboma-green))] text-white" : "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"}>
                        <Eye className="w-3 h-3 mr-1" />
                        {catalog.is_public ? 'Public' : 'Brouillon'}
                      </Badge>
                    </div>
                    
                    {/* Score SEO */}
                    <div className="absolute top-4 right-4">
                      {getScoreBadge(catalog.seo_score)}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold">{catalog.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {catalog.category}
                          </Badge>
                          {priceInfo && (
                            <Badge className="bg-[hsl(var(--gaboma-green))] text-white">
                              {priceInfo}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {catalog.description}
                    </p>
                    
                    {/* Statistiques */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{images.length} images</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Créé le {formatDate(catalog.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                        <span>Score: {catalog.seo_score || 0}/100</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                        onClick={() => setSelectedCatalog(catalog)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir et interagir
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </TabsContent>
      
      <TabsContent value="showcase">
        <BusinessVitrineTab businessId={businessId} businessName={businessName} />
      </TabsContent>

      {/* Modal d'interaction */}
      {selectedCatalog && (
        <CatalogInteractionModal
          open={!!selectedCatalog}
          onClose={() => setSelectedCatalog(null)}
          catalog={{
            id: selectedCatalog.id,
            name: selectedCatalog.name || '',
            description: selectedCatalog.description,
            category: selectedCatalog.category,
            subcategory: selectedCatalog.subcategory,
            catalog_type: (selectedCatalog.catalog_type as 'products' | 'services') || 'products',
            images: (() => {
              try {
                if (Array.isArray(selectedCatalog.images)) {
                  return selectedCatalog.images as unknown as ImageData[];
                } else if (typeof selectedCatalog.images === 'string') {
                  return JSON.parse(selectedCatalog.images);
                }
              } catch (error) {
                console.warn('Error parsing images for modal:', error);
              }
              return [];
            })(),
            cover_url: selectedCatalog.cover_url,
            cover_image_url: selectedCatalog.cover_image_url,
            business_id: selectedCatalog.business_id,
            geo_city: selectedCatalog.geo_city,
            geo_district: selectedCatalog.geo_district,
            keywords: Array.isArray(selectedCatalog.keywords) ? selectedCatalog.keywords as string[] : [],
            on_sale: selectedCatalog.on_sale,
            sale_percentage: selectedCatalog.sale_percentage,
            delivery_available: selectedCatalog.delivery_available,
            delivery_zones: Array.isArray(selectedCatalog.delivery_zones) ? selectedCatalog.delivery_zones as string[] : [],
            delivery_cost: selectedCatalog.delivery_cost,
            contact_whatsapp: selectedCatalog.contact_whatsapp,
            contact_phone: selectedCatalog.contact_phone,
            contact_email: selectedCatalog.contact_email,
            business_hours: selectedCatalog.business_hours
          }}
        />
      )}
    </Tabs>
  );
};