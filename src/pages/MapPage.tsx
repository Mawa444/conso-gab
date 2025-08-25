import { useState, useMemo } from "react";
import { Search, Filter, MapPin, Navigation, Star, Grid, List, SlidersHorizontal, TrendingUp, Clock, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const mapCommerces = [
  {
    id: "map_001",
    name: "Boulangerie Chez Mama Nzé",
    type: "Boulangerie",
    category: "Restauration",
    owner: "Marie Nzé",
    address: "Quartier Nombakélé, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Marie", "Jean-Claude", "Esperance"],
    distance: "300m",
    priceRange: "€",
    openNow: true,
    reviews: 156,
    coordinates: { lat: 0.4162, lng: 9.4673 }
  },
  {
    id: "map_002",
    name: "Garage Auto Gaboma",
    type: "Garage automobile",
    category: "Automobile", 
    owner: "Pierre Ekomi",
    address: "Route Nationale, Libreville",
    rating: 4.5,
    verified: true,
    employees: ["Pierre", "André", "Michel", "Joseph"],
    distance: "650m",
    priceRange: "€€",
    openNow: true,
    reviews: 89,
    coordinates: { lat: 0.4152, lng: 9.4683 }
  },
  {
    id: "map_003",
    name: "Coiffure Afrique Beauté",
    type: "Salon de coiffure",
    category: "Beauté",
    owner: "Sylvie Mbourou",
    address: "Quartier Akanda, Libreville", 
    rating: 4.9,
    verified: true,
    employees: ["Sylvie", "Grace", "Fatou", "Aline"],
    distance: "1.1km",
    priceRange: "€€",
    openNow: false,
    reviews: 234,
    coordinates: { lat: 0.4172, lng: 9.4663 }
  },
  {
    id: "map_004",
    name: "Restaurant Le Palmier",
    type: "Restaurant traditionnel",
    category: "Restauration",
    owner: "Paul Mba",
    address: "Centre-ville, Libreville",
    rating: 4.6,
    verified: true,
    employees: ["Paul", "Marie", "Jean", "Sylvie", "Grace"],
    distance: "800m",
    priceRange: "€€€",
    openNow: true,
    reviews: 312,
    coordinates: { lat: 0.4142, lng: 9.4653 }
  },
  {
    id: "map_005",
    name: "Quincaillerie Moderne",
    type: "Quincaillerie",
    category: "Bricolage",
    owner: "André Obame",
    address: "Quartier Oloumi, Libreville",
    rating: 4.3,
    verified: true,
    employees: ["André", "Michel", "Joseph"],
    distance: "1.2km",
    priceRange: "€€",
    openNow: true,
    reviews: 67,
    coordinates: { lat: 0.4132, lng: 9.4693 }
  },
  {
    id: "map_006",
    name: "Pharmacie du Soleil",
    type: "Pharmacie",
    category: "Santé",
    owner: "Dr. Marie Ndong",
    address: "Quartier Glass, Libreville",
    rating: 4.7,
    verified: true,
    employees: ["Dr. Marie", "Infirmier Paul", "Assistant Claire"],
    distance: "500m",
    priceRange: "€€",
    openNow: true,
    reviews: 198,
    coordinates: { lat: 0.4172, lng: 9.4643 }
  }
];

const categories = [
  { id: "all", name: "Tous", count: 847, icon: "🏪" },
  { id: "Restauration", name: "Restauration", count: 156, icon: "🍽️" },
  { id: "Beauté", name: "Beauté", count: 89, icon: "💄" },
  { id: "Automobile", name: "Automobile", count: 67, icon: "🚗" },
  { id: "Bricolage", name: "Bricolage", count: 123, icon: "🔨" },
  { id: "Santé", name: "Santé", count: 234, icon: "⚕️" },
  { id: "Services", name: "Services", count: 178, icon: "🛠️" },
  { id: "Shopping", name: "Shopping", count: 95, icon: "🛍️" }
];

const sortOptions = [
  { id: "rating", name: "Mieux notés", icon: Star },
  { id: "distance", name: "Plus proches", icon: MapPin },
  { id: "popular", name: "Plus populaires", icon: TrendingUp },
  { id: "recent", name: "Récents", icon: Clock }
];

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

  const filteredCommerces = useMemo(() => {
    let filtered = mapCommerces.filter(commerce => {
      const matchesSearch = commerce.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           commerce.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           commerce.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || commerce.category === selectedCategory;
      
      const matchesDistance = parseFloat(commerce.distance) <= distanceRange[0];
      
      const matchesPrice = priceRange.includes(commerce.priceRange);
      
      const matchesOpen = !openNow || commerce.openNow;

      return matchesSearch && matchesCategory && matchesDistance && matchesPrice && matchesOpen;
    });

    // Tri
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case "recent":
        // Tri aléatoire pour simuler les récents
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, distanceRange, priceRange, openNow]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col animate-fade-in">
      {/* Header moderne avec recherche et filtres */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-24 z-40">
        <div className="p-6 space-y-4">
          {/* Barre de recherche principale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, type, quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-24 py-3 text-base bg-background/80 border-border/50 focus:border-primary/50"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-8 px-3 ${showFilters ? 'bg-primary/10 text-primary' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filtres
              </Button>
            </div>
          </div>

          {/* Filtres avancés (collapsible) */}
          {showFilters && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Distance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Distance: {distanceRange[0]} km
                  </label>
                  <Slider
                    value={distanceRange}
                    onValueChange={setDistanceRange}
                    max={10}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gamme de prix</label>
                  <div className="flex gap-2">
                    {["€", "€€", "€€€"].map(price => (
                      <Badge
                        key={price}
                        variant={priceRange.includes(price) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setPriceRange(prev => 
                            prev.includes(price) 
                              ? prev.filter(p => p !== price)
                              : [...prev, price]
                          )
                        }}
                      >
                        {price}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ouvert maintenant */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Disponibilité
                  </label>
                  <Badge
                    variant={openNow ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setOpenNow(!openNow)}
                  >
                    Ouvert maintenant
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Catégories horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="whitespace-nowrap cursor-pointer transition-all hover:scale-105 px-4 py-2 text-sm font-medium flex items-center gap-2"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="text-base">{category.icon}</span>
                {category.name}
                <span className="text-xs opacity-70">({category.count})</span>
              </Badge>
            ))}
          </div>

          {/* Contrôles de vue et tri */}
          <div className="flex items-center justify-between gap-4">
            {/* Vue toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="text-sm font-medium"
              >
                <Grid className="w-4 h-4 mr-2" />
                Carte
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-sm font-medium"
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {option.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-2" />
                Ma position
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 relative">
        <Tabs value={viewMode} className="h-full">
          {/* Vue Carte */}
          <TabsContent value="map" className="h-full m-0">
            <div className="h-full relative bg-gradient-to-br from-muted/20 to-muted/10">
              {/* Carte interactive simulée */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                {/* Grid pour simuler une carte */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="border border-muted/20" />
                    ))}
                  </div>
                </div>

                {/* Points des commerces sur la carte */}
                {filteredCommerces.map((commerce, index) => {
                  const positions = [
                    { top: '20%', left: '15%' },
                    { top: '35%', left: '65%' },
                    { top: '60%', left: '25%' },
                    { top: '45%', left: '80%' },
                    { top: '75%', left: '40%' },
                    { top: '25%', left: '85%' }
                  ];
                  const position = positions[index % positions.length];
                  
                  return (
                    <div
                      key={commerce.id}
                      className="absolute group cursor-pointer animate-bounce-soft"
                      style={{ ...position, animationDelay: `${index * 0.2}s` }}
                    >
                      {/* Pin marker */}
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold relative hover:scale-110 transition-transform">
                        {categories.find(cat => cat.id === commerce.category)?.icon || '🏪'}
                        
                        {/* Tooltip au hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-48">
                            <div className="font-semibold text-sm">{commerce.name}</div>
                            <div className="text-xs text-muted-foreground mb-1">{commerce.type}</div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{commerce.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{commerce.distance}</span>
                              {commerce.openNow && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">Ouvert</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Panneau latéral avec résultats */}
                <div className="absolute top-4 right-4 w-80 max-h-96 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                    <h3 className="font-semibold text-lg">Commerces trouvés</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredCommerces.length} résultat{filteredCommerces.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {filteredCommerces.map((commerce) => (
                      <div
                        key={commerce.id}
                        className="p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-lg">
                            {categories.find(cat => cat.id === commerce.category)?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{commerce.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{commerce.address}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{commerce.rating}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{commerce.distance}</span>
                              {commerce.openNow && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Badge variant="outline" className="text-xs h-5 px-2 text-green-600">
                                    Ouvert
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Vue Liste */}
          <TabsContent value="list" className="h-full m-0">
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Stats et résumé */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {filteredCommerces.length} commerce{filteredCommerces.length > 1 ? 's' : ''} trouvé{filteredCommerces.length > 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory === "all" ? "Toutes catégories" : categories.find(c => c.id === selectedCategory)?.name} 
                        {' '} • Tri par {sortOptions.find(s => s.id === sortBy)?.name.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        {filteredCommerces.reduce((acc, c) => acc + c.employees.length, 0)}
                      </span>
                      <span className="text-sm text-muted-foreground">employés</span>
                    </div>
                  </div>
                </div>

                {/* Liste des commerces */}
                <div className="space-y-4">
                  {filteredCommerces.map((commerce, index) => (
                    <div key={commerce.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CommerceCard
                        commerce={commerce}
                        variant="default"
                        onSelect={(commerce) => {
                          console.log("Sélectionné:", commerce);
                        }}
                        onFavorite={(id) => {
                          console.log("Toggle favorite:", id);
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {filteredCommerces.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                      <Search className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Aucun commerce trouvé</h3>
                    <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">
                      Essayez de modifier vos critères de recherche ou d'élargir votre zone de recherche
                    </p>
                    <Button onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setDistanceRange([5]);
                      setPriceRange(["€", "€€", "€€€"]);
                      setOpenNow(false);
                    }}>
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer fixe avec stats */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {filteredCommerces.length} / {mapCommerces.length} commerces
            </span>
            <Badge variant="outline" className="text-primary">
              100% ConsoGab
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Libreville, Gabon</span>
          </div>
        </div>
      </div>
    </div>
  );
};