import { useState, useMemo } from "react";
import { Sparkles, TrendingUp, MapPin, Clock, Star, Users, Zap, Target, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Commerce, getFeaturedCommerces, getTrendingCommerces } from "@/data/mockCommerces";

interface RecommendationEngineProps {
  commerces: Commerce[];
  userLocation?: { lat: number; lng: number };
  selectedCategory: string;
}

export const RecommendationEngine = ({ 
  commerces, 
  userLocation = { lat: 0.4162, lng: 9.4673 }, 
  selectedCategory 
}: RecommendationEngineProps) => {
  const [activeTab, setActiveTab] = useState("personalized");

  // Recommandations personnalisées basées sur la localisation et les préférences
  const personalizedRecommendations = useMemo(() => {
    return commerces
      .map(commerce => {
        let score = 0;
        
        // Score basé sur la distance (plus proche = mieux)
        const distance = parseFloat(commerce.distance);
        score += Math.max(0, 10 - distance * 2);
        
        // Score basé sur la note
        score += commerce.rating * 2;
        
        // Bonus pour les commerces vérifiés
        if (commerce.verified) score += 3;
        
        // Bonus pour les commerces ouverts
        if (commerce.openNow) score += 2;
        
        // Bonus pour les commerces populaires
        if (commerce.reviews > 100) score += 2;
        
        // Bonus si c'est dans la catégorie sélectionnée
        if (selectedCategory !== "all" && commerce.category === selectedCategory) score += 5;
        
        return { ...commerce, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [commerces, selectedCategory]);

  // Commerces les plus proches
  const nearbyCommerces = useMemo(() => {
    return commerces
      .filter(commerce => parseFloat(commerce.distance) <= 1.5)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 8);
  }, [commerces]);

  // Commerces tendance (basés sur les avis récents et la popularité)
  const trendingCommerces = useMemo(() => {
    return commerces
      .filter(commerce => commerce.reviews >= 50)
      .sort((a, b) => {
        const scoreA = (b.reviews * 0.3) + (b.rating * 20);
        const scoreB = (a.reviews * 0.3) + (a.rating * 20);
        return scoreA - scoreB;
      })
      .slice(0, 6);
  }, [commerces]);

  // Nouveaux commerces (simulé par les établis récemment)
  const newCommerces = useMemo(() => {
    return commerces
      .filter(commerce => commerce.established && commerce.established >= 2020)
      .sort((a, b) => (b.established || 0) - (a.established || 0))
      .slice(0, 6);
  }, [commerces]);

  const RecommendationCard = ({ commerce, reason }: { commerce: Commerce; reason?: string }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône catégorie */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
            🏪
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {commerce.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {commerce.type} • {commerce.district}
                </p>
              </div>
              
              {commerce.verified && (
                <Badge variant="secondary" className="text-xs h-5 px-2">
                  ✓
                </Badge>
              )}
            </div>

            {/* Métriques */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{commerce.rating}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span>{commerce.distance}</span>
              </div>
              {commerce.openNow && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-green-600 h-4 px-1 text-xs">
                    Ouvert
                  </Badge>
                </>
              )}
            </div>

            {/* Raison de la recommandation */}
            {reason && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs h-5 px-2 text-primary">
                  {reason}
                </Badge>
              </div>
            )}

            {/* Spécialités */}
            {commerce.specialties && commerce.specialties.length > 0 && (
              <div className="mt-2 flex gap-1">
                {commerce.specialties.slice(0, 2).map((specialty, i) => (
                  <Badge key={i} variant="secondary" className="text-xs h-4 px-1">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Recommandations intelligentes</h3>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="personalized" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Pour vous
            </TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              À proximité
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Nouveaux
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-96 overflow-y-auto">
            <TabsContent value="personalized" className="m-0 space-y-3">
              {personalizedRecommendations.map((commerce) => (
                <RecommendationCard 
                  key={commerce.id} 
                  commerce={commerce}
                  reason="Correspond à vos préférences"
                />
              ))}
              {personalizedRecommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune recommandation personnalisée pour le moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nearby" className="m-0 space-y-3">
              {nearbyCommerces.map((commerce) => (
                <RecommendationCard 
                  key={commerce.id} 
                  commerce={commerce}
                  reason="À moins de 1.5km"
                />
              ))}
              {nearbyCommerces.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun commerce à proximité</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending" className="m-0 space-y-3">
              {trendingCommerces.map((commerce) => (
                <RecommendationCard 
                  key={commerce.id} 
                  commerce={commerce}
                  reason="Très populaire"
                />
              ))}
            </TabsContent>

            <TabsContent value="new" className="m-0 space-y-3">
              {newCommerces.map((commerce) => (
                <RecommendationCard 
                  key={commerce.id} 
                  commerce={commerce}
                  reason="Nouveau commerce"
                />
              ))}
              {newCommerces.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun nouveau commerce récemment</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Section statistiques rapides */}
      <div className="p-4 bg-muted/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{commerces.length}</div>
            <div className="text-xs text-muted-foreground">Commerces</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {commerces.filter(c => c.openNow).length}
            </div>
            <div className="text-xs text-muted-foreground">Ouverts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">
              {(commerces.reduce((acc, c) => acc + c.rating, 0) / commerces.length).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Note moy.</div>
          </div>
        </div>
      </div>
    </div>
  );
};