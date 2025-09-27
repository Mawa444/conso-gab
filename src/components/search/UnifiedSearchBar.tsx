import { useState, useCallback, useEffect } from "react";
import { Search, Mic, X, Filter, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import { useUnifiedSearch, type UnifiedSearchFilters, type SearchResult } from "@/hooks/use-unified-search";
import { cn } from "@/lib/utils";
interface UnifiedSearchBarProps {
  onSearch?: (results: SearchResult[]) => void;
  onSelect?: (result: SearchResult) => void;
  onVoiceSearch?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  showResults?: boolean;
  currentLocation?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "card";
}
const businessCategories = [{
  id: "restaurant" as const,
  name: "Restaurant"
}, {
  id: "retail" as const,
  name: "Commerce"
}, {
  id: "services" as const,
  name: "Services"
}, {
  id: "technology" as const,
  name: "Technologie"
}, {
  id: "healthcare" as const,
  name: "Santé"
}, {
  id: "education" as const,
  name: "Éducation"
}, {
  id: "finance" as const,
  name: "Finance"
}, {
  id: "real_estate" as const,
  name: "Immobilier"
}, {
  id: "automotive" as const,
  name: "Automobile"
}, {
  id: "beauty" as const,
  name: "Beauté"
}, {
  id: "fitness" as const,
  name: "Fitness"
}, {
  id: "entertainment" as const,
  name: "Divertissement"
}, {
  id: "agriculture" as const,
  name: "Agriculture"
}, {
  id: "manufacturing" as const,
  name: "Industrie"
}, {
  id: "other" as const,
  name: "Autres"
}];
const defaultFilters: UnifiedSearchFilters = {
  verified: false,
  minRating: 0
};
export const UnifiedSearchBar = ({
  onSearch,
  onSelect,
  onVoiceSearch,
  placeholder = "Rechercher une entreprise, service ou produit...",
  showFilters = true,
  showResults = true,
  currentLocation,
  className,
  size = "md",
  variant = "default"
}: UnifiedSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<UnifiedSearchFilters>(defaultFilters);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const {
    search,
    results,
    loading,
    error,
    clearResults
  } = useUnifiedSearch();
  useEffect(() => {
    if (debouncedQuery || Object.values(filters).some(f => f !== defaultFilters[f as keyof UnifiedSearchFilters])) {
      search(debouncedQuery, filters);
    } else {
      clearResults();
    }
  }, [debouncedQuery, filters, search, clearResults]);
  useEffect(() => {
    onSearch?.(results);
  }, [results, onSearch]);
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
    clearResults();
  };
  const toggleFilter = (key: keyof UnifiedSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? typeof value === 'boolean' ? false : undefined : value
    }));
  };
  const activeFiltersCount = Object.values(filters).filter(f => f !== undefined && f !== false && f !== 0 && f !== '').length;
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'business':
        return '🏢';
      case 'catalog':
        return '📁';
      case 'product':
        return '🛍️';
      default:
        return '🏪';
    }
  };
  const sizeClasses = {
    sm: "h-9 text-sm",
    md: "h-11 text-base",
    lg: "h-14 text-lg"
  };
  const containerClass = cn("w-full space-y-3", className);
  const searchBarContent = <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 rounded-3xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder={placeholder} value={query} onChange={e => setQuery(e.target.value)} className={cn("pl-10 pr-10", sizeClasses[size])} />
          {query && <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>}
          {loading && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>}
        </div>
        
        {onVoiceSearch && <Button variant="outline" size="sm" onClick={handleVoiceSearch} disabled={isListening} className={cn(sizeClasses[size], "px-3", isListening ? 'bg-red-50 border-red-200' : '')}>
            <Mic className={cn("w-4 h-4", isListening ? 'text-red-500 animate-pulse' : '')} />
          </Button>}
        
        {showFilters && <Button variant="outline" size="sm" onClick={() => setShowFilterPanel(!showFilterPanel)} className={cn(sizeClasses[size], "px-3")}>
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>}
          </Button>}
      </div>

      {/* Filtres actifs */}
      {activeFiltersCount > 0 && <div className="flex flex-wrap gap-1 pt-3 border-t">
          {filters.category && <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => toggleFilter('category', undefined)}>
              {businessCategories.find(c => c.id === filters.category)?.name || filters.category}
              <X className="w-3 h-3 ml-1" />
            </Badge>}
          
          {filters.verified && <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => toggleFilter('verified', false)}>
              Vérifié ✓
              <X className="w-3 h-3 ml-1" />
            </Badge>}
          
          {filters.location && <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => toggleFilter('location', undefined)}>
              <MapPin className="w-3 h-3 mr-1" />
              {filters.location}
              <X className="w-3 h-3 ml-1" />
            </Badge>}
          
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive">
            Tout effacer
          </Button>
        </div>}
    </>;
  return <div className={containerClass}>
      {/* Barre de recherche */}
      {variant === "card" ? <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            {searchBarContent}
          </CardContent>
        </Card> : variant === "minimal" ? <div className="border p-3 rounded-3xl bg-white py-[10px]">
          {searchBarContent}
        </div> : <div className="space-y-3">
          {searchBarContent}
        </div>}

      {/* Panneau de filtres */}
      {showFilters && showFilterPanel && <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Catégories */}
              <div>
                <h4 className="font-medium text-sm mb-2">Catégories</h4>
                <div className="flex flex-wrap gap-2">
                  {businessCategories.map(category => <Button key={category.id} variant={filters.category === category.id ? "default" : "outline"} size="sm" onClick={() => toggleFilter('category', category.id)} className="h-8 text-xs">
                      {category.name}
                    </Button>)}
                </div>
              </div>

              <Separator />

              {/* Options diverses */}
              <div className="flex flex-wrap gap-2">
                <Button variant={filters.verified ? "default" : "outline"} size="sm" onClick={() => toggleFilter('verified', true)} className="h-8 text-xs">
                  Commerce vérifié ✓
                </Button>
                
                {currentLocation && <Button variant={filters.location === currentLocation ? "default" : "outline"} size="sm" onClick={() => toggleFilter('location', currentLocation)} className="h-8 text-xs">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentLocation}
                  </Button>}
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Résultats de recherche */}
      {showResults && results.length > 0 && <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Résultats ({results.length})</h4>
                <Button variant="ghost" size="sm" onClick={clearResults} className="h-6 px-2 text-xs">
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map(result => <div key={`${result.type}-${result.id}`} onClick={() => onSelect?.(result)} className="p-3 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getResultIcon(result.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-sm truncate">{result.title}</h5>
                        {result.verified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {result.type === 'business' ? 'Entreprise' : result.type === 'catalog' ? 'Catalogue' : 'Produit'}
                        </Badge>
                      </div>
                      
                      {result.description && <p className="text-xs text-muted-foreground truncate mt-1">
                          {result.description}
                        </p>}
                      
                      {result.address && <p className="text-xs text-muted-foreground truncate">
                          📍 {result.address}
                        </p>}
                    </div>
                  </div>)}
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* État d'erreur */}
      {error && <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>}
    </div>;
};