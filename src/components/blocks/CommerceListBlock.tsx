import { useState } from "react";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid, List, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommerceListBlockProps {
  title?: string;
  commerces: any[];
  onSelect?: (commerce: any) => void;
  onFavorite?: (commerce: any) => void;
  onMessage?: (commerce: any) => void;
  showFilters?: boolean;
  viewMode?: "grid" | "list";
  className?: string;
}

export const CommerceListBlock = ({ 
  title = "Commerces recommandés",
  commerces, 
  onSelect, 
  onFavorite, 
  onMessage,
  showFilters = true,
  viewMode: initialViewMode = "grid",
  className 
}: CommerceListBlockProps) => {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [sortBy, setSortBy] = useState("rating");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAllCommerces, setShowAllCommerces] = useState(false);

  // Filtrage et tri
  const processedCommerces = commerces
    .filter(commerce => filterCategory === "all" || commerce.type === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "distance":
          return parseFloat(a.distance) - parseFloat(b.distance);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const displayedCommerces = showAllCommerces ? processedCommerces : processedCommerces.slice(0, 6);

  const categories = [...new Set(commerces.map(c => c.type))];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {processedCommerces.length}
          </Badge>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3">
            {/* Vue toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="w-9 h-9 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="w-9 h-9 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Note</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
              </SelectContent>
            </Select>

            {/* Catégorie */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Liste des commerces */}
      <div className={`${
        viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
      }`}>
        {displayedCommerces.map((commerce, index) => (
          <div
            key={commerce.id}
            className=""
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CommerceCard
              commerce={commerce}
              onSelect={onSelect}
              onFavorite={onFavorite}
              onMessage={onMessage}
              variant={viewMode === "list" ? "compact" : "default"}
            />
          </div>
        ))}
      </div>

      {/* Bouton "Voir plus" */}
      {!showAllCommerces && processedCommerces.length > 6 && (
        <div className="text-center">
          <Button
            variant="default"
            onClick={() => setShowAllCommerces(true)}
            className="border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
          >
            Voir plus de commerces
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Message si aucun résultat */}
      {processedCommerces.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun commerce trouvé</h3>
          <p className="text-muted-foreground">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
};