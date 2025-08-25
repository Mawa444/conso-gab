import { useState, useMemo } from "react";
import { Search, MapPin, Star, TrendingUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: any) => void;
}

export const SearchModal = ({ isOpen, onClose, onSelect }: SearchModalProps) => {
  const [query, setQuery] = useState("");

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
      .slice(0, 8);
  }, [query]);

  const handleSelect = (item: any) => {
    setQuery("");
    onClose();
    onSelect?.(item);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        {/* Header avec barre de recherche */}
        <div className="p-6 border-b border-border/30 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un commerce, service, produit..."
                className="pl-12 pr-4 py-4 text-lg bg-background border-2 border-border/50 hover:border-primary/30 focus:border-primary/50 rounded-2xl"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          {query.length < 2 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Recherche intelligente</h3>
              <p className="max-w-md mx-auto">
                Tapez au moins 2 caractères pour commencer la recherche. 
                Notre système tolère les fautes de frappe et trouve ce que vous cherchez !
              </p>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
              <p className="max-w-md mx-auto">
                Aucun résultat pour "{query}". Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Résultats de recherche</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="grid gap-4">
                {results.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="p-4 border border-border/30 rounded-xl hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 flex items-center gap-4"
                  >
                    {/* Icône catégorie */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{getCategoryIcon(item.category)}</span>
                    </div>
                    
                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg text-foreground truncate">{item.name}</h4>
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{item.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                        </div>
                        <Badge variant="outline">
                          {item.distance}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Actions rapides */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="h-10 px-4">
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/30 border-t border-border/30">
          <p className="text-center text-sm text-muted-foreground">
            Recherche intelligente avec tolérance aux fautes de frappe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};