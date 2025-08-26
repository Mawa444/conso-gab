import { useState, useMemo } from "react";
import { Star, MapPin, Phone, Clock, Navigation, Zap, TrendingUp, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Commerce, categories } from "@/data/mockCommerces";

interface InteractiveMapProps {
  commerces: Commerce[];
  selectedCategory: string;
  onCommerceSelect?: (commerce: Commerce) => void;
}

interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  commerces: Commerce[];
  position: { top: string; left: string };
}

export const InteractiveMap = ({ commerces, selectedCategory, onCommerceSelect }: InteractiveMapProps) => {
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // Création des clusters géographiques
  const clusters = useMemo(() => {
    const gridSize = 0.008; // Taille de la grille pour clustering
    const clusterMap = new Map<string, Commerce[]>();

    commerces.forEach(commerce => {
      const gridLat = Math.floor(commerce.coordinates.lat / gridSize) * gridSize;
      const gridLng = Math.floor(commerce.coordinates.lng / gridSize) * gridSize;
      const key = `${gridLat}_${gridLng}`;
      
      if (!clusterMap.has(key)) {
        clusterMap.set(key, []);
      }
      clusterMap.get(key)!.push(commerce);
    });

    const positions = [
      { top: '15%', left: '20%' }, { top: '25%', left: '15%' }, { top: '35%', left: '65%' },
      { top: '20%', left: '80%' }, { top: '45%', left: '25%' }, { top: '60%', left: '75%' },
      { top: '50%', left: '40%' }, { top: '75%', left: '30%' }, { top: '70%', left: '85%' },
      { top: '85%', left: '55%' }, { top: '30%', left: '45%' }, { top: '55%', left: '60%' },
      { top: '40%', left: '10%' }, { top: '65%', left: '45%' }, { top: '25%', left: '55%' },
      { top: '80%', left: '20%' }, { top: '10%', left: '70%' }, { top: '45%', left: '90%' }
    ];

    return Array.from(clusterMap.entries()).map(([key, clusterCommerces], index) => {
      const [lat, lng] = key.split('_').map(Number);
      return {
        id: key,
        lat,
        lng,
        commerces: clusterCommerces,
        position: positions[index % positions.length]
      };
    });
  }, [commerces]);

  const getClusterColor = (cluster: MapCluster) => {
    if (selectedCategory === "all") {
      // Couleur basée sur la densité
      if (cluster.commerces.length >= 5) return "from-red-500 to-red-600";
      if (cluster.commerces.length >= 3) return "from-orange-500 to-orange-600";
      return "from-blue-500 to-blue-600";
    }
    
    // Couleur basée sur la catégorie sélectionnée
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.color || "from-primary to-accent";
  };

  const getTrendingData = () => {
    const totalCommerces = commerces.length;
    const openNow = commerces.filter(c => c.openNow).length;
    const verified = commerces.filter(c => c.verified).length;
    const highRated = commerces.filter(c => c.rating >= 4.5).length;
    
    return { totalCommerces, openNow, verified, highRated };
  };

  const trendingData = getTrendingData();

  return (
    <div className="h-full relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 overflow-hidden">
      {/* Fond de carte stylisé */}
      <div className="absolute inset-0">
        {/* Grille géographique */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-muted/20" />
            ))}
          </div>
        </div>

        {/* Zones géographiques stylisées */}
        <div className="absolute top-10 left-10 w-32 h-24 bg-green-200/30 dark:bg-green-800/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-16 w-40 h-28 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-2xl" />

        {/* Lignes de transport simulées */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path d="M0,50% Q25%,30% 50%,50% T100%,40%" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary/30" />
          <path d="M20%,0 Q50%,25% 80%,50% Q90%,75% 100%,100%" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent/30" />
        </svg>
      </div>

      {/* Clusters de commerces */}
      {clusters.map((cluster, index) => {
        const isHovered = hoveredCluster === cluster.id;
        const clusterSize = cluster.commerces.length;
        const size = Math.min(60 + clusterSize * 8, 80);
        
        return (
          <div
            key={cluster.id}
            className="absolute group cursor-pointer animate-bounce-soft z-20"
            style={{ 
              ...cluster.position, 
              animationDelay: `${index * 0.15}s`,
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseEnter={() => setHoveredCluster(cluster.id)}
            onMouseLeave={() => setHoveredCluster(null)}
          >
            {/* Cluster principal */}
            <div 
              className={`relative flex items-center justify-center rounded-full border-4 border-white shadow-xl text-white font-bold transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${getClusterColor(cluster)}`}
              style={{ width: size, height: size }}
            >
              {clusterSize === 1 ? (
                <span className="text-xl">
                  {categories.find(cat => cat.id === cluster.commerces[0].category)?.icon || '🏪'}
                </span>
              ) : (
                <span className="text-lg">{clusterSize}</span>
              )}

              {/* Pulse animation pour les clusters importants */}
              {clusterSize >= 5 && (
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getClusterColor(cluster)} animate-ping opacity-20`} />
              )}
            </div>

            {/* Tooltip détaillé au hover */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-30">
                <Card className="w-72 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {clusterSize === 1 ? cluster.commerces[0].name : `${clusterSize} commerces`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {clusterSize === 1 ? (
                      // Détails pour un commerce unique
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          {cluster.commerces[0].type} • {cluster.commerces[0].district}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{cluster.commerces[0].rating}</span>
                          </div>
                          <span>•</span>
                          <span>{cluster.commerces[0].distance}</span>
                          {cluster.commerces[0].openNow && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="h-4 px-1 text-green-600 text-xs">
                                Ouvert
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {cluster.commerces[0].specialties?.slice(0, 2).map((specialty, i) => (
                            <Badge key={i} variant="secondary" className="text-xs h-5">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Résumé pour un cluster
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>Note moy: {(cluster.commerces.reduce((acc, c) => acc + c.rating, 0) / cluster.commerces.length).toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-green-500" />
                            <span>{cluster.commerces.filter(c => c.openNow).length} ouverts</span>
                          </div>
                        </div>
                        
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {cluster.commerces.slice(0, 4).map((commerce, i) => (
                            <div key={i} className="text-xs flex items-center gap-2">
                              <span className="text-sm">
                                {categories.find(cat => cat.id === commerce.category)?.icon}
                              </span>
                              <span className="truncate flex-1">{commerce.name}</span>
                              {commerce.verified && (
                                <span className="text-primary">✓</span>
                              )}
                            </div>
                          ))}
                          {cluster.commerces.length > 4 && (
                            <div className="text-xs text-muted-foreground">
                              +{cluster.commerces.length - 4} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      })}

      {/* Panneau de statistiques en temps réel */}
      <Card className="absolute top-4 right-4 w-80 bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Activité en temps réel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="text-2xl font-bold text-primary">{trendingData.totalCommerces}</div>
              <div className="text-xs text-muted-foreground">Commerces actifs</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="text-2xl font-bold text-green-600">{trendingData.openNow}</div>
              <div className="text-xs text-muted-foreground">Ouverts maintenant</div>
            </div>
          </div>

          {/* Indicateurs de qualité */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  ✓
                </Badge>
                Vérifiés
              </span>
              <span className="font-semibold">{trendingData.verified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Note ≥ 4.5
              </span>
              <span className="font-semibold">{trendingData.highRated}</span>
            </div>
          </div>

          {/* Catégorie active */}
          {selectedCategory !== "all" && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {categories.find(cat => cat.id === selectedCategory)?.icon}
                </span>
                <span className="font-medium text-sm">
                  {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {commerces.length} établissements dans cette zone
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Voir tout
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Navigation className="w-3 h-3 mr-1" />
              Centrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Légende de la carte */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
        <div className="text-sm font-medium mb-2">Légende</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
            <span>1-2 commerces</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600"></div>
            <span>3-4 commerces</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600"></div>
            <span>5+ commerces</span>
          </div>
        </div>
      </div>

      {/* Indicateur de position utilisateur */}
      <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        </div>
      </div>
    </div>
  );
};