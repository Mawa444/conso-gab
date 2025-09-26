import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ZoomIn, ZoomOut, Locate, Share2, Eye, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRealBusinesses } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { MapTabSkeleton } from "@/components/ui/skeleton-screens";

export const RealMapTab = () => {
  const navigate = useNavigate();
  const { businesses, loading, error } = useRealBusinesses();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredBusiness, setHoveredBusiness] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Afficher le skeleton pendant le chargement
  if (loading) {
    return <MapTabSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Aucune entreprise</h3>
          <p className="text-muted-foreground">Aucune entreprise n'est encore enregistrée sur la carte.</p>
        </div>
      </div>
    );
  }

  // Positions des entreprises sur la carte (distribution aléatoire mais cohérente)
  const businessPositions = useMemo(() => {
    const positions = [
      { top: '15%', left: '25%' }, { top: '20%', left: '70%' }, { top: '35%', left: '15%' },
      { top: '40%', left: '80%' }, { top: '25%', left: '45%' }, { top: '55%', left: '20%' },
      { top: '50%', left: '60%' }, { top: '65%', left: '75%' }, { top: '70%', left: '35%' },
      { top: '75%', left: '85%' }, { top: '80%', left: '50%' }, { top: '30%', left: '90%' },
      { top: '45%', left: '10%' }, { top: '60%', left: '40%' }, { top: '85%', left: '25%' },
      { top: '10%', left: '55%' }, { top: '90%', left: '65%' }, { top: '25%', left: '30%' },
      { top: '45%', left: '55%' }, { top: '65%', left: '15%' }, { top: '30%', left: '75%' },
    ];
    
    return businesses.map((business, index) => ({
      ...business,
      position: positions[index % positions.length]
    }));
  }, [businesses]);

  const handleUnifiedSearch = (results: any[]) => {
    setShowResults(results.length > 0);
  };

  const handleSearchResultSelect = (result: any) => {
    if (result.type === 'business') {
      navigate(`/business/${result.businessId}`);
    }
  };

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  const handleShareLocation = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="h-full relative overflow-hidden">
      {/* Barre de recherche unifiée */}
      <div className="absolute top-4 left-4 z-20 w-96">
        <UnifiedSearchBar
          onSearch={handleUnifiedSearch}
          onSelect={handleSearchResultSelect}
          placeholder="Rechercher une entreprise..."
          variant="card"
          size="md"
          currentLocation="Libreville"
          showResults={false}
        />
      </div>

      {/* Contrôles de carte */}
      <div className="absolute top-4 right-4 z-20 space-y-3">
        <div className="flex flex-col gap-1 bg-card/95 backdrop-blur-sm rounded-lg p-1 border">
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            className="p-2 h-8 w-8"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            className="p-2 h-8 w-8"
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="border-t my-1"></div>
          <Button size="sm" variant="ghost" className="p-2 h-8 w-8">
            <Locate className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleShareLocation} className="p-2 h-8 w-8">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="absolute bottom-4 right-4 z-20">
        <Card className="w-64 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Vue d'ensemble</h3>
              <Badge variant="outline" className="text-xs">
                Zoom {(zoomLevel * 100).toFixed(0)}%
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-primary/5 rounded-lg">
                <div className="text-lg font-bold text-primary">{businesses.length}</div>
                <div className="text-xs text-muted-foreground">Entreprises</div>
              </div>
              <div className="p-2 bg-green-500/5 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {businesses.filter(b => b.is_verified).length}
                </div>
                <div className="text-xs text-muted-foreground">Vérifiées</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte interactive */}
      <div 
        className="h-full w-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 relative transition-transform duration-300 ease-in-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Fond de carte stylisé */}
        <div className="absolute inset-0">
          {/* Grille géographique */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-muted/20" />
              ))}
            </div>
          </div>

          {/* Zones géographiques stylisées */}
          <div className="absolute top-10 left-10 w-40 h-32 bg-green-200/20 dark:bg-green-800/10 rounded-[50px] blur-xl" />
          <div className="absolute bottom-20 right-16 w-48 h-36 bg-blue-200/20 dark:bg-blue-800/10 rounded-[60px] blur-xl" />
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-56 h-40 bg-purple-200/15 dark:bg-purple-800/10 rounded-[70px] blur-2xl" />
        </div>

        {/* Points des entreprises */}
        {businessPositions.map((business) => {
          const category = businessCategories.find(cat => cat.id === business.category);
          const isHovered = hoveredBusiness === business.id;
          
          return (
            <div
              key={business.id}
              className="absolute cursor-pointer group z-10"
              style={{ 
                ...business.position,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                zIndex: isHovered ? 50 : 10
              }}
              onMouseEnter={() => setHoveredBusiness(business.id)}
              onMouseLeave={() => setHoveredBusiness(null)}
              onClick={() => handleBusinessClick(business.id)}
            >
              {/* Point principal */}
              <div 
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold transition-all duration-200 ${
                  business.is_verified ? 'bg-gradient-to-br from-primary to-primary/80' : 'bg-gradient-to-br from-muted-foreground to-muted'
                } ${isHovered ? 'shadow-xl' : ''}`}
              >
                <span className="text-xs">
                  {category?.icon || '🏪'}
                </span>
                
                {/* Animation pour les entreprises actives */}
                {business.is_active && (
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
                )}
              </div>

              {/* Tooltip au hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                  <Card className="w-64 shadow-2xl border-2 border-primary/20 bg-card/98 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{business.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {category?.nom || business.category}
                            </p>
                          </div>
                          {business.is_verified && (
                            <Badge variant="secondary" className="text-xs ml-2">✓</Badge>
                          )}
                        </div>
                        
                        {business.city && (
                          <div className="text-xs text-muted-foreground">
                            📍 {business.city}
                          </div>
                        )}

                        <div className="flex gap-1 pt-1">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBusinessClick(business.id);
                            }}
                            className="flex-1 h-7 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Navigation className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          );
        })}

        {/* Indicateur de position utilisateur */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-40"></div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <Badge variant="outline" className="text-xs bg-white/90">
              Votre position
            </Badge>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <h4 className="font-semibold text-xs mb-2">Légende</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/80"></div>
                <span>Entreprise vérifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-muted-foreground to-muted"></div>
                <span>Entreprise standard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Votre position</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};