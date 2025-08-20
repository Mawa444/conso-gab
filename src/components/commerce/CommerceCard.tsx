import { Star, MapPin, Users, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
}

interface CommerceCardProps {
  commerce: Commerce;
  onSelect?: (commerce: Commerce) => void;
  onFavorite?: (commerceId: string) => void;
  variant?: "default" | "compact" | "featured";
}

export const CommerceCard = ({ 
  commerce, 
  onSelect, 
  onFavorite,
  variant = "default" 
}: CommerceCardProps) => {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <div
      className={cn(
        "bg-card rounded-xl border-2 border-border shadow-[var(--shadow-card)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:scale-[1.02] hover:border-primary/30 animate-scale-in",
        isFeatured && "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/40 shadow-[var(--shadow-gaboma)]"
      )}
    >
      {/* Header avec photo ou icône */}
      <div className={cn(
        "relative bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-b-2 border-border/50",
        isCompact ? "h-16" : "h-32"
      )}>
        {commerce.image ? (
          <img 
            src={commerce.image} 
            alt={commerce.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        )}
        
        {/* Badges de statut */}
        <div className="absolute top-2 left-2 flex gap-1">
          {commerce.verified && (
            <Badge variant="default" className="bg-primary/90 text-primary-foreground text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Vérifié
            </Badge>
          )}
        </div>

        {/* Bouton favori */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(commerce.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-black/20 rounded-full backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-colors",
              commerce.isFavorite ? "fill-red-500 text-red-500" : "text-white"
            )} 
          />
        </button>

        {commerce.distance && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
            {commerce.distance}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className={cn("p-3", isCompact && "p-2")}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-foreground truncate",
              isCompact ? "text-sm" : "text-base"
            )}>
              {commerce.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {commerce.type}
            </p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{commerce.rating}</span>
          </div>
        </div>

        {/* Propriétaire */}
        <p className="text-sm text-muted-foreground mb-2">
          Par <span className="font-medium text-foreground">{commerce.owner}</span>
        </p>

        {/* Adresse */}
        <div className="flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate">
            {commerce.address}
          </p>
        </div>

        {/* Équipe */}
        {!isCompact && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">
              Équipe ({commerce.employees.length})
            </p>
            <div className="flex -space-x-1">
              {commerce.employees.slice(0, 3).map((employee, index) => (
                <div
                  key={employee}
                  className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full border-2 border-background flex items-center justify-center"
                  title={employee}
                >
                  <span className="text-xs font-medium text-primary">
                    {employee.charAt(0)}
                  </span>
                </div>
              ))}
              {commerce.employees.length > 3 && (
                <div className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{commerce.employees.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <Button
          onClick={() => onSelect?.(commerce)}
          variant={isFeatured ? "gaboma" : "outline"}
          size="sm"
          className="w-full"
        >
          Voir le commerce
        </Button>
      </div>
    </div>
  );
};