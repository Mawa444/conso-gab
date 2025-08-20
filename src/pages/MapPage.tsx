import { useState } from "react";
import { Search, Filter, MapPin, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CommerceCard } from "@/components/commerce/CommerceCard";

const mapCommerces = [
  {
    id: "map_001",
    name: "Boulangerie Chez Mama Nzé",
    type: "Boulangerie",
    owner: "Marie Nzé",
    address: "Quartier Nombakélé, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Marie", "Jean-Claude", "Esperance"],
    distance: "300m",
    coordinates: { lat: 0.4162, lng: 9.4673 }
  },
  {
    id: "map_002",
    name: "Garage Auto Gaboma",
    type: "Garage automobile", 
    owner: "Pierre Ekomi",
    address: "Route Nationale, Libreville",
    rating: 4.5,
    verified: true,
    employees: ["Pierre", "André", "Michel", "Joseph"],
    distance: "650m",
    coordinates: { lat: 0.4152, lng: 9.4683 }
  },
  {
    id: "map_003",
    name: "Coiffure Afrique Beauté",
    type: "Salon de coiffure",
    owner: "Sylvie Mbourou",
    address: "Quartier Akanda, Libreville", 
    rating: 4.9,
    verified: true,
    employees: ["Sylvie", "Grace", "Fatou", "Aline"],
    distance: "1.1km",
    coordinates: { lat: 0.4172, lng: 9.4663 }
  }
];

const categories = [
  { id: "all", name: "Tous", count: 847 },
  { id: "food", name: "Restauration", count: 156 },
  { id: "beauty", name: "Beauté", count: 89 },
  { id: "auto", name: "Automobile", count: 67 },
  { id: "shopping", name: "Shopping", count: 123 },
  { id: "services", name: "Services", count: 234 }
];

export const MapPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const filteredCommerces = mapCommerces.filter(commerce => {
    const matchesSearch = commerce.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         commerce.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="h-screen bg-background flex flex-col pb-20">
      {/* Header avec recherche */}
      <div className="bg-card border-b border-border/50 p-4 space-y-3">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un commerce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 bg-background"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Catégories */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="whitespace-nowrap cursor-pointer transition-colors"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Toggle view et localisation */}
        <div className="flex items-center justify-between">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="text-xs"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Carte
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="text-xs"
            >
              Liste
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Navigation className="w-4 h-4 mr-1" />
            Ma position
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          // Vue carte
          <div className="h-full relative bg-gradient-to-br from-muted/30 to-muted/10">
            {/* Carte simulée avec commerces */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Carte interactive</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {filteredCommerces.length} commerces Gaboma trouvés dans votre zone
                </p>
                <div className="space-y-2">
                  {filteredCommerces.slice(0, 3).map((commerce) => (
                    <div
                      key={commerce.id}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 text-left"
                    >
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse-soft" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{commerce.name}</div>
                        <div className="text-xs text-muted-foreground">{commerce.distance}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{commerce.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Points de commerces sur la carte */}
            {filteredCommerces.map((commerce, index) => (
              <div
                key={commerce.id}
                className="absolute w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-bounce-soft"
                style={{
                  top: `${30 + index * 15}%`,
                  left: `${25 + index * 20}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        ) : (
          // Vue liste
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {filteredCommerces.map((commerce) => (
              <CommerceCard
                key={commerce.id}
                commerce={commerce}
                variant="default"
                onSelect={(commerce) => {
                  console.log("Sélectionné:", commerce);
                }}
                onFavorite={(id) => {
                  console.log("Toggle favorite:", id);
                }}
              />
            ))}
            
            {filteredCommerces.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Aucun commerce trouvé</h3>
                <p className="text-muted-foreground text-sm">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Résultats compteur */}
      <div className="bg-card border-t border-border/50 p-3">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {filteredCommerces.length} commerce{filteredCommerces.length > 1 ? 's' : ''} trouvé{filteredCommerces.length > 1 ? 's' : ''} • 
            <span className="text-primary font-medium ml-1">100% Gaboma</span>
          </span>
        </div>
      </div>
    </div>
  );
};