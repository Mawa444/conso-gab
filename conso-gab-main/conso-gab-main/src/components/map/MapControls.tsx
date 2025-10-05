import { useState } from "react";
import { Filter, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { businessCategories } from "@/data/businessCategories";

interface MapControlsProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showVerifiedOnly?: boolean;
  onVerifiedToggle?: (verified: boolean) => void;
  className?: string;
}

export const MapControls = ({
  selectedCategory = "all",
  onCategorySelect,
  searchQuery = "",
  onSearchChange,
  showVerifiedOnly = false,
  onVerifiedToggle,
  className = ""
}: MapControlsProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    onCategorySelect?.("all");
    onSearchChange?.("");
    onVerifiedToggle?.(false);
  };

  const hasActiveFilters = selectedCategory !== "all" || searchQuery || showVerifiedOnly;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSearchChange?.("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="px-3"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filtres</h3>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-xs h-6"
                >
                  Effacer tout
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Toggle pour les entreprises vérifiées */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Entreprises vérifiées uniquement</span>
              </div>
              <Switch
                checked={showVerifiedOnly}
                onCheckedChange={onVerifiedToggle}
              />
            </div>

            {/* Catégories */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Catégories</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  key="all"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategorySelect?.("all")}
                  className="justify-start h-8"
                >
                  Toutes
                </Button>
                {businessCategories.slice(0, 5).map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategorySelect?.(category.id)}
                    className="justify-start h-8 text-xs"
                  >
                    <span className="mr-1">{category.icon}</span>
                    <span className="truncate">{category.nom}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges des filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {businessCategories.find(c => c.id === selectedCategory)?.nom || selectedCategory}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onCategorySelect?.("all")}
              />
            </Badge>
          )}
          
          {showVerifiedOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Vérifiées uniquement
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onVerifiedToggle?.(false)}
              />
            </Badge>
          )}
          
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              "{searchQuery}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onSearchChange?.("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};