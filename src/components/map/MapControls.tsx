import { useState } from "react";
import { Search, Filter, Navigation, Grid, List, SlidersHorizontal, MapPin, Clock, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { categories } from "@/data/mockCommerces";

interface MapControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  viewMode: "map" | "list";
  setViewMode: (mode: "map" | "list") => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  distanceRange: number[];
  setDistanceRange: (range: number[]) => void;
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  openNow: boolean;
  setOpenNow: (open: boolean) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (verified: boolean) => void;
  resultsCount: number;
}

const sortOptions = [
  { id: "rating", name: "Mieux notés", icon: Star },
  { id: "distance", name: "Plus proches", icon: MapPin },
  { id: "popular", name: "Plus populaires", icon: TrendingUp },
  { id: "recent", name: "Récents", icon: Clock }
];

export const MapControls = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  distanceRange,
  setDistanceRange,
  priceRange,
  setPriceRange,
  openNow,
  setOpenNow,
  verifiedOnly,
  setVerifiedOnly,
  resultsCount
}: MapControlsProps) => {
  return (
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          const newRange = priceRange.includes(price) 
                            ? priceRange.filter(p => p !== price)
                            : [...priceRange, price];
                          setPriceRange(newRange);
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
                <div className="flex gap-2">
                  <Badge
                    variant={openNow ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setOpenNow(!openNow)}
                  >
                    Ouvert maintenant
                  </Badge>
                  <Badge
                    variant={verifiedOnly ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                  >
                    Vérifiés ✓
                  </Badge>
                </div>
              </div>

              {/* Stats en temps réel */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Résultats
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{resultsCount}</span>
                  <span className="text-sm text-muted-foreground">commerces</span>
                </div>
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
              style={{
                background: selectedCategory === category.id 
                  ? `linear-gradient(135deg, ${category.color.split(' ')[0].replace('from-', '')}, ${category.color.split(' ')[1].replace('to-', '')})`
                  : undefined
              }}
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
  );
};