import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Verified } from "lucide-react";
import { useRealBusinesses, type RealBusiness } from "@/hooks/use-real-businesses";

interface RecommendationEngineProps {
  businesses: RealBusiness[];
  onBusinessSelect: (business: RealBusiness) => void;
}

export const RecommendationEngine = ({ businesses, onBusinessSelect }: RecommendationEngineProps) => {
  const [recommendations, setRecommendations] = useState<RealBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simuler des recommandations basées sur les vraies entreprises
    const generateRecommendations = () => {
      setIsLoading(true);
      
      // Prendre les entreprises vérifiées en priorité
      const verified = businesses.filter(b => b.is_verified);
      const regular = businesses.filter(b => !b.is_verified);
      
      // Mélanger et prendre les 5 premiers
      const mixed = [...verified, ...regular].slice(0, 5);
      
      setTimeout(() => {
        setRecommendations(mixed);
        setIsLoading(false);
      }, 500);
    };

    if (businesses.length > 0) {
      generateRecommendations();
    }
  }, [businesses]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune recommandation disponible pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Recommandations ({recommendations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recommendations.map((business) => (
            <Card 
              key={business.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onBusinessSelect(business)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{business.name}</h4>
                  {business.is_verified && (
                    <Badge variant="secondary" className="text-xs">✓</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{business.category}</p>
                {business.city && (
                  <p className="text-xs text-muted-foreground">📍 {business.city}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};