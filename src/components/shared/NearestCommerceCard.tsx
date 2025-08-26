import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Navigation, Phone } from "lucide-react";
import { useNearestCommerce } from "@/hooks/use-nearest-commerce";
import { Link } from "react-router-dom";
import type { Commerce } from "@/data/mockCommerces";

interface NearestCommerceCardProps {
  title?: string;
  filters?: {
    category?: string;
    priceRange?: string;
    rating?: number;
    verified?: boolean;
    openNow?: boolean;
  };
  onSelect?: (commerce: Commerce) => void;
  className?: string;
}

export const NearestCommerceCard = ({ 
  title = "Le plus proche de vous",
  filters = {},
  onSelect,
  className 
}: NearestCommerceCardProps) => {
  const { findNearestCommerce } = useNearestCommerce();
  
  const nearestCommerce = findNearestCommerce(filters);

  if (!nearestCommerce) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p>Aucun établissement trouvé à proximité</p>
        </CardContent>
      </Card>
    );
  }

  const handleDirections = () => {
    const { lat, lng } = nearestCommerce.coordinates;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const handleCall = () => {
    if (nearestCommerce.phone) {
      window.open(`tel:${nearestCommerce.phone}`, '_self');
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {nearestCommerce.distance}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <Link 
              to={`/business/${nearestCommerce.id}`}
              className="font-semibold hover:text-primary transition-colors"
              onClick={() => onSelect?.(nearestCommerce)}
            >
              {nearestCommerce.name}
            </Link>
            <p className="text-sm text-muted-foreground">{nearestCommerce.type}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                <span className="text-sm font-medium">{nearestCommerce.rating}</span>
              </div>
              
              <Badge 
                variant="secondary" 
                className={
                  nearestCommerce.priceRange === "€" ? "bg-green-100 text-green-800" :
                  nearestCommerce.priceRange === "€€" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }
              >
                {nearestCommerce.priceRange}
              </Badge>

              {nearestCommerce.openNow && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Ouvert
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{nearestCommerce.address}</p>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDirections}
              className="flex-1"
            >
              <Navigation className="w-3 h-3 mr-1" />
              Itinéraire
            </Button>
            
            {nearestCommerce.phone && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCall}
              >
                <Phone className="w-3 h-3" />
              </Button>
            )}
            
            <Button 
              size="sm" 
              asChild
              className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90"
            >
              <Link to={`/business/${nearestCommerce.id}`}>
                Voir
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};