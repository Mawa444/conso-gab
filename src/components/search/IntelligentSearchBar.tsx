import { useState } from "react";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchModal } from "./SearchModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Catégories principales avec couleurs cohérentes
const categories = [
  { id: "commerce", title: "Commerce", icon: "🛍️", color: "from-blue-500 to-indigo-600" },
  { id: "restauration", title: "Restaurants", icon: "🍴", color: "from-orange-500 to-red-600" },
  { id: "hotellerie", title: "Hôtellerie", icon: "🏨", color: "from-purple-500 to-pink-600" },
  { id: "automobile", title: "Auto", icon: "🚗", color: "from-green-500 to-teal-600" },
  { id: "immobilier", title: "Immobilier", icon: "🏠", color: "from-emerald-500 to-cyan-600" },
  { id: "artisanat", title: "Artisanat", icon: "🛠️", color: "from-amber-500 to-yellow-600" },
  { id: "services", title: "Services", icon: "💼", color: "from-slate-500 to-gray-600" },
  { id: "education", title: "Éducation", icon: "🎓", color: "from-indigo-500 to-blue-600" },
  { id: "sante", title: "Santé", icon: "👩‍⚕️", color: "from-red-500 to-pink-600" },
  { id: "culture", title: "Culture", icon: "🎤", color: "from-violet-500 to-purple-600" },
  { id: "technologie", title: "Tech", icon: "💻", color: "from-cyan-500 to-blue-600" },
  { id: "finance", title: "Finance", icon: "💳", color: "from-teal-500 to-green-600" }
];

interface IntelligentSearchBarProps {
  className?: string;
  userLocation?: string;
}

export const IntelligentSearchBar = ({ className, userLocation = "Libreville" }: IntelligentSearchBarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        {/* Barre de recherche principale - agrandie et blanche */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <Input
            placeholder="Rechercher un commerce, service, produit..."
            className="w-full pl-16 pr-24 py-8 text-xl bg-white/95 border-2 border-white/70 hover:border-white focus:border-white rounded-3xl shadow-2xl backdrop-blur-md text-foreground placeholder:text-muted-foreground"
            onClick={() => setIsModalOpen(true)}
            readOnly
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-xl text-sm text-muted-foreground border border-white/50">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{userLocation}</span>
            </div>
          </div>
        </div>
        
        {/* Carousel de catégories - agrandi */}
        <div className="relative">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {categories.map((category) => (
                <CarouselItem key={category.id} className="pl-2 basis-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-16 px-8 text-base bg-white/90 border-white/50 hover:bg-white hover:border-white shadow-lg backdrop-blur-sm flex items-center gap-3 whitespace-nowrap"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0`}>
                      {category.icon}
                    </div>
                    <span className="font-semibold">{category.title}</span>
                  </Button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/90 border-white/50 hover:bg-white shadow-lg" />
            <CarouselNext className="right-2 bg-white/90 border-white/50 hover:bg-white shadow-lg" />
          </Carousel>
        </div>
      </div>

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userLocation={userLocation}
      />
    </>
  );
};