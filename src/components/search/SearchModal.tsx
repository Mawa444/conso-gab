import { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, Star, TrendingUp, X, ChevronRight, Filter, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryPage } from "@/pages/CategoryPage";
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

// Données de suggestions d'entreprises
const suggestedCommerces = [
  {
    id: "trending_001",
    name: "Restaurant Chez Maman Rosine",
    type: "Restaurant traditionnel",
    owner: "Rosine Nzamba",
    address: "Quartier Akanda, Libreville",
    rating: 4.9,
    verified: true,
    employees: ["Rosine", "Chef Paul", "Serveur Antoine"],
    distance: "600m",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "trending_002",
    name: "Salon Elite Coiffure",
    type: "Salon de beauté",
    owner: "Grace Mouendou",
    address: "Centre-ville, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Grace", "Marie", "Sylvie"],
    distance: "400m",
    isFavorite: true,
    sponsored: true
  },
  {
    id: "trending_003",
    name: "Pharmacie Nouvelle",
    type: "Pharmacie moderne",
    owner: "Dr. Patrick Ntoutoume",
    address: "Quartier Nombakélé, Libreville",
    rating: 4.7,
    verified: true,
    employees: ["Dr. Patrick", "Assistant", "Caissière"],
    distance: "800m",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "trending_004",
    name: "Boutique Mode Urbaine",
    type: "Vêtements & accessoires",
    owner: "Cynthia Obiang",
    address: "Avenue Bouët, Libreville",
    rating: 4.6,
    verified: true,
    employees: ["Cynthia", "Vendeur", "Styliste"],
    distance: "1.1km",
    isFavorite: true,
    sponsored: true
  }
];

// Catégories principales pour la recherche
const mainCategories = [
  { id: "commerce", title: "Commerce & Distribution", icon: "🛍️", color: "from-blue-500 to-indigo-600" },
  { id: "restauration", title: "Restauration & Agroalimentaire", icon: "🍴", color: "from-orange-500 to-red-600" },
  { id: "hotellerie", title: "Hôtellerie & Tourisme", icon: "🏨", color: "from-purple-500 to-pink-600" },
  { id: "automobile", title: "Automobile & Transport", icon: "🚗", color: "from-green-500 to-teal-600" },
  { id: "immobilier", title: "Immobilier & Habitat", icon: "🏠", color: "from-emerald-500 to-cyan-600" },
  { id: "artisanat", title: "Artisanat & Services Techniques", icon: "🛠️", color: "from-amber-500 to-yellow-600" },
  { id: "services", title: "Services Professionnels", icon: "💼", color: "from-slate-500 to-gray-600" },
  { id: "education", title: "Éducation & Formation", icon: "🎓", color: "from-indigo-500 to-blue-600" },
  { id: "sante", title: "Santé & Bien-être", icon: "👩‍⚕️", color: "from-red-500 to-pink-600" },
  { id: "culture", title: "Culture, Divertissement & Sport", icon: "🎤", color: "from-violet-500 to-purple-600" },
  { id: "technologie", title: "Technologie & Numérique", icon: "💻", color: "from-cyan-500 to-blue-600" },
  { id: "finance", title: "Banques, Finance & Assurances", icon: "💳", color: "from-teal-500 to-green-600" }
];

// Données de localisation pour le filtrage géographique
const locations = {
  "Libreville": {
    provinces: ["Estuaire"],
    departments: ["Libreville"],
    arrondissements: ["1er Arrondissement", "2e Arrondissement", "3e Arrondissement", "4e Arrondissement", "5e Arrondissement", "6e Arrondissement"],
    quartiers: ["Akanda", "Nombakélé", "Glass", "Montagne Sainte", "Lalala", "Nzeng-Ayong", "Batterie IV", "Centre-ville"]
  },
  "Port-Gentil": {
    provinces: ["Ogooué-Maritime"],
    departments: ["Bendje"],
    arrondissements: ["1er Arrondissement", "2e Arrondissement"],
    quartiers: ["Boucau", "Cité", "Zone Industrielle", "Bord de Mer"]
  }
};

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (item: any) => void;
  userLocation?: string;
  onCategorySelect?: (category: any) => void;
}

export const SearchModal = ({ open, onClose, onSelect, userLocation = "Libreville", onCategorySelect }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(userLocation);
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Algorithme de recherche intelligente avec tolérance aux fautes
  const results = useMemo(() => {
    if (searchQuery.length < 2) return [];

    const searchTerm = searchQuery.toLowerCase().trim();
    
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
  }, [searchQuery]);

  const handleSelect = (item: any) => {
    setSearchQuery("");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Header avec barre de recherche - positionné juste sous l'entête */}
      <div className="sticky top-16 bg-background/95 backdrop-blur-sm z-10 p-4 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un commerce, service, produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 bg-card border-border/50"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto w-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
            
        
        {/* Filtres géographiques améliorés */}
        <div className="space-y-3 pt-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filtrer par localisation:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-9 bg-background/50 border-border/50">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Libreville">Libreville</SelectItem>
                <SelectItem value="Port-Gentil">Port-Gentil</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="h-9 bg-background/50 border-border/50">
                <SelectValue placeholder="Quartier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les quartiers</SelectItem>
                {locations[selectedLocation as keyof typeof locations]?.quartiers.map((quartier) => (
                  <SelectItem key={quartier} value={quartier}>{quartier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="flex items-center justify-center gap-1 h-9 px-3">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{selectedZone === "all" ? "Toutes zones" : selectedZone}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-20">
        <div className="p-4 space-y-6">
          {searchQuery.length < 2 && (
            <div className="space-y-6">
              {/* Suggestions d'entreprises en tendance */}
              <div>
                <CommerceListBlock
                  title="Populaire dans votre zone"
                  commerces={suggestedCommerces.slice(0, 5)}
                  onSelect={(commerce) => {
                    onSelect?.(commerce);
                    onClose();
                  }}
                  onFavorite={(commerce) => console.log("Favoris:", commerce)}
                  onMessage={(commerce) => console.log("Message:", commerce)}
                  showFilters={false}
                  viewMode="list"
                />
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    className="px-6 py-2"
                    onClick={() => console.log("Voir plus de commerces populaires")}
                  >
                    Voir plus
                  </Button>
                </div>
              </div>

              {/* Catégories principales */}
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Parcourir par catégories</h3>
                  <p className="text-muted-foreground">Explorez nos différents secteurs d'activité</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mainCategories.map((category) => (
                  <Card 
                      key={category.id} 
                      className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer"
                      onClick={() => onCategorySelect?.(category)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                              {category.title}
                            </h4>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Message d'aide */}
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <h4 className="font-semibold mb-2">Recherche intelligente</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Tapez au moins 2 caractères pour commencer la recherche. 
                  Notre système tolère les fautes de frappe et trouve ce que vous cherchez !
                </p>
              </div>
            </div>
          )}

          {searchQuery.length >= 2 && results.length === 0 && (
            <div className="text-center text-muted-foreground">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
              <p className="max-w-md mx-auto">
                Aucun résultat pour "{searchQuery}". Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div>
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
      </div>
    </div>
  );
};