import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Phone, ExternalLink } from "lucide-react";
import { useRealBusinesses, type RealBusiness } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";

interface NearestCommerceCardProps {
  business: RealBusiness;
  onNavigate?: (coords: { lat: number; lng: number }) => void;
  onFavorite?: () => void;
  className?: string;
}

export const NearestCommerceCard = ({ 
  business, 
  onNavigate, 
  onFavorite, 
  className = "" 
}: NearestCommerceCardProps) => {

  const handleNavigate = () => {
    if (business.latitude && business.longitude) {
      onNavigate?.({ lat: business.latitude, lng: business.longitude });
    }
  };

  const category = businessCategories.find(cat => cat.id === business.category);

  return (
    <Card className={`hover:shadow-lg transition-shadow group cursor-pointer ${className}`}>
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
            {business.city && (
              <p className="text-xs text-muted-foreground mt-1">📍 {business.city}</p>
            )}
          </div>
          
          {business.is_verified && (
            <Badge variant="secondary">Vérifié</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {business.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            size="sm"
            onClick={handleNavigate}
            disabled={!business.latitude || !business.longitude}
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Itinéraire
          </Button>
          
          {business.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`tel:${business.phone}`)}
            >
              <Phone className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={onFavorite}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};