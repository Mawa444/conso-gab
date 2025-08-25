import { useState, useMemo } from "react";
import { Search, MapPin, Clock, Star, TrendingUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Données de recherche simulées
const searchData = [
  { 
    id: "1", 
    name: "Restaurant Chez Tonton", 
    type: "restaurant", 
    category: "Restauration",
    address: "Quartier Glass, Libreville",
    rating: 4.9,
    distance: "800m",
    keywords: ["restaurant", "tonton", "mange", "nourriture", "traditionnel", "glass", "libreville"]
  },
  { 
    id: "2", 
    name: "Boulangerie Chez Mama Nzé", 
    type: "boulangerie", 
    category: "Restauration",
    address: "Quartier Nombakélé, Libreville",
    rating: 4.8,
    distance: "300m",
    keywords: ["boulangerie", "pain", "mama", "nze", "croissant", "nombakele", "libreville"]
  },
  { 
    id: "3", 
    name: "Salon Afrique Beauté", 
    type: "salon", 
    category: "Beauté",
    address: "Quartier Akanda, Libreville",
    rating: 4.7,
    distance: "1.1km",
    keywords: ["salon", "coiffure", "beaute", "afrique", "cheveux", "akanda", "libreville"]
  },
  { 
    id: "4", 
    name: "Pharmacie du Centre", 
    type: "pharmacie", 
    category: "Santé",
    address: "Centre-ville, Libreville",
    rating: 4.8,
    distance: "500m",
    keywords: ["pharmacie", "medicament", "sante", "centre", "ville", "libreville"]
  },
  { 
    id: "5", 
    name: "Garage Auto Gaboma", 
    type: "garage", 
    category: "Automobile",
    address: "Route Nationale, Libreville",
    rating: 4.5,
    distance: "650m",
    keywords: ["garage", "auto", "voiture", "reparation", "gaboma", "route", "nationale"]
  }
];

interface IntelligentSearchBarProps {
  onSelect?: (item: any) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export const IntelligentSearchBar = ({ 
  onSelect, 
  placeholder = "Rechercher un commerce, service, produit...", 
  showSuggestions = true,
  className 
}: IntelligentSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Algorithme de recherche intelligente avec tolérance aux fautes
  const results = useMemo(() => {
    if (query.length < 2) return [];

    const searchTerm = query.toLowerCase().trim();
    
    return searchData
      .map(item => {
        let score = 0;
        
        // Recherche exacte dans le nom (score le plus élevé)
        if (item.name.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        // Recherche dans les mots-clés
        const matchingKeywords = item.keywords.filter(keyword => 
          keyword.includes(searchTerm) || 
          searchTerm.includes(keyword) ||
          // Tolérance aux fautes : distance de Levenshtein approximative
          Math.abs(keyword.length - searchTerm.length) <= 2 && 
          keyword.substring(0, Math.min(3, searchTerm.length)) === searchTerm.substring(0, Math.min(3, searchTerm.length))
        );
        
        score += matchingKeywords.length * 20;
        
        // Recherche floue par caractères partagés
        const sharedChars = searchTerm.split('').filter(char => 
          item.name.toLowerCase().includes(char)
        ).length;
        
        if (sharedChars >= Math.min(3, searchTerm.length)) {
          score += sharedChars * 5;
        }
        
        // Bonus pour les commerces bien notés et proches
        if (item.rating >= 4.5) score += 10;
        if (parseFloat(item.distance) <= 1) score += 15;
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [query]);

  const handleSelect = (item: any) => {
    setQuery("");
    setIsOpen(false);
    onSelect?.(item);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Restauration": return "🍽️";
      case "Beauté": return "💄";
      case "Santé": return "⚕️";
      case "Automobile": return "🚗";
      default: return "🏪";
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Barre de recherche principale */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => setIsOpen(query.length >= 2)}
          placeholder={placeholder}
          className="pl-12 pr-12 py-4 text-base bg-background/95 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 focus:border-primary/50 rounded-2xl shadow-[var(--shadow-soft)] transition-all duration-300"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Suggestions intelligentes */}
      {isOpen && showSuggestions && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-border/50 shadow-[var(--shadow-elevated)] backdrop-blur-sm bg-card/95 animate-fade-in">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {results.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "p-4 border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 flex items-center gap-4",
                    index === results.length - 1 && "border-b-0"
                  )}
                >
                  {/* Icône catégorie */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{getCategoryIcon(item.category)}</span>
                  </div>
                  
                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                      <Badge variant="secondary" className="text-xs bg-accent/20 text-accent-foreground">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.distance}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Actions rapides */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                      Voir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer avec suggestions */}
            <div className="p-3 bg-muted/30 border-t border-border/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Recherche intelligente avec tolérance aux fautes</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions vides */}
      {isOpen && showSuggestions && query.length >= 2 && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-border/50 shadow-[var(--shadow-elevated)] backdrop-blur-sm bg-card/95">
          <CardContent className="p-4 text-center">
            <div className="text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun résultat pour "{query}"</p>
              <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};