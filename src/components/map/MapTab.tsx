import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ZoomIn, ZoomOut, Locate, Navigation, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allCommerces, categories } from "@/data/mockCommerces";

export const MapTab = () => {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCommerce, setHoveredCommerce] = useState<string | null>(null);

  // Filtrage simple pour la carte
  const filteredCommerces = useMemo(() => {
    return allCommerces.filter(commerce => {
      const searchMatch = searchQuery === "" || 
        commerce.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commerce.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryMatch = selectedCategory === "all" || commerce.category === selectedCategory;
      
      return searchMatch && categoryMatch;
    });
  }, [searchQuery, selectedCategory]);

  // Positions des commerces sur la carte
  const commercePositions = useMemo(() => {
    const positions = [
      { top: '15%', left: '25%' }, { top: '20%', left: '70%' }, { top: '35%', left: '15%' },
      { top: '40%', left: '80%' }, { top: '25%', left: '45%' }, { top: '55%', left: '20%' },
      { top: '50%', left: '60%' }, { top: '65%', left: '75%' }, { top: '70%', left: '35%' },
      { top: '75%', left: '85%' }, { top: '80%', left: '50%' }, { top: '30%', left: '90%' },
      { top: '45%', left: '10%' }, { top: '60%', left: '40%' }, { top: '85%', left: '25%' },
      { top: '10%', left: '55%' }, { top: '90%', left: '65%' }, { top: '25%', left: '30%' },
      { top: '45%', left: '55%' }, { top: '65%', left: '15%' }, { top: '30%', left: '75%' },
      { top: '55%', left: '85%' }, { top: '75%', left: '10%' }, { top: '15%', left: '80%' }
    ];
    
    return filteredCommerces.map((commerce, index) => ({
      ...commerce,
      position: positions[index % positions.length]
    }));
  }, [filteredCommerces]);

  const handleCommerceClick = (commerceId: string) => {
    navigate(`/business/${commerceId}`);
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="h-full relative overflow-hidden">
      {/* Contrôles de carte */}
      <div className="absolute top-4 left-4 z-20 space-y-3">
        {/* Recherche rapide */}
        <Card className="w-80 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher sur la carte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-9"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchQuery || selectedCategory !== "all") && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {filteredCommerces.length} résultat{filteredCommerces.length > 1 ? 's' : ''}
                </Badge>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contrôles de zoom */}
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
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="absolute top-4 right-4 z-20">
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
                <div className="text-lg font-bold text-primary">{filteredCommerces.length}</div>
                <div className="text-xs text-muted-foreground">Commerces</div>
              </div>
              <div className="p-2 bg-green-500/5 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {filteredCommerces.filter(c => c.openNow).length}
                </div>
                <div className="text-xs text-muted-foreground">Ouverts</div>
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

          {/* Zones géographiques stylisées (quartiers) */}
          <div className="absolute top-10 left-10 w-40 h-32 bg-green-200/20 dark:bg-green-800/10 rounded-[50px] blur-xl" />
          <div className="absolute bottom-20 right-16 w-48 h-36 bg-blue-200/20 dark:bg-blue-800/10 rounded-[60px] blur-xl" />
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-56 h-40 bg-purple-200/15 dark:bg-purple-800/10 rounded-[70px] blur-2xl" />
          <div className="absolute bottom-1/3 left-1/4 w-44 h-28 bg-orange-200/20 dark:bg-orange-800/10 rounded-[40px] blur-xl" />
          <div className="absolute top-1/4 right-1/4 w-36 h-24 bg-pink-200/20 dark:bg-pink-800/10 rounded-[45px] blur-xl" />

          {/* Routes principales simulées */}
          <svg className="absolute inset-0 w-full h-full opacity-15">
            <path d="M0,30% Q20%,25% 40%,30% Q60%,35% 80%,30% Q90%,28% 100%,25%" stroke="currentColor" strokeWidth="3" fill="none" className="text-primary/40" />
            <path d="M20%,0 Q25%,20% 30%,40% Q35%,60% 40%,80% Q45%,90% 50%,100%" stroke="currentColor" strokeWidth="3" fill="none" className="text-accent/40" />
            <path d="M0,70% Q30%,65% 60%,70% Q80%,75% 100%,70%" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/30" />
          </svg>
        </div>

        {/* Points des commerces */}
        {commercePositions.map((commerce, index) => {
          const category = categories.find(cat => cat.id === commerce.category);
          const isHovered = hoveredCommerce === commerce.id;
          
          return (
            <div
              key={commerce.id}
              className="absolute cursor-pointer group z-10"
              style={{ 
                ...commerce.position,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                zIndex: isHovered ? 50 : 10
              }}
              onMouseEnter={() => setHoveredCommerce(commerce.id)}
              onMouseLeave={() => setHoveredCommerce(null)}
              onClick={() => handleCommerceClick(commerce.id)}
            >
              {/* Point principal */}
              <div 
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold transition-all duration-200 ${
                  commerce.verified ? 'bg-gradient-to-br from-primary to-primary-foreground' : 'bg-gradient-to-br from-muted-foreground to-muted'
                } ${isHovered ? 'shadow-xl' : ''}`}
              >
                <span className="text-xs">
                  {category?.icon || '🏪'}
                </span>
                
                {/* Pulse animation pour les commerces ouverts */}
                {commerce.openNow && (
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
                            <h4 className="font-semibold text-sm truncate">{commerce.name}</h4>
                            <p className="text-xs text-muted-foreground">{commerce.type}</p>
                          </div>
                          {commerce.verified && (
                            <Badge variant="secondary" className="text-xs ml-2">✓</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span>{commerce.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{commerce.distance}</span>
                          {commerce.openNow && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-green-600 h-4 px-1 text-xs">
                                Ouvert
                              </Badge>
                            </>
                          )}
                        </div>

                        <div className="flex gap-1 pt-1">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCommerceClick(commerce.id);
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
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary-foreground"></div>
                <span>Commerce vérifié</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-muted-foreground to-muted"></div>
                <span>Commerce standard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span>Ouvert maintenant</span>
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