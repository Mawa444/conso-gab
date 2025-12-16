/**
 * Carte de catalogue redesignée avec carousel d'images et badges
 */

import { useState, useEffect } from "react";
import { Catalog } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, Edit, Trash2, MapPin, Truck, Percent, 
  MoreVertical, Globe, GlobeLock, ShoppingCart, MessageCircle, Phone, Store
} from "lucide-react";
import { useDeleteCatalog } from "../hooks/useCatalog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CatalogForm } from "./CatalogForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface CatalogCardProps {
  catalog: Catalog;
  businessId: string;
  businessName?: string;
  showActions?: boolean;
  onClick?: () => void;
}

export const CatalogCard = ({ catalog, businessId, businessName, showActions = true, onClick }: CatalogCardProps) => {
  const deleteCatalog = useDeleteCatalog();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Get images array
  const images: string[] = (() => {
    if (catalog.cover_url) {
      if (catalog.images && Array.isArray(catalog.images) && catalog.images.length > 0) {
        // Combine cover with other images, avoid duplicates
        const allImages = [catalog.cover_url, ...catalog.images.filter((img: string) => img !== catalog.cover_url)];
        return allImages;
      }
      return [catalog.cover_url];
    }
    if (catalog.images && Array.isArray(catalog.images)) {
      return catalog.images;
    }
    return [];
  })();

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDelete = async () => {
    try {
      await deleteCatalog.mutateAsync(catalog.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Handled by hook
    }
  };

  const handleCardClick = async () => {
    // Track catalog view
    const { Analytics } = await import('@/services/analytics');
    Analytics.trackCatalogView(businessId, catalog.id, {
      catalog_name: catalog.name,
      catalog_type: catalog.catalog_type,
      has_price: !!catalog.price
    });
    
    onClick?.();
  };

  const hasPromo = catalog.on_sale && catalog.sale_percentage && catalog.sale_percentage > 0;
  const hasDelivery = catalog.delivery_available;

  return (
    <>
      <Card 
        className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm"
        onClick={handleCardClick}
      >
        {/* Image carousel with Glassmorphism overlay */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-full">
              {images.length > 0 ? (
                images.map((img, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="h-full w-full relative">
                      <img 
                        src={img} 
                        alt={`${catalog.name} - ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="h-full">
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                    <span className="text-sm font-medium">Aucune image</span>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
          
          {/* Top Actions & Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            <div className="flex flex-col gap-2">
              {/* Promo Badge */}
              {hasPromo && (
                <Badge className="bg-red-500/90 hover:bg-red-600 text-white border-0 shadow-lg animate-in fade-in zoom-in duration-300">
                  <Percent className="w-3 h-3 mr-1" />
                  -{catalog.sale_percentage}%
                </Badge>
              )}
              
               {/* Visibility Badge (only if not public or viewing as admin) */}
               {!catalog.is_public && (
                <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-0">
                  <GlobeLock className="w-3 h-3 mr-1" />
                  Privé
                </Badge>
              )}
            </div>

             {/* Admin Menu */}
             {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Dots Indicator */}
          {count > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {Array.from({ length: count }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                    index === current ? "bg-white w-4" : "bg-white/40 w-1.5 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Header: Name & Price */}
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="font-bold text-lg leading-tight truncate" title={catalog.name}>
                {catalog.name}
              </h3>
              
              {/* Business Name (if provided) */}
              {businessName && (
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span className="truncate">{businessName}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                  {catalog.category || 'Non catégorisé'}
                </span>
                {catalog.geo_city && (
                  <span className="flex items-center truncate">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    {catalog.geo_city}
                  </span>
                )}
              </div>
            </div>

            {/* Price Display */}
            <div className="text-right flex-shrink-0">
               {catalog.price !== null && catalog.price > 0 ? (
                <div className="flex flex-col items-end">
                  {hasPromo && catalog.sale_percentage ? (
                    <>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        {Math.round(catalog.price * (1 - catalog.sale_percentage / 100)).toLocaleString()} FCFA
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {catalog.price.toLocaleString()} FCFA
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {catalog.price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm font-medium text-muted-foreground italic">
                  Sur devis
                </span>
              )}
            </div>
          </div>

          {/* Description (Optional) */}
          {catalog.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {catalog.description}
            </p>
          )}

          {/* Quick Info / Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {hasDelivery && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                <Truck className="w-3 h-3 mr-1" />
                Livraison possible
              </Badge>
            )}
             {catalog.is_public && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
          </div>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
          {catalog.contact_whatsapp ? (
            <Button 
              variant="outline" 
              className="w-full border-green-200 hover:bg-green-50 text-green-700 dark:border-green-800 dark:hover:bg-green-900/20 dark:text-green-400"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${catalog.contact_whatsapp}`, '_blank');
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          )}
          
          {catalog.contact_phone ? (
             <Button 
              variant="default" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${catalog.contact_phone}`, '_self');
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          ) : (
            <Button variant="default" className="w-full" onClick={(e) => e.stopPropagation()}>
               <Eye className="w-4 h-4 mr-2" />
               Détails
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
          <CatalogForm 
            businessId={businessId} 
            initialData={catalog} 
            onSuccess={() => setShowEdit(false)}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce catalogue ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action archivera le catalogue "{catalog.name}". 
              Il ne sera plus visible par vos clients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
