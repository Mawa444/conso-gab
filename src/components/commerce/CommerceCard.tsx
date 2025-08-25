import { Star, MapPin, ThumbsUp, ThumbsDown, MessageCircle, Flag, MoreVertical, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MessageSheet } from "./MessageSheet";

interface Commerce {
  id: string;
  name: string;
  type: string;
  owner: string;
  address: string;
  rating: number;
  verified: boolean;
  employees: string[];
  image?: string;
  distance?: string;
  isFavorite?: boolean;
  reviewCount?: number;
}

interface CommerceCardProps {
  commerce: Commerce;
  onSelect?: (commerce: Commerce) => void;
  onFavorite?: (commerceId: string) => void;
  onMessage?: (commerce: Commerce) => void;
  variant?: "default" | "compact" | "featured";
}

export const CommerceCard = ({ 
  commerce, 
  onSelect, 
  onFavorite,
  onMessage,
  variant = "default" 
}: CommerceCardProps) => {
  const [showMessageSheet, setShowMessageSheet] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  return (
    <>
      <div className="bg-card rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-border/20 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:scale-[1.01]">
        {/* Ligne 1 - Statut & Options */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {commerce.verified && (
              <Badge variant="outline" className="text-xs px-2 py-1 border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))] bg-white font-medium">
                <Shield className="w-3 h-3 mr-1" />
                Vérifié
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {commerce.distance && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-black/[0.12] text-black font-medium">
                {commerce.distance}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto hover:bg-accent/20"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Ligne 2 - Nom & Note */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground truncate pr-2 flex-1">
            {commerce.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
            <span className="text-sm font-medium">{commerce.rating}</span>
            {commerce.reviewCount && (
              <span className="text-xs text-muted-foreground">({commerce.reviewCount})</span>
            )}
          </div>
        </div>

        {/* Ligne 3 - Métadonnées */}
        <div className="flex items-center gap-1 mb-4">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="text-sm text-muted-foreground truncate">
            <span>{commerce.type}</span>
            <span className="mx-1">•</span>
            <span>Par {commerce.owner}</span>
            <span className="mx-1">•</span>
            <span>{commerce.address}</span>
          </div>
        </div>

        {/* Ligne 4 - Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn("p-2 h-11 w-11", isLiked && "bg-[hsl(var(--gaboma-blue))] text-white hover:bg-[hsl(var(--gaboma-blue))]/90")}
              onClick={handleLike}
            >
              <ThumbsUp className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn("p-2 h-11 w-11", isDisliked && "bg-[hsl(var(--gaboma-yellow))] text-black hover:bg-[hsl(var(--gaboma-yellow))]/90")}
              onClick={handleDislike}
            >
              <ThumbsDown className={cn("w-4 h-4", isDisliked ? "fill-current" : "")} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-11 w-11"
              onClick={() => setShowMessageSheet(true)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-11 w-11"
            >
              <Star className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-11 w-11"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => onSelect?.(commerce)}
            className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 px-6 h-10 rounded-xl font-medium"
          >
            Voir
          </Button>
        </div>
      </div>

      <MessageSheet
        open={showMessageSheet}
        onClose={() => setShowMessageSheet(false)}
        commerce={commerce}
      />
    </>
  );
};