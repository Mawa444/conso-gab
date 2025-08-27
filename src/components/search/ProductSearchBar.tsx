import { useState, useCallback, useEffect } from "react";
import { Search, Mic, X, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductSearchBarProps {
  onSearch: (query: string, filters: ProductFilters) => void;
  onVoiceSearch?: () => void;
  currentLocation?: { lat: number; lng: number };
}

export interface ProductFilters {
  colors: string[];
  sizes: string[];
  ageGroups: string[];
  priceRange: [number, number];
  brands: string[];
  availability: string[];
  distance: number;
  minRating: number;
  verified: boolean;
  categories: string[];
}

const defaultFilters: ProductFilters = {
  colors: [],
  sizes: [],
  ageGroups: [],
  priceRange: [0, 1000000],
  brands: [],
  availability: [],
  distance: 5000, // 5km par défaut
  minRating: 0,
  verified: false,
  categories: []
};

const colorOptions = [
  { id: "blue", name: "Bleu", hex: "#3B82F6" },
  { id: "red", name: "Rouge", hex: "#EF4444" },
  { id: "green", name: "Vert", hex: "#10B981" },
  { id: "black", name: "Noir", hex: "#000000" },
  { id: "white", name: "Blanc", hex: "#FFFFFF" },
  { id: "yellow", name: "Jaune", hex: "#F59E0B" },
  { id: "pink", name: "Rose", hex: "#EC4899" },
  { id: "purple", name: "Violet", hex: "#8B5CF6" },
  { id: "gray", name: "Gris", hex: "#6B7280" },
  { id: "brown", name: "Marron", hex: "#92400E" },
];

const sizeOptions = [
  { id: "2y", name: "2 ans" },
  { id: "3y", name: "3 ans" },
  { id: "4y", name: "4 ans" },
  { id: "5y", name: "5 ans" },
  { id: "xs", name: "XS" },
  { id: "s", name: "S" },
  { id: "m", name: "M" },
  { id: "l", name: "L" },
  { id: "xl", name: "XL" },
  { id: "xxl", name: "XXL" },
];

const ageGroupOptions = [
  { id: "0-2y", name: "0-2 ans" },
  { id: "3-5y", name: "3-5 ans" },
  { id: "6-8y", name: "6-8 ans" },
  { id: "9-12y", name: "9-12 ans" },
  { id: "teen", name: "Adolescent" },
  { id: "adult", name: "Adulte" },
];

export const ProductSearchBar = ({ onSearch, onVoiceSearch, currentLocation }: ProductSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery || Object.values(filters).some(f => 
      Array.isArray(f) ? f.length > 0 : f !== defaultFilters[f as keyof ProductFilters]
    )) {
      onSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters, onSearch]);

  const handleVoiceSearch = useCallback(() => {
    if (!onVoiceSearch) return;
    
    setIsListening(true);
    onVoiceSearch();
    
    // Simulation d'écoute (remplacer par vraie implémentation)
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  }, [onVoiceSearch]);

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setQuery("");
  };

  const removeFilter = (type: keyof ProductFilters, value: string) => {
    if (Array.isArray(filters[type])) {
      setFilters(prev => ({
        ...prev,
        [type]: (prev[type] as string[]).filter(v => v !== value)
      }));
    }
  };

  const toggleArrayFilter = (type: keyof ProductFilters, value: string) => {
    if (Array.isArray(filters[type])) {
      const currentValues = filters[type] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      setFilters(prev => ({
        ...prev,
        [type]: newValues
      }));
    }
  };

  const activeFiltersCount = 
    filters.colors.length + 
    filters.sizes.length + 
    filters.ageGroups.length + 
    filters.brands.length + 
    filters.availability.length + 
    filters.categories.length +
    (filters.verified ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.distance !== 5000 ? 1 : 0);

  return (
    <div className="w-full space-y-3">
      {/* Barre de recherche principale */}
      <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un produit... (ex: t-shirt bleu enfant)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-11"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {onVoiceSearch && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceSearch}
                disabled={isListening}
                className={`h-11 px-3 ${isListening ? 'bg-red-50 border-red-200' : ''}`}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 px-3"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtres actifs (chips) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
              {filters.colors.map(color => {
                const colorOption = colorOptions.find(c => c.id === color);
                return (
                  <Badge
                    key={color}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFilter('colors', color)}
                  >
                    {colorOption?.name || color}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                );
              })}
              
              {filters.sizes.map(size => (
                <Badge
                  key={size}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeFilter('sizes', size)}
                >
                  Taille {size.toUpperCase()}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              
              {filters.ageGroups.map(age => {
                const ageOption = ageGroupOptions.find(a => a.id === age);
                return (
                  <Badge
                    key={age}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFilter('ageGroups', age)}
                  >
                    {ageOption?.name || age}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                );
              })}
              
              {filters.verified && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setFilters(prev => ({ ...prev, verified: false }))}
                >
                  Vérifié ✓
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                Tout effacer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panneau de filtres détaillés */}
      {showFilters && (
        <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Couleurs */}
              <div>
                <h4 className="font-medium text-sm mb-2">Couleurs</h4>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <Button
                      key={color.id}
                      variant={filters.colors.includes(color.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayFilter('colors', color.id)}
                      className="h-8 text-xs"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2 border"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tailles */}
              <div>
                <h4 className="font-medium text-sm mb-2">Tailles</h4>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(size => (
                    <Button
                      key={size.id}
                      variant={filters.sizes.includes(size.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayFilter('sizes', size.id)}
                      className="h-8 text-xs"
                    >
                      {size.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Groupes d'âge */}
              <div>
                <h4 className="font-medium text-sm mb-2">Âge</h4>
                <div className="flex flex-wrap gap-2">
                  {ageGroupOptions.map(age => (
                    <Button
                      key={age.id}
                      variant={filters.ageGroups.includes(age.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArrayFilter('ageGroups', age.id)}
                      className="h-8 text-xs"
                    >
                      {age.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Options diverses */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.verified ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, verified: !prev.verified }))}
                  className="h-8 text-xs"
                >
                  Commerce vérifié ✓
                </Button>
                
                {currentLocation && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Rayon: {(filters.distance / 1000).toFixed(1)}km</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};