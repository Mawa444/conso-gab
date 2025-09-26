import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { GeolocalizedAdCarousel } from "@/components/advertising/GeolocalizedAdCarousel";
import { useNavigate } from "react-router-dom";
import { getAllBusinessCategories } from "@/data/businessCategories";

interface CategoriesSectionProps {
  userLocation?: string;
}

export const CategoriesSection = ({ userLocation = "Libreville" }: CategoriesSectionProps) => {
  const navigate = useNavigate();
  const categories = getAllBusinessCategories();
  
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  // Fonction pour insérer des pubs après chaque 5 catégories
  const renderCategoriesWithAds = () => {
    const elementsToRender = [];
    
    for (let i = 0; i < categories.length; i += 5) {
      const chunk = categories.slice(i, i + 5);
      
      // Ajouter le groupe de 5 catégories
      elementsToRender.push(
        <div key={`categories-${i}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chunk.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category.nom}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {category.subcategories.length} sous-catégories
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-32 overflow-hidden">
                  {category.subcategories.slice(0, 4).map((subcategory, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                      <span className="truncate">{subcategory.nom}</span>
                    </div>
                  ))}
                  {category.subcategories.length > 4 && (
                    <div className="text-xs text-muted-foreground pt-1">
                      +{category.subcategories.length - 4} autres...
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  Explorer cette catégorie
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      );
      
      // Ajouter une bannière publicitaire après chaque groupe (sauf le dernier)
      if (i + 5 < categories.length) {
        elementsToRender.push(
          <div key={`ad-${i}`} className="py-8">
            <GeolocalizedAdCarousel userLocation={userLocation} />
          </div>
        );
      }
    }
    
    return elementsToRender;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Toutes nos catégories</h2>
        <p className="text-muted-foreground">Explorez tous les secteurs d'activité du Gabon</p>
      </div>

      {renderCategoriesWithAds()}
    </div>
  );
};