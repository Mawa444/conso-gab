
import { useState } from "react";
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  MapPin, 
  Store,
  Eye,
  ShoppingBag,
  MoreVertical,
  Edit,
  Trash2,
  GlobeLock
} from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CatalogData } from "@/lib/supabase-helpers";

interface EnhancedCatalogCardProps {
  catalog: CatalogData;
  businessName?: string;
  businessLocation?: {
    city?: string;
    district?: string;
    coordinates?: { lat: number; lng: number };
  };
  userLocation?: { lat: number; lng: number };
  onView?: () => void;
  onContact?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  
  // Admin props
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EnhancedCatalogCard = ({
  catalog,
  businessName,
  businessLocation,
  userLocation,
  onView,
  onContact,
  onLike,
  isLiked = false,
  isAdmin = false,
  onEdit,
  onDelete
}: EnhancedCatalogCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Parse images safely
  let images: string[] = [];
  try {
    if (Array.isArray(catalog.images)) {
      images = catalog.images.map(img => typeof img === 'string' ? img : (img as any).url);
    } else if (typeof catalog.images === 'string') {
      const parsed = JSON.parse(catalog.images);
      images = Array.isArray(parsed) ? parsed.map((img: any) => typeof img === 'string' ? img : img.url) : [];
    }
  } catch (e) {
    images = [];
  }

  // Fallback to cover image if no images in array
  if (images.length === 0 && (catalog.cover_image_url || catalog.cover_url)) {
    images = [catalog.cover_image_url || catalog.cover_url || ''];
  }
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(price).replace('XAF', 'FCFA');
  };

  return (
    <Card 
      className="group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 rounded-xl max-w-sm mx-auto w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      {/* Image Carousel Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {images.length > 0 ? (
              images.map((img, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="relative w-full h-full">
                    <img 
                      src={img} 
                      alt={`${catalog.name} - image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="h-full">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur border-0 text-white hover:bg-white/40 h-8 w-8" />
              <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur border-0 text-white hover:bg-white/40 h-8 w-8" />
            </>
          )}
        </Carousel>

        {/* Top Floating Actions (Admin or User) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 transition-opacity duration-300">
           {isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur border-0 hover:bg-black/60">
                   <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                  <Edit className="w-4 h-4 mr-2" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="text-red-600 focus:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
             // Public Actions
             <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike?.();
                  }}
                >
                  <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-gray-600")} />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share logic could be passed or internal
                  }}
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </Button>
             </div>
           )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
           {catalog.on_sale && (
            <Badge className="bg-red-500 text-white border-0 shadow-sm animate-pulse">
              Promo {catalog.sale_percentage ? `-${catalog.sale_percentage}%` : ''}
            </Badge>
          )}
          {isAdmin && !catalog.is_public && (
             <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur border-0">
               <GlobeLock className="w-3 h-3 mr-1" /> Privé
             </Badge>
          )}
           <Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs font-medium shadow-sm w-fit">
            {catalog.category || (catalog.catalog_type === 'services' ? 'Service' : 'Produit')}
          </Badge>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
           <div className="flex items-center justify-between mb-1">
             {/* Price Tag with Glassmorphism */}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white drop-shadow-md">
                  {catalog.price ? formatPrice(catalog.price) : 'Prix sur demande'}
                </span>
                {catalog.on_sale && (catalog.original_price || (catalog.price && catalog.sale_percentage)) && (
                  <span className="text-sm text-white/70 line-through decoration-white/70">
                    {catalog.original_price 
                      ? formatPrice(catalog.original_price) 
                      : (catalog.price ? formatPrice(Math.round(catalog.price / (1 - (catalog.sale_percentage || 0)/100))) : '')}
                  </span>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Content Body */}
      <CardContent className="p-4 space-y-3">
        {/* Title & Description */}
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1 truncate group-hover:text-primary transition-colors">
            {catalog.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {catalog.description || "Aucune description disponible pour cet article."}
          </p>
        </div>

        {/* Business & Location Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3 mt-3">
           <div className="flex items-center gap-1.5 truncate max-w-[60%]">
             <Store className="w-3.5 h-3.5 text-primary" />
             <span className="font-medium text-foreground truncate">
               {businessName || "Mon Commerce"}
             </span>
           </div>
           
           {(businessLocation?.city || businessLocation?.district) && (
             <div className="flex items-center gap-1.5 shrink-0">
               <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
               <span>
                 {businessLocation.district ? `${businessLocation.district}, ` : ''}
                 {businessLocation.city}
               </span>
             </div>
           )}
        </div>

        {/* Action Buttons (Hidden in Admin Mode if preferred, or different) */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button 
              className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-0 font-semibold"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onView?.(); }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir
            </Button>
            <Button 
              className="w-full bg-primary text-white hover:bg-primary/90 shadow-sm"
              onClick={(e) => { e.stopPropagation(); onContact?.(); }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
