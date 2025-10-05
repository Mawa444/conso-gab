import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/search/SearchModal";
import { useState } from "react";

interface HeroBlockProps {
  onSearch?: (item: any) => void;
  className?: string;
}

export const HeroBlock = ({ onSearch, className }: HeroBlockProps) => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <>
      <SearchModal 
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={onSearch}
      />
    <div className={`w-full bg-gradient-to-br from-primary via-accent to-secondary py-8 px-4 text-white relative overflow-hidden ${className}`}>
      {/* Motifs décoratifs subtils */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Message d'accueil */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            Découvrez les paresseux du Gabon
            <span className="text-3xl">🇬🇦</span>
          </h2>
          <p className="text-white/80 text-base max-w-2xl mx-auto">
            Trouvez, évaluez et soutenez les entreprises locales avec notre plateforme intelligente
          </p>
        </div>

        {/* Barre de recherche intégrée */}
        <div className="w-full max-w-2xl mx-auto">
          <div 
            onClick={() => setShowSearchModal(true)}
            className="relative cursor-pointer group"
          >
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-white hover:bg-white/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-white/90 group-hover:text-white">
                Rechercher commerces, services, produits...
              </span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex justify-center gap-3 flex-wrap">
          <Button
            variant="default"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Autour de moi
          </Button>
          <Button
            variant="default"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Top commerces
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};