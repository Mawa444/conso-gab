import { useState } from "react";
import { Search, MapPin, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { SearchModal } from "./SearchModal";
import { CategoryPage } from "@/pages/CategoryPage";

const quickCategories = [
  { name: "Restaurants", icon: "🍽️", color: "bg-gradient-to-r from-orange-500 to-red-600", id: "restauration" },
  { name: "Commerce", icon: "🛍️", color: "bg-gradient-to-r from-blue-500 to-indigo-600", id: "commerce" },
  { name: "Hôtels", icon: "🏨", color: "bg-gradient-to-r from-purple-500 to-pink-600", id: "hotellerie" },
  { name: "Transport", icon: "🚗", color: "bg-gradient-to-r from-green-500 to-teal-600", id: "automobile" },
  { name: "Immobilier", icon: "🏠", color: "bg-gradient-to-r from-emerald-500 to-cyan-600", id: "immobilier" },
  { name: "Services", icon: "💼", color: "bg-gradient-to-r from-slate-500 to-gray-600", id: "services" },
  { name: "Santé", icon: "👩‍⚕️", color: "bg-gradient-to-r from-red-500 to-pink-600", id: "sante" },
  { name: "Éducation", icon: "🎓", color: "bg-gradient-to-r from-indigo-500 to-blue-600", id: "education" },
  { name: "Finance", icon: "💳", color: "bg-gradient-to-r from-teal-500 to-green-600", id: "finance" },
  { name: "Tech", icon: "💻", color: "bg-gradient-to-r from-cyan-500 to-blue-600", id: "technologie" }
];

interface IntelligentSearchBarProps {
  userLocation?: string;
}

export const IntelligentSearchBar = ({ userLocation = "Libreville" }: IntelligentSearchBarProps) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCategoryResults, setShowCategoryResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const handleCategoryClick = (category: any) => {
    setSelectedCategory({...category, title: category.name});
    setShowCategoryResults(true);
  };

  if (showCategoryResults && selectedCategory) {
    return (
      <CategoryPage 
        category={{...selectedCategory, title: selectedCategory.name}}
        userLocation={userLocation}
        onBack={() => {
          setShowCategoryResults(false);
          setSelectedCategory(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Barre de recherche principale - Plus grande et plus visible */}
        <div 
          className="relative bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-border/20 cursor-pointer transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:scale-[1.01]"
          onClick={() => setShowSearchModal(true)}
        >
          <div className="flex items-center gap-4">
            <Search className="w-7 h-7 text-primary shrink-0" />
            <div className="flex-1">
              <Input
                placeholder="Que recherchez-vous ?"
                className="border-0 bg-transparent text-xl placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 font-medium"
                readOnly
              />
              <p className="text-base text-muted-foreground mt-2">
                Commerce • Service • Produit dans {userLocation}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-2xl p-3 hover:bg-accent/20 h-12 w-12"
              >
                <Mic className="w-6 h-6 text-primary" />
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                className="rounded-2xl p-3 hover:bg-accent/20 h-12 w-12"
              >
                <MapPin className="w-6 h-6 text-primary" />
              </Button>
            </div>
          </div>
        </div>

        {/* Carousel de catégories avec couleurs cohérentes */}
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {quickCategories.map((category, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className={`shrink-0 px-6 py-3 h-14 border-2 hover:scale-105 transition-all duration-300 ${category.color} text-white border-white/20 font-medium shadow-lg`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="mr-3 text-lg">{category.icon}</span>
                  <span className="text-base font-semibold">{category.name}</span>
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        userLocation={userLocation}
        onCategorySelect={(category) => {
          setSelectedCategory({...category, title: category.name});
          setShowSearchModal(false);
          setShowCategoryResults(true);
        }}
      />
    </>
  );
};