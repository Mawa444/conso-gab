import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchModal } from "./SearchModal";

interface IntelligentSearchBarProps {
  className?: string;
  userLocation?: string;
}

export const IntelligentSearchBar = ({ className, userLocation = "Libreville" }: IntelligentSearchBarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`w-full max-w-2xl mx-auto ${className}`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            placeholder="Rechercher un commerce, service, produit..."
            className="w-full pl-12 pr-16 py-4 text-base bg-background/95 border-2 border-border/50 hover:border-primary/30 focus:border-primary/50 rounded-2xl shadow-lg backdrop-blur-sm"
            onClick={() => setIsModalOpen(true)}
            readOnly
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <div className="flex items-center gap-1 px-3 py-1 bg-muted/80 rounded-lg text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{userLocation}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs bg-background/50 border-border/30 hover:bg-primary/5 hover:border-primary/30"
            onClick={() => setIsModalOpen(true)}
          >
            🍽️ Restaurants
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs bg-background/50 border-border/30 hover:bg-primary/5 hover:border-primary/30"
            onClick={() => setIsModalOpen(true)}
          >
            🛍️ Commerce
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs bg-background/50 border-border/30 hover:bg-primary/5 hover:border-primary/30"
            onClick={() => setIsModalOpen(true)}
          >
            ⚕️ Santé
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs bg-background/50 border-border/30 hover:bg-primary/5 hover:border-primary/30"
            onClick={() => setIsModalOpen(true)}
          >
            🚗 Auto
          </Button>
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