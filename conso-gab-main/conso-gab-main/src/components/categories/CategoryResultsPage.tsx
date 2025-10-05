import { useState } from "react";
import { ArrowLeft, Star, Filter, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Données simulées des sous-catégories et résultats
const subCategories = [
  { id: "all", name: "Tout", count: 234 },
  { id: "traditional", name: "Traditionnel", count: 89 },
  { id: "fast-food", name: "Fast-food", count: 67 },
  { id: "asian", name: "Asiatique", count: 34 },
  { id: "european", name: "Européen", count: 28 },
  { id: "street-food", name: "Street Food", count: 45 },
  { id: "vegetarian", name: "Végétarien", count: 12 }
];

const featuredRestaurants = [
  {
    id: "1",
    name: "Restaurant Chez Tonton",
    type: "Cuisine traditionnelle gabonaise",
    developer: "Famille Nzamba",
    rating: 4.9,
    downloads: "21k",
    size: "Quartier Glass",
    image: "🍽️",
    sponsored: true,
    installed: false
  },
  {
    id: "2", 
    name: "Boulangerie Mama Nzé",
    type: "Boulangerie • Pâtisserie",
    developer: "Mama Nzé SARL",
    rating: 4.8,
    downloads: "17k",
    size: "Nombakélé",
    image: "🥖",
    sponsored: false,
    installed: true
  },
  {
    id: "3",
    name: "Le Gourmet Africain",
    type: "Restaurant • Gastronomie",
    developer: "Chef Martin Inc.",
    rating: 4.7,
    downloads: "58k",
    size: "Centre-ville",
    image: "👨‍🍳",
    sponsored: true,
    installed: false
  }
];

const allRestaurants = [
  ...featuredRestaurants,
  {
    id: "4",
    name: "Pizza Corner",
    type: "Pizzeria • Fast-food",
    developer: "Corner Food Ltd",
    rating: 4.5,
    downloads: "34k",
    size: "Akanda",
    image: "🍕",
    sponsored: false,
    installed: false
  },
  {
    id: "5",
    name: "Sushi Zen",
    type: "Japonais • Sushi",
    developer: "Zen Restaurant",
    rating: 4.6,
    downloads: "12k",
    size: "Batterie IV",
    image: "🍣",
    sponsored: false,
    installed: true
  }
];

interface CategoryResultsPageProps {
  category: {
    id: string;
    title: string;
    icon: string;
  };
  onBack: () => void;
}

export const CategoryResultsPage = ({ category, onBack }: CategoryResultsPageProps) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              {category.icon} {category.title}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10"
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Filtres sous-catégories */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {subCategories.map((subCat) => (
              <Button
                key={subCat.id}
                variant={selectedSubCategory === subCat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubCategory(subCat.id)}
                className="whitespace-nowrap flex-shrink-0 h-10 px-4"
              >
                {subCat.name}
                {subCat.count && (
                  <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                    {subCat.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Section sponsorisée avec carousel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-lg">Sponsorisé</h2>
              <span className="text-muted-foreground">•</span>
              <h2 className="font-semibold text-lg">Recommandations</h2>
            </div>
            
            <Carousel className="w-full">
              <CarouselContent className="-ml-2">
                {featuredRestaurants.map((restaurant) => (
                  <CarouselItem key={restaurant.id} className="pl-2 basis-80">
                    <Card className="border-border/50 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                            {restaurant.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{restaurant.developer}</p>
                            <p className="text-xs text-muted-foreground">{restaurant.type}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{restaurant.rating}</span>
                              </div>
                              <span>{restaurant.downloads} clients</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{restaurant.size}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={restaurant.installed ? "outline" : "default"}
                            size="sm"
                            className="flex-shrink-0"
                          >
                            {restaurant.installed ? "Installé" : "Visiter"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Liste complète des restaurants */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Tous les résultats</h2>
            <div className="space-y-3">
              {allRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {restaurant.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate">{restaurant.name}</h3>
                          {restaurant.sponsored && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              Sponsorisé
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{restaurant.developer}</p>
                        <p className="text-xs text-muted-foreground mb-2">{restaurant.type}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <span>{restaurant.downloads} clients</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{restaurant.size}</span>
                          </div>
                        </div>
                        {restaurant.installed && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                            <span>✓ Installé</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          variant={restaurant.installed ? "outline" : "default"}
                          size="sm"
                        >
                          {restaurant.installed ? "Ouvrir" : "Visiter"}
                        </Button>
                        {!restaurant.installed && (
                          <Button variant="ghost" size="sm" className="text-xs h-8">
                            ⋯
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section recommandée pour vous */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Recommandé pour vous</h2>
            <div className="grid grid-cols-2 gap-4">
              {featuredRestaurants.slice(0, 4).map((restaurant) => (
                <Card key={`rec-${restaurant.id}`} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {restaurant.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{restaurant.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{restaurant.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};