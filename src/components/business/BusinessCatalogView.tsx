import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Star, Package, Calendar } from "lucide-react";
import { mockCatalogs, getCatalogsByBusinessId, type MockCatalog } from "@/data/mockCatalogs";

interface BusinessCatalogViewProps {
  businessId: string;
  businessName: string;
}

export const BusinessCatalogView = ({ businessId, businessName }: BusinessCatalogViewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  
  const catalogs = getCatalogsByBusinessId(businessId);

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

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-[hsl(var(--gaboma-green))] text-white">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-[hsl(var(--gaboma-blue))] text-white">Très bon</Badge>;
    if (score >= 70) return <Badge className="bg-[hsl(var(--gaboma-yellow))] text-black">Bon</Badge>;
    return <Badge variant="secondary">À améliorer</Badge>;
  };

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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Catalogues de {businessName}</h2>
        <p className="text-muted-foreground">
          Découvrez nos {catalogs.length} catalogue{catalogs.length > 1 ? 's' : ''} de produits et services
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {catalogs.map((catalog) => {
          const currentIndex = currentImageIndex[catalog.id] || 0;
          
          return (
            <Card key={catalog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Image principale */}
                <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10">
                  <img
                    src={catalog.images[currentIndex]}
                    alt={catalog.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation des images */}
                  {catalog.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => prevImage(catalog.id, catalog.images.length)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => nextImage(catalog.id, catalog.images.length)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      {/* Indicateurs de pagination */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {catalog.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setImageIndex(catalog.id, index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Badge de statut */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[hsl(var(--gaboma-green))] text-white">
                      <Eye className="w-3 h-3 mr-1" />
                      Public
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
                      <Badge variant="outline" className="mt-2">
                        {catalog.category}
                      </Badge>
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
                      <span>{catalog.product_count} produits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Créé le {formatDate(catalog.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                      <span>Score: {catalog.seo_score}/100</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir les produits
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};