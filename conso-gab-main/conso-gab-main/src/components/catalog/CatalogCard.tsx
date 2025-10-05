import { Star, MapPin, ThumbsUp, MessageCircle, MoreVertical, Shield, Percent, Truck, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CatalogInteractionModal } from "./CatalogInteractionModal";
interface Catalog {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  catalog_type: 'products' | 'services';
  cover_image_url?: string;
  cover_url?: string;
  business_id: string;
  geo_city?: string;
  geo_district?: string;
  is_public: boolean;
  is_active: boolean;
  on_sale?: boolean;
  sale_percentage?: number;
  delivery_available?: boolean;
  has_limited_quantity?: boolean;
  created_at: string;
  keywords?: string[];
  // Relations calculées
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  business?: {
    business_name: string;
    user_id: string;
  };
}
interface CatalogCardProps {
  catalog: Catalog;
  onSelect?: (catalog: Catalog) => void;
  onEdit?: (catalog: Catalog) => void;
  onDelete?: (catalogId: string) => void;
  variant?: "default" | "compact" | "featured";
  showOwnerActions?: boolean;
  currentUserId?: string;
}
export const CatalogCard = ({
  catalog,
  onSelect,
  onEdit,
  onDelete,
  variant = "default",
  showOwnerActions = false,
  currentUserId
}: CatalogCardProps) => {
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [isLiked, setIsLiked] = useState(catalog.is_liked || false);
  const isOwner = showOwnerActions && currentUserId && catalog.business?.user_id === currentUserId;
  const coverImage = catalog.cover_image_url || catalog.cover_url;
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Handled by parent component via onFavorite prop
  };
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInteractionModal(true);
  };
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(catalog);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(catalog.id);
  };
  return <>
      <div className="bg-card rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-border/20 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:scale-[1.01] cursor-pointer overflow-hidden" onClick={() => onSelect?.(catalog)}>
        {/* Image de couverture */}
        {coverImage && <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
            <img src={coverImage} alt={catalog.name} className="w-full h-full object-cover" onError={e => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }} />
            
            {/* Badges sur l'image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {catalog.catalog_type === 'services' && <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-500/90 text-white font-medium">
                  Services
                </Badge>}
              {catalog.on_sale && catalog.sale_percentage && catalog.sale_percentage > 0 && <Badge variant="secondary" className="text-xs px-2 py-1 bg-red-500/90 text-white font-medium flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  -{catalog.sale_percentage}%
                </Badge>}
              {catalog.delivery_available && <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-500/90 text-white font-medium flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Livraison
                </Badge>}
              {catalog.has_limited_quantity && <Badge variant="secondary" className="text-xs px-2 py-1 bg-orange-500/90 text-white font-medium">
                  Quantité limitée
                </Badge>}
            </div>

            {/* Actions propriétaire */}
            {isOwner && <div className="absolute top-3 right-3 flex gap-2">
                <Button variant="secondary" size="sm" className="p-2 h-8 w-8 bg-white/90 hover:bg-white" onClick={handleEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" className="p-2 h-8 w-8 bg-white/90 hover:bg-white text-red-600 hover:text-red-700" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>}
          </div>}

        <div className="p-4 bg-[ffd014] bg-[#ffd014]/[0.96]">
          {/* Ligne 1 - Statut & Options */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {catalog.is_public && <Badge variant="outline" className="text-xs px-2 py-1 border-green-500 text-green-600 font-medium bg-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Public
                </Badge>}
              {!catalog.is_public && <Badge variant="outline" className="text-xs px-2 py-1 border-gray-400 text-gray-600 bg-gray-50 font-medium">
                  Privé
                </Badge>}
            </div>
            
            <div className="flex items-center gap-2">
              {catalog.geo_city && <Badge variant="secondary" className="text-xs px-2 text-black font-medium bg-white py-[4px]">
                  {catalog.geo_city}
                </Badge>}
              {!isOwner && <Button variant="ghost" size="sm" className="p-1 h-auto w-auto hover:bg-accent/20 text-[1e7be6] text-black/[0.96]">
                  <MoreVertical className="w-4 h-4" />
                </Button>}
            </div>
          </div>

          {/* Ligne 2 - Nom, Prix & Catégorie */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1 bg-inherit">
              <h3 className="text-base font-semibold text-foreground truncate">
                {catalog.name}
              </h3>
              {/* Prix du produit/service */}
              <div className="text-sm font-bold text-primary bg-[1e7be6] rounded-2xl bg-inherit">
                {catalog.catalog_type === 'products' ? '15,000' : '8,500'} FCFA
              </div>
            </div>
            {catalog.category && <p className="text-black text-sm font-bold">
                {catalog.category}{catalog.subcategory && ` • ${catalog.subcategory}`}
              </p>}
          </div>

          {/* Ligne 3 - Description */}
          {catalog.description && <p className="text-sm line-clamp-2 mb-4 text-black">
              {catalog.description}
            </p>}

          {/* Ligne 4 - Métadonnées */}
          <div className="flex items-center gap-1 mb-4 bg-[1e7be6] bg-[#1e7be6]/[0.96]">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground truncate">
              <span className="text-white font-bold">de {catalog.business?.business_name || 'Utilisateur'}</span>
              {catalog.geo_district && <>
                  <span className="mx-1">•</span>
                  <span>{catalog.geo_district}</span>
                </>}
              <span className="mx-1">•</span>
              <span className="text-white text-center px-[128px]">{new Date(catalog.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Ligne 5 - Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className={cn("p-2 h-11 w-11", isLiked && "bg-red-50 text-red-600 hover:bg-red-100")} onClick={handleLike}>
                <ThumbsUp className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2 h-11 w-11" onClick={handleOpenModal}>
                <MessageCircle className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ThumbsUp className="w-4 h-4" />
                <span>{catalog.likes_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{catalog.comments_count || 0}</span>
              </div>
            </div>
            
            <Button onClick={e => {
            e.stopPropagation();
            onSelect?.(catalog);
          }} className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 px-6 h-10 rounded-xl font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Voir
            </Button>
          </div>
        </div>
      </div>

      <CatalogInteractionModal catalog={catalog} open={showInteractionModal} onClose={() => setShowInteractionModal(false)} />
    </>;
};