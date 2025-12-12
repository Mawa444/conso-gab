/**
 * Carte de catalogue redesignée avec carousel d'images et badges
 */

import { useState } from "react";
import { Catalog } from "../types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, Edit, Trash2, ImageIcon, ChevronLeft, ChevronRight, 
  Truck, Percent, MoreVertical, Globe, GlobeLock 
} from "lucide-react";
import { useDeleteCatalog } from "../hooks/useCatalog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CatalogForm } from "./CatalogForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

  // Get images array
  const images: string[] = (() => {
    if (catalog.cover_url) {
      if (catalog.images && Array.isArray(catalog.images) && catalog.images.length > 0) {
        // Combine cover with other images, avoid duplicates
        const allImages = [catalog.cover_url, ...catalog.images.filter(img => img !== catalog.cover_url)];
        return allImages;
      }
      return [catalog.cover_url];
    }
    if (catalog.images && Array.isArray(catalog.images)) {
      return catalog.images;
    }
    return [];
  })();

  const hasMultipleImages = images.length > 1;

  const handleDelete = async () => {
    try {
      await deleteCatalog.mutateAsync(catalog.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Handled by hook
    }
  };

  const navigateImage = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  const hasPromo = catalog.on_sale && catalog.sale_percentage && catalog.sale_percentage > 0;
  const hasDelivery = catalog.delivery_available;

  return (
    <>
      <Card 
        className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
        onClick={onClick}
      >
        {/* Image carousel */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={catalog.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => navigateImage('prev', e)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => navigateImage('next', e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
              <span className="text-sm">Aucune image</span>
            </div>
          )}
          
          {/* Top badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <div className="flex flex-col gap-1">
              {/* Visibility badge */}
              {catalog.is_public ? (
                <Badge className="bg-green-500/90 hover:bg-green-500 text-white border-0">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-900/70 text-white border-0">
                  <GlobeLock className="w-3 h-3 mr-1" />
                  Brouillon
                </Badge>
              )}
              
              {/* Promo badge */}
              {hasPromo && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 animate-pulse">
                  <Percent className="w-3 h-3 mr-1" />
                  -{catalog.sale_percentage}%
                </Badge>
              )}
            </div>
            
            {/* Menu actions */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
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
          
          {/* Delivery badge */}
          {hasDelivery && (
            <Badge 
              className="absolute bottom-2 right-2 bg-blue-500/90 text-white border-0"
            >
              <Truck className="w-3 h-3 mr-1" />
              Livraison
            </Badge>
          )}
        </div>
        
        {/* Content */}
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{catalog.name}</h3>
              {catalog.category && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {catalog.category}
                </Badge>
              )}
            </div>
            {catalog.price && catalog.price > 0 && (
              <div className="text-right flex-shrink-0">
                {hasPromo && catalog.sale_percentage ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      {Math.round(catalog.price * (1 - catalog.sale_percentage / 100)).toLocaleString()} FCFA
                    </span>
                    <span className="text-xs text-muted-foreground line-through block">
                      {catalog.price.toLocaleString()} FCFA
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold">
                    {catalog.price.toLocaleString()} FCFA
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          {catalog.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {catalog.description}
            </p>
          )}
        </CardContent>
        
        {/* Footer with stats */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {images.length} image{images.length > 1 ? 's' : ''}
          </span>
          <span>
            {catalog.catalog_type === 'products' ? '📦 Produits' : 
             catalog.catalog_type === 'services' ? '🔧 Services' : '🎯 Mixte'}
          </span>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
