import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Phone, ExternalLink } from "lucide-react";
import { useRealBusinesses, type RealBusiness } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";

interface RealNearestCommerceCardProps {
  business: RealBusiness;
  onNavigate?: (business: RealBusiness) => void;
  onContact?: (business: RealBusiness) => void;
  onViewDetails?: (business: RealBusiness) => void;
}

export const RealNearestCommerceCard = ({ 
  business, 
  onNavigate, 
  onContact, 
  onViewDetails 
}: RealNearestCommerceCardProps) => {
  const category = businessCategories.find(cat => cat.id === business.category);

  return (
    <Card className="animate-ui-card hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
              {business.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <span>{category?.icon || '🏪'}</span>
              {category?.nom || business.category}
            </p>
          </div>
          
          {business.is_verified && (
            <Badge variant="secondary" className="text-xs">
              ✓ Vérifié
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {business.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {business.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{business.city}</span>
            </div>
          )}
          
          {business.is_active && (
            <Badge variant="outline" className="text-xs">
              Actif
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 animate-ui-button"
            onClick={() => onViewDetails?.(business)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Voir détails
          </Button>
          
          {business.phone && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onContact?.(business)}
            >
              <Phone className="w-3 h-3" />
            </Button>
          )}
          
          {business.latitude && business.longitude && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onNavigate?.(business)}
            >
              <MapPin className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};