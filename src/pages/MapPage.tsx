import { useState, useMemo } from "react";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapControls } from "@/components/map/MapControls";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { RecommendationEngine } from "@/components/map/RecommendationEngine";
import { allCommerces, categories } from "@/data/mockCommerces";

// Les données sont maintenant importées depuis mockCommerces.ts

interface MapPageProps {
  onBack?: () => void;
}

export const MapPage = ({ onBack }: MapPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [distanceRange, setDistanceRange] = useState([5]);
  const [priceRange, setPriceRange] = useState(["€", "€€", "€€€"]);
  const [openNow, setOpenNow] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const filteredCommerces = useMemo(() => {
    let filtered = allCommerces.filter(commerce => {
      const matchesSearch = commerce.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           commerce.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           commerce.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           commerce.district.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || commerce.category === selectedCategory;
      
      const matchesDistance = parseFloat(commerce.distance) <= distanceRange[0];
      
      const matchesPrice = priceRange.includes(commerce.priceRange);
      
      const matchesOpen = !openNow || commerce.openNow;
      
      const matchesVerified = !verifiedOnly || commerce.verified;

      return matchesSearch && matchesCategory && matchesDistance && matchesPrice && matchesOpen && matchesVerified;
    });

    // Tri intelligent
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => {
          // Priorise d'abord les commerces vérifiés, puis par note
          if (a.verified !== b.verified) return b.verified ? 1 : -1;
          return b.rating - a.rating;
        });
        break;
      case "distance":
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case "popular":
        filtered.sort((a, b) => {
          // Combine avis et note pour un score de popularité
          const scoreA = b.reviews * 0.7 + b.rating * 30;
          const scoreB = a.reviews * 0.7 + a.rating * 30;
          return scoreA - scoreB;
        });
        break;
      case "recent":
        // Tri par établissements récents puis par note
        filtered.sort((a, b) => {
          const yearA = a.established || 2010;
          const yearB = b.established || 2010;
          if (yearA !== yearB) return yearB - yearA;
          return b.rating - a.rating;
        });
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, distanceRange, priceRange, openNow, verifiedOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col animate-fade-in">
      {/* Contrôles de carte moderne */}
      <MapControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        distanceRange={distanceRange}
        setDistanceRange={setDistanceRange}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        openNow={openNow}
        setOpenNow={setOpenNow}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        resultsCount={filteredCommerces.length}
      />

      {/* Contenu principal avec layout avancé */}
      <div className="flex-1 relative">
        <Tabs value={viewMode} className="h-full">
          {/* Vue Carte Interactive */}
          <TabsContent value="map" className="h-full m-0">
            <div className="h-full flex gap-4 p-4">
              {/* Carte principale */}
              <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl border border-border/50">
                <InteractiveMap 
                  commerces={filteredCommerces} 
                  selectedCategory={selectedCategory}
                />
              </div>

              {/* Panneau latéral avec recommandations */}
              {showRecommendations && (
                <div className="w-96 space-y-4 animate-fade-in">
                  <RecommendationEngine 
                    commerces={filteredCommerces}
                    selectedCategory={selectedCategory}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Vue Liste Avancée */}
          <TabsContent value="list" className="h-full m-0">
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* En-tête avec statistiques avancées */}
                <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl p-6 border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl mb-1">
                        {filteredCommerces.length} commerce{filteredCommerces.length > 1 ? 's' : ''} trouvé{filteredCommerces.length > 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory === "all" ? "Toutes catégories" : categories.find(c => c.id === selectedCategory)?.name}
                        {' '} dans un rayon de {distanceRange[0]}km
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {filteredCommerces.filter(c => c.openNow).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Ouverts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {filteredCommerces.filter(c => c.verified).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Vérifiés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">
                          {filteredCommerces.length > 0 ? (filteredCommerces.reduce((acc, c) => acc + c.rating, 0) / filteredCommerces.length).toFixed(1) : '0'}
                        </div>
                        <div className="text-xs text-muted-foreground">Note moy.</div>
                      </div>
                    </div>
                  </div>

                  {/* Métriques détaillées */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
                      <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                      <div className="font-bold text-primary">
                        {filteredCommerces.reduce((acc, c) => acc + c.employees.length, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Employés</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
                      <MapPin className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <div className="font-bold text-blue-600">
                        {new Set(filteredCommerces.map(c => c.district)).size}
                      </div>
                      <div className="text-xs text-muted-foreground">Quartiers</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
                      <div className="w-5 h-5 text-purple-500 mx-auto mb-1 flex items-center justify-center text-sm font-bold">€</div>
                      <div className="font-bold text-purple-600">
                        {filteredCommerces.filter(c => c.priceRange === "€").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Économiques</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-center">
                      <div className="w-5 h-5 text-yellow-500 mx-auto mb-1">⭐</div>
                      <div className="font-bold text-yellow-600">
                        {filteredCommerces.filter(c => c.rating >= 4.5).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Excellence</div>
                    </div>
                  </div>
                </div>

                {/* Grille de commerces avec animation */}
                <div className="grid gap-4">
                  {filteredCommerces.map((commerce, index) => (
                    <div 
                      key={commerce.id} 
                      className="animate-fade-in hover:scale-[1.02] transition-transform duration-300" 
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CommerceCard
                        commerce={commerce}
                        variant="default"
                        onSelect={(commerce) => {
                          console.log("Commerce sélectionné:", commerce);
                        }}
                        onFavorite={(id) => {
                          console.log("Toggle favorite:", id);
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {/* État vide avec actions */}
                {filteredCommerces.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Aucun commerce trouvé</h3>
                    <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                      Aucun établissement ne correspond à vos critères dans cette zone. 
                      Essayez d'élargir votre recherche ou de modifier vos filtres.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        size="lg"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setDistanceRange([5]);
                          setPriceRange(["€", "€€", "€€€"]);
                          setOpenNow(false);
                          setVerifiedOnly(false);
                        }}
                      >
                        Réinitialiser tous les filtres
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setDistanceRange([10])}>
                        Élargir la zone de recherche
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer avec statistiques en temps réel */}
      <div className="bg-gradient-to-r from-card/95 via-card/98 to-card/95 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {filteredCommerces.length} / {allCommerces.length} commerces
              </span>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">
              🇬🇦 100% ConsoGab
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-300">
              ✓ {filteredCommerces.filter(c => c.verified).length} Vérifiés
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>Libreville, Gabon</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Mise à jour en temps réel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};