import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Star, Package, Calendar, ArrowUpDown } from "lucide-react";
import { useCatalogManagement } from "@/hooks/use-catalog-management";
import { CatalogInteractionModal } from "@/components/catalog/CatalogInteractionModal";
import type { Tables } from "@/integrations/supabase/types";

interface BusinessVitrineTabProps {
  businessId: string;
  businessName: string;
}

interface ImageData {
  url: string;
  path?: string;
  id?: string;
}

type Catalog = Tables<'catalogs'>;

export const BusinessVitrineTab = ({ businessId, businessName }: BusinessVitrineTabProps) => {
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name' | 'category'>('recent');
  
  const { catalogs, isLoading } = useCatalogManagement(businessId);

  const sortedCatalogs = [...catalogs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      default:
        return 0;
    }
  });

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Chargement de la vitrine...</h3>
        <p className="text-muted-foreground">
          Récupération de tous les catalogues en cours.
        </p>
      </div>
    );
  }

  if (catalogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Vitrine vide</h3>
        <p className="text-muted-foreground">
          Ce commerce n'a pas encore de catalogues dans sa vitrine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Vitrine de {businessName}</h2>
          <p className="text-muted-foreground">
            Tous les catalogues ({catalogs.length}) classés par préférence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récent d'abord</SelectItem>
              <SelectItem value="oldest">Plus ancien d'abord</SelectItem>
              <SelectItem value="name">Nom (A-Z)</SelectItem>
              <SelectItem value="category">Catégorie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedCatalogs.map((catalog) => {
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
          
          return (
            <Card key={catalog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Image principale */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                  {images[0]?.url ? (
                    <img
                      src={images[0].url}
                      alt={catalog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : catalog.cover_image_url || catalog.cover_url ? (
                    <img
                      src={catalog.cover_image_url || catalog.cover_url}
                      alt={catalog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Badge de statut */}
                  <div className="absolute top-2 left-2">
                    <Badge className={catalog.is_public ? "bg-[hsl(var(--gaboma-green))] text-white" : "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"}>
                      <Eye className="w-3 h-3 mr-1" />
                      {catalog.is_public ? 'Public' : 'Brouillon'}
                    </Badge>
                  </div>
                  
                  {/* Score SEO */}
                  <div className="absolute top-2 right-2">
                    {getScoreBadge(catalog.seo_score)}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">{catalog.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {catalog.category}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {catalog.description}
                  </p>
                  
                  {/* Statistiques */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span>{images.length} images</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(catalog.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                      <span>{catalog.seo_score || 0}/100</span>
                    </div>
                  </div>

                  <Button 
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                    onClick={() => setSelectedCatalog(catalog)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir le catalogue
                  </Button>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
};