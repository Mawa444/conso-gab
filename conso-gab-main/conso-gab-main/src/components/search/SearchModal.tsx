import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { UnifiedSearchBar } from "./UnifiedSearchBar";
import { useBusinessList } from "@/hooks/use-business-list";

// Catégories principales pour la recherche
const mainCategories = [
  { id: "retail", title: "Commerce & Distribution", icon: "🛍️", color: "from-blue-500 to-indigo-600" },
  { id: "restaurant", title: "Restauration & Agroalimentaire", icon: "🍴", color: "from-orange-500 to-red-600" },
  { id: "other", title: "Hôtellerie & Tourisme", icon: "🏨", color: "from-purple-500 to-pink-600" },
  { id: "automotive", title: "Automobile & Transport", icon: "🚗", color: "from-green-500 to-teal-600" },
  { id: "real_estate", title: "Immobilier & Habitat", icon: "🏠", color: "from-emerald-500 to-cyan-600" },
  { id: "services", title: "Services Professionnels", icon: "💼", color: "from-slate-500 to-gray-600" },
  { id: "education", title: "Éducation & Formation", icon: "🎓", color: "from-indigo-500 to-blue-600" },
  { id: "healthcare", title: "Santé & Bien-être", icon: "👩‍⚕️", color: "from-red-500 to-pink-600" },
  { id: "entertainment", title: "Culture, Divertissement & Sport", icon: "🎤", color: "from-violet-500 to-purple-600" },
  { id: "technology", title: "Technologie & Numérique", icon: "💻", color: "from-cyan-500 to-blue-600" },
  { id: "finance", title: "Banques, Finance & Assurances", icon: "💳", color: "from-teal-500 to-green-600" }
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (item: any) => void;
  userLocation?: string;
  onCategorySelect?: (category: any) => void;
}

export const SearchModal = ({ open, onClose, onSelect, userLocation = "Libreville", onCategorySelect }: SearchModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { businesses, loading } = useBusinessList();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSearchSelect = (result: any) => {
    onClose();
    onSelect?.(result);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background z-[1200] overflow-hidden">
      {/* Header avec barre de recherche */}
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
          
          <div className="flex-1">
            <UnifiedSearchBar
              onSelect={handleSearchSelect}
              placeholder="Rechercher un commerce, service, produit..."
              variant="default"
              size="lg"
              currentLocation={userLocation}
              showFilters={true}
              showResults={true}
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-20">
        <div className="p-4 space-y-6">
          {/* Suggestions d'entreprises réelles */}
          <div>
            <CommerceListBlock
              title="Populaire dans votre zone"
              commerces={businesses.slice(0, 5).map(business => ({
                id: business.id,
                name: business.name,
                type: business.type,
                owner: business.owner || "Propriétaire",
                address: business.address || "",
                rating: business.rating,
                verified: business.verified,
                employees: [],
                distance: "N/A",
                isFavorite: false,
                sponsored: false
              }))}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};