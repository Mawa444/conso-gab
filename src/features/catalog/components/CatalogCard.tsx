
import { useState, useRef, useEffect } from "react";
import { Catalog } from "../types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, Edit, Trash2, ImageIcon, ChevronLeft, ChevronRight, 
  Truck, Percent, MoreVertical, Globe, GlobeLock, Share2, Heart
} from "lucide-react";
import { useDeleteCatalog } from "../hooks/useCatalog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, 
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CatalogForm } from "./CatalogForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CatalogCardProps {
  catalog: Catalog;
  businessId: string;
  showActions?: boolean;
  onClick?: () => void;
}

export const CatalogCard = ({ catalog, businessId, showActions = true, onClick }: CatalogCardProps) => {
  const deleteCatalog = useDeleteCatalog();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [favorites, setFavorites] = useState(false); // Simulated for now
  
  // Image loading states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Touch handling for swipe
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Get images array safely
  const images: string[] = (() => {
    if (catalog.cover_url) {
      if (catalog.images && Array.isArray(catalog.images) && catalog.images.length > 0) {
        const unique = new Set([catalog.cover_url, ...catalog.images]);
        return Array.from(unique);
      }
      return [catalog.cover_url];
    }
    return Array.isArray(catalog.images) ? catalog.images : [];
  })();

  const hasMultipleImages = images.length > 1;

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [currentImageIndex]);

  const handleDelete = async () => {
    try {
      await deleteCatalog.mutateAsync(catalog.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Handled by hook
    }
  };

  const navigateImage = (direction: 'prev' | 'next', e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: catalog.name,
      text: catalog.description || `Découvrez ${catalog.name}`,
      url: window.location.href // TODO: Use actual catalog public URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié dans le presse-papier !");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Touch Event Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) {
      navigateImage('next');
    }
    if (isRightSwipe && hasMultipleImages) {
      navigateImage('prev');
    }
  };

  const hasPromo = catalog.on_sale && catalog.sale_percentage && catalog.sale_percentage > 0;
  const finalPrice = hasPromo && catalog.price 
    ? Math.round(catalog.price * (1 - catalog.sale_percentage! / 100)) 
    : catalog.price;

  return (
    <>
      <Card 
        className="group relative overflow-hidden bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-muted/60"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Image Area */}
        <div 
          className="relative aspect-[4/3] overflow-hidden bg-muted/30"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {images.length > 0 ? (
            <>
              {/* Image with skeleton */}
              {imageLoading && (
                <Skeleton className="absolute inset-0 z-10 animate-pulse bg-muted" />
              )}
              
              {!imageError ? (
                <img 
                  src={images[currentImageIndex]} 
                  alt={catalog.name}
                  onLoad={() => setImageLoading(false)}
                  onError={() => { setImageLoading(false); setImageError(true); }}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700 will-change-transform",
                    isHovered ? "scale-105" : "scale-100",
                    imageLoading ? "opacity-0" : "opacity-100"
                  )}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                  <span className="text-xs">Image indisponible</span>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

              {/* Navigation Controls */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => navigateImage('prev', e)}
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/10 transition-all hover:bg-black/50",
                      "opacity-0 md:group-hover:opacity-100", // Hide on mobile primarily, show on hover desktop
                      "focus:opacity-100 focus:outline-none"
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => navigateImage('next', e)}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/10 transition-all hover:bg-black/50",
                      "opacity-0 md:group-hover:opacity-100",
                      "focus:opacity-100 focus:outline-none"
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                          idx === currentImageIndex 
                            ? "bg-white w-5" 
                            : "bg-white/40 w-1.5 hover:bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/30">
              <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
              <span className="text-sm font-medium">Aucune image</span>
            </div>
          )}

          {/* Top Badges Area */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20 pointer-events-none">
            <div className="flex flex-col gap-1.5 items-start">
              {/* Status Badge */}
              {catalog.is_public ? (
                <Badge variant="secondary" className="bg-green-500/90 text-white backdrop-blur-md border-0 shadow-sm px-2 py-0.5 text-xs font-medium">
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm px-2 py-0.5 text-xs font-medium">
                  <GlobeLock className="w-3 h-3 mr-1" />
                  Privé
                </Badge>
              )}

              {/* Promo Badge */}
              {hasPromo && (
                <Badge className="bg-red-500 text-white border-0 shadow-sm animate-in fade-in zoom-in duration-300 px-2 py-0.5">
                  <Percent className="w-3 h-3 mr-1" />
                  -{catalog.sale_percentage}%
                </Badge>
              )}
            </div>

            {/* Quick Actions (Top Right) */}
            <div className="flex gap-2 pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/20 hover:bg-white hover:text-red-500 text-white backdrop-blur-md border border-white/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setFavorites(!favorites); }}
              >
                <Heart className={cn("w-4 h-4 transition-transform active:scale-95", favorites && "fill-current text-red-500")} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/20 hover:bg-white hover:text-blue-600 text-white backdrop-blur-md border border-white/10 transition-colors"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10"
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
                      Aperçu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <CardHeader className="p-4 pb-2 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold text-lg leading-tight truncate pr-2 group-hover:text-primary transition-colors">
                {catalog.name}
              </h3>
              {catalog.category && (
                <span className="text-xs text-muted-foreground inline-flex items-center mt-1">
                  {catalog.category}
                </span>
              )}
            </div>
            
            {/* Price Tag */}
            {catalog.price !== undefined && catalog.price !== null && (
              <div className="flex flex-col items-end flex-shrink-0">
                <span className={cn(
                  "font-bold text-primary",
                  hasPromo ? "text-lg text-red-600" : "text-lg"
                )}>
                  {finalPrice?.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
                </span>
                {hasPromo && (
                  <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                    {catalog.price?.toLocaleString()} FCFA
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {catalog.description || "Aucune description disponible pour ce catalogue."}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 border-t border-border/50 mt-auto bg-muted/5 flex justify-between items-center text-xs text-muted-foreground h-10">
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1">
               <ImageIcon className="w-3 h-3" /> {images.length}
             </span>
             {catalog.delivery_available && (
               <span className="flex items-center gap-1 text-green-600 font-medium">
                 <Truck className="w-3 h-3" /> Livraison
               </span>
             )}
          </div>
          
          <div className="flex items-center gap-1">
            {catalog.catalog_type === 'services' ? 'Service' : 'Produit'}
          </div>
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
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{catalog.name}" ? 
              Cette action est irréversible et retirera le catalogue de votre vitrine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
