import { useState } from "react";
import { UnifiedSearchBar } from "./UnifiedSearchBar";
import { SearchModal } from "./SearchModal";
import { useNavigate } from "react-router-dom";
import { useBusinessList } from "@/hooks/use-business-list";

const quickCategories = [
  { name: "Restaurants", icon: "🍽️", color: "bg-gradient-to-r from-orange-500 to-red-600", id: "restaurant" },
  { name: "Commerce", icon: "🛍️", color: "bg-gradient-to-r from-blue-500 to-indigo-600", id: "retail" },
  { name: "Hôtels", icon: "🏨", color: "bg-gradient-to-r from-purple-500 to-pink-600", id: "other" },
  { name: "Transport", icon: "🚗", color: "bg-gradient-to-r from-green-500 to-teal-600", id: "automotive" },
  { name: "Immobilier", icon: "🏠", color: "bg-gradient-to-r from-emerald-500 to-cyan-600", id: "real_estate" },
  { name: "Services", icon: "💼", color: "bg-gradient-to-r from-slate-500 to-gray-600", id: "services" },
  { name: "Santé", icon: "👩‍⚕️", color: "bg-gradient-to-r from-red-500 to-pink-600", id: "healthcare" },
  { name: "Éducation", icon: "🎓", color: "bg-gradient-to-r from-indigo-500 to-blue-600", id: "education" },
  { name: "Finance", icon: "💳", color: "bg-gradient-to-r from-teal-500 to-green-600", id: "finance" },
  { name: "Tech", icon: "💻", color: "bg-gradient-to-r from-cyan-500 to-blue-600", id: "technology" }
];

interface IntelligentSearchBarProps {
  userLocation?: string;
}

export const IntelligentSearchBar = ({ userLocation = "Libreville" }: IntelligentSearchBarProps) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();
  const { businesses } = useBusinessList();

  const handleCategoryClick = (category: any) => {
    navigate(`/category/${category.id}`);
  };

  const handleSearchSelect = (result: any) => {
    if (result.type === 'business') {
      navigate(`/business/${result.businessId}`);
    } else if (result.type === 'catalog') {
      navigate(`/business/${result.businessId}`);
    } else if (result.type === 'product') {
      navigate(`/product/${result.id}`);
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Barre de recherche principale unifiée */}
        <div 
          className="relative bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-border/20 cursor-pointer transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:scale-[1.01]"
          onClick={() => setShowSearchModal(true)}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <UnifiedSearchBar
                onSelect={handleSearchSelect}
                placeholder="Que recherchez-vous ?"
                variant="minimal"
                size="lg"
                currentLocation={userLocation}
                showFilters={false}
                showResults={false}
              />
              <p className="text-base text-muted-foreground mt-2">
                {businesses.length > 0 ? `${businesses.length} entreprises` : 'Commerce • Service • Produit'} dans {userLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Carousel de catégories avec couleurs cohérentes */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {quickCategories.map((category, index) => (
            <button
              key={index}
              className={`shrink-0 px-6 py-3 h-14 border-2 hover:scale-105 transition-all duration-300 ${category.color} text-white border-white/20 font-medium shadow-lg rounded-2xl`}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="mr-3 text-lg">{category.icon}</span>
              <span className="text-base font-semibold">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        userLocation={userLocation}
        onCategorySelect={(category) => {
          navigate(`/category/${category.id}`);
        }}
      />
    </>
  );
};