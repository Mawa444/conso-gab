import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Plus,
  Users,
  Globe
} from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImageData {
  url: string;
  path: string;
  id: string;
}

interface Catalog {
  id: string;
  name: string;
  description: string;
  images: ImageData[];
  cover_url: string;
  category: string;
  subcategory: string;
  is_public: boolean;
  is_active: boolean;
  visibility: string;
  created_at: string;
  _count?: {
    products: number;
  };
}

interface CatalogGalleryViewProps {
  catalogs: Catalog[];
  onEdit: (catalog: Catalog) => void;
  onDelete: (catalogId: string) => void;
  onToggleVisibility: (catalogId: string, isPublic: boolean) => void;
  onViewProducts: (catalog: Catalog) => void;
  isLoading?: boolean;
}

export const CatalogGalleryView = ({
  catalogs,
  onEdit,
  onDelete,
  onToggleVisibility,
  onViewProducts,
  isLoading = false
}: CatalogGalleryViewProps) => {
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});

  const getImageIndex = (catalogId: string) => imageIndexes[catalogId] || 0;
  
  const setImageIndex = (catalogId: string, index: number) => {
    setImageIndexes(prev => ({ ...prev, [catalogId]: index }));
  };

  const nextImage = (catalogId: string, maxIndex: number) => {
    const current = getImageIndex(catalogId);
    setImageIndex(catalogId, current >= maxIndex ? 0 : current + 1);
  };

  const prevImage = (catalogId: string, maxIndex: number) => {
    const current = getImageIndex(catalogId);
    setImageIndex(catalogId, current <= 0 ? maxIndex : current - 1);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-muted" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (catalogs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun catalogue</h3>
          <p className="text-muted-foreground text-center mb-4">
            Créez votre premier catalogue pour commencer à présenter vos produits
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Créer un catalogue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {catalogs.map((catalog) => {
        const images = catalog.images || [];
        const currentIndex = getImageIndex(catalog.id);
        const maxIndex = images.length - 1;
        const currentImage = images[currentIndex];
        const productCount = catalog._count?.products || 0;

        return (
          <Card key={catalog.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
            {/* Galerie d'images */}
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={catalog.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>

              {/* Navigation galerie */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => prevImage(catalog.id, maxIndex)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => nextImage(catalog.id, maxIndex)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Indicateurs de pages */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setImageIndex(catalog.id, index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges de statut */}
              <div className="absolute top-2 right-2 flex gap-1">
                {catalog.is_public ? (
                  <Badge className="bg-green-500 text-white">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Privé
                  </Badge>
                )}
                
                {!catalog.is_active && (
                  <Badge variant="destructive">
                    Inactif
                  </Badge>
                )}
              </div>

              {/* Compteur d'images */}
              {images.length > 0 && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentIndex + 1}/{images.length}
                  </Badge>
                </div>
              )}
            </div>

            {/* Contenu */}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{catalog.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {catalog.category}
                    </Badge>
                    {catalog.subcategory && (
                      <Badge variant="outline" className="text-xs">
                        {catalog.subcategory}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {catalog.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {catalog.description}
                </p>
              )}

              {/* Statistiques */}
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{productCount} produit{productCount > 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{images.length} image{images.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProducts(catalog)}
                  className="flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Voir
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(catalog)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Modifier
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleVisibility(catalog.id, !catalog.is_public)}
                  className="px-3"
                >
                  {catalog.is_public ? <Users className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(catalog.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};