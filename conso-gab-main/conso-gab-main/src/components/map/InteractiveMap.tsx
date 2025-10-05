import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { useRealBusinesses, type RealBusiness } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";

interface InteractiveMapProps {
  businesses: RealBusiness[];
  selectedCategory?: string;
  onCommerceClick?: (business: RealBusiness) => void;
  onCategoryFilter?: (category: string) => void;
  searchQuery?: string;
  className?: string;
  children?: React.ReactNode;
}

export const InteractiveMap = ({ 
  businesses, 
  selectedCategory = "all", 
  onCommerceClick, 
  onCategoryFilter,
  searchQuery = "",
  className = "",
  children 
}: InteractiveMapProps) => {

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    // Filtrer par catégorie
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(business => business.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query) ||
        business.description?.toLowerCase().includes(query) ||
        business.city?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [businesses, selectedCategory, searchQuery]);

  const businessPositions = useMemo(() => {
    const positions = [
      { x: '25%', y: '15%' }, { x: '70%', y: '20%' }, { x: '15%', y: '35%' },
      { x: '80%', y: '40%' }, { x: '45%', y: '25%' }, { x: '20%', y: '55%' },
      { x: '60%', y: '50%' }, { x: '75%', y: '65%' }, { x: '35%', y: '70%' },
      { x: '85%', y: '75%' }, { x: '50%', y: '80%' }, { x: '90%', y: '30%' },
    ];
    
    return filteredBusinesses.map((business, index) => ({
      ...business,
      position: positions[index % positions.length]
    }));
  }, [filteredBusinesses]);

  const generateMapPositions = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      x: `${20 + Math.random() * 60}%`,
      y: `${20 + Math.random() * 60}%`
    }));
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Fond de carte */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
        {/* Grille géographique */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-muted/20" />
            ))}
          </div>
        </div>
      </div>

      {/* Points des entreprises */}
      <div className="absolute inset-0">
        {businessPositions.map((business) => {
          const category = businessCategories.find(cat => cat.id === business.category);
          
          return (
            <div
              key={business.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 hover:z-20 group"
              style={{ 
                left: business.position.x, 
                top: business.position.y 
              }}
              onClick={() => onCommerceClick?.(business)}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110
                ${business.is_verified ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'}
              `}>
                {category?.icon || '🏪'}
              </div>
              
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {business.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicateur de position utilisateur */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-40"></div>
        </div>
      </div>

      {children}
    </div>
  );
};