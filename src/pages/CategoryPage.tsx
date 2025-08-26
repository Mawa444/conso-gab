import { useState } from "react";
import { ArrowLeft, Filter, Grid3X3, List, Star, MapPin, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { EnhancedCommerceDetailsPopup } from "@/components/commerce/EnhancedCommerceDetailsPopup";

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface CategoryPageProps {
  category: Category;
  onBack: () => void;
  userLocation?: string;
}

// Données d'exemple pour la catégorie
const mockCategoryData = {
  commerce: [
    {
      id: "commerce_001",
      name: "Supermarché Score Libreville",
      type: "Grande distribution",
      owner: "Groupe Score Gabon",
      address: "Centre Commercial Mbolo, Libreville",
      rating: 4.4,
      verified: true,
      employees: ["Direction", "Caissiers", "Rayons", "Sécurité"],
      distance: "1.8km",
      isFavorite: false,
      reviewCount: 156,
      badges: ["Grande Distribution", "Populaire"],
      featured: true
    },
    {
      id: "commerce_002",
      name: "Boutique Mode Gaboma",
      type: "Vêtements & Accessoires",
      owner: "Céline Ndong",
      address: "Avenue de l'Indépendance",
      rating: 4.7,
      verified: true,
      employees: ["Céline", "Grace", "Fatima"],
      distance: "1.2km",
      isFavorite: true,
      reviewCount: 89,
      badges: ["Mode", "Artisanal"]
    },
    {
      id: "commerce_003",
      name: "Électronique Plus",
      type: "Matériel électronique",
      owner: "Antoine Mba",
      address: "Quartier Glass, Libreville",
      rating: 4.5,
      verified: true,
      employees: ["Antoine", "Technicien", "Vendeur"],
      distance: "800m",
      isFavorite: false,
      reviewCount: 67,
      badges: ["Électronique", "Service Client 5⭐"]
    }
  ],
  restauration: [
    {
      id: "resto_001",
      name: "Restaurant Chez Tonton",
      type: "Restaurant traditionnel",
      owner: "Paul Mba",
      address: "Quartier Glass, Libreville",
      rating: 4.9,
      verified: true,
      employees: ["Paul", "Marie", "Jean", "Sylvie"],
      distance: "800m",
      isFavorite: false,
      reviewCount: 234,
      badges: ["Top Restaurant", "Cuisine Traditionnelle"],
      featured: true
    },
    {
      id: "resto_002",
      name: "Café Central",
      type: "Café & Pâtisserie",
      owner: "Marie Nzamba",
      address: "Centre-ville, Libreville",
      rating: 4.6,
      verified: true,
      employees: ["Marie", "Barista", "Pâtissier"],
      distance: "500m",
      isFavorite: true,
      reviewCount: 143,
      badges: ["Café", "Pâtisserie Artisanale"]
    }
  ]
};

// Filtres disponibles
const sortOptions = [
  { value: "rating", label: "Mieux notés" },
  { value: "distance", label: "Plus proches" },
  { value: "popular", label: "Plus populaires" },
  { value: "name", label: "Ordre alphabétique" }
];

const priceRanges = [
  { value: "all", label: "Tous les prix" },
  { value: "budget", label: "Économique" },
  { value: "mid", label: "Intermédiaire" },
  { value: "premium", label: "Premium" }
];

export const CategoryPage = ({ category, onBack, userLocation = "Libreville" }: CategoryPageProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [showCommerceDetails, setShowCommerceDetails] = useState(false);

  // Obtenir les données pour cette catégorie
  const categoryData = mockCategoryData[category.id as keyof typeof mockCategoryData] || [];
  
  // Sections avec commerces en vedette
  const featuredCommerces = categoryData.filter(c => c.featured);
  const popularCommerces = categoryData.filter(c => c.reviewCount > 100);
  const topRatedCommerces = categoryData.filter(c => c.rating >= 4.7);

  const handleCommerceSelect = (commerce: any) => {
    setSelectedCommerce(commerce);
    setShowCommerceDetails(true);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-20 border-b border-border">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{category.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {categoryData.length} établissement{categoryData.length > 1 ? 's' : ''} à {userLocation}
                </p>
              </div>
            </div>

            {/* Filtres et options d'affichage */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-4 space-y-8">
          {/* Commerces en vedette */}
          {featuredCommerces.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">En vedette</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {featuredCommerces.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredCommerces.map((commerce) => (
                  <CommerceCard
                    key={commerce.id}
                    commerce={commerce}
                    variant="featured"
                    onSelect={handleCommerceSelect}
                    onFavorite={(commerce) => console.log("Favoris:", commerce)}
                    onMessage={(commerce) => console.log("Message:", commerce)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Populaires dans la zone */}
          {popularCommerces.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold">Populaires dans votre zone</h2>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  {popularCommerces.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularCommerces.map((commerce) => (
                  <CommerceCard
                    key={commerce.id}
                    commerce={commerce}
                    onSelect={handleCommerceSelect}
                    onFavorite={(commerce) => console.log("Favoris:", commerce)}
                    onMessage={(commerce) => console.log("Message:", commerce)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Tous les établissements */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tous les établissements</h2>
              <Badge variant="outline">
                {categoryData.length} résultat{categoryData.length > 1 ? 's' : ''}
              </Badge>
            </div>

            <div className={`grid gap-4 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {categoryData.map((commerce) => (
                <CommerceCard
                  key={commerce.id}
                  commerce={commerce}
                  variant={viewMode === "list" ? "compact" : "default"}
                  onSelect={handleCommerceSelect}
                  onFavorite={(commerce) => console.log("Favoris:", commerce)}
                  onMessage={(commerce) => console.log("Message:", commerce)}
                />
              ))}
            </div>
          </section>

          {/* Message si aucun résultat */}
          {categoryData.length === 0 && (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4 opacity-30`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun établissement</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Nous n'avons pas encore d'établissements dans cette catégorie pour votre zone. 
                Revenez plus tard ou changez votre localisation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedCommerce && (
        <EnhancedCommerceDetailsPopup
          open={showCommerceDetails}
          onClose={() => {
            setShowCommerceDetails(false);
            setSelectedCommerce(null);
          }}
          commerce={selectedCommerce}
          onMessage={(commerce) => console.log("Message envoyé à:", commerce)}
        />
      )}
    </>
  );
};