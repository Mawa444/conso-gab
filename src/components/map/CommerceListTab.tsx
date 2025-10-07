import { useGeoRecommendations } from "@/hooks/use-geo-recommendations";
import { EnhancedBusinessCard } from "@/components/commerce/EnhancedBusinessCard";
import { Loader2, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const CommerceListTab = () => {
  const {
    businesses: geoBusinesses,
    loading,
    error,
    refresh,
    currentPosition
  } = useGeoRecommendations({
    initialRadius: 2,
    maxRadius: 50,
    minResults: 5,
    autoRefresh: true
  });

  // Transformer pour le composant EnhancedBusinessCard
  const businesses = geoBusinesses.map(rec => ({
    id: rec.item.id,
    name: rec.item.business_name,
    logo_url: rec.item.logo_url,
    business_category: rec.item.business_category,
    description: rec.item.description,
    distance: rec.distanceFormatted,
    rating: 4.5,
    verified: rec.item.is_verified,
    city: rec.item.city || rec.item.address,
    whatsapp: rec.item.phone
  }));

  if (loading && businesses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <Button onClick={refresh} variant="outline" size="sm">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="p-4">
        <Card className="bg-muted/50">
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune entreprise trouvée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aucune entreprise n'est disponible dans votre zone actuellement
            </p>
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* En-tête avec position */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">
              {businesses.length} entreprise{businesses.length > 1 ? 's' : ''} à proximité
            </p>
            {currentPosition && (
              <p className="text-xs text-muted-foreground">
                Autour de vous
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={refresh} 
          variant="ghost" 
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Liste des entreprises */}
      <div className="space-y-3">
        {businesses.map(business => (
          <EnhancedBusinessCard
            key={business.id}
            business={business}
          />
        ))}
      </div>
    </div>
  );
};
