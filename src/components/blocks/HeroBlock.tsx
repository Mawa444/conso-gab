import { Button } from "@/components/ui/button";
import { IntelligentSearchBar } from "@/components/search/IntelligentSearchBar";

interface HeroBlockProps {
  onSearch?: (item: any) => void;
  className?: string;
}

export const HeroBlock = ({ onSearch, className }: HeroBlockProps) => {
  return (
    <div className={`w-full bg-gradient-to-br from-primary via-accent to-secondary py-8 px-4 text-white relative overflow-hidden ${className}`}>
      {/* Motifs décoratifs subtils */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Message d'accueil */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Découvrez les meilleurs commerces du Gabon</h2>
          <p className="text-white/80 text-base max-w-2xl mx-auto">
            Trouvez, évaluez et soutenez les entreprises locales avec notre plateforme intelligente
          </p>
        </div>

        {/* Barre de recherche intégrée */}
        <div className="w-full max-w-2xl mx-auto">
          <IntelligentSearchBar
            onSelect={onSearch}
            placeholder="Rechercher commerces, services..."
            className="w-full"
          />
        </div>

        {/* Actions rapides */}
        <div className="flex justify-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Autour de moi
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Top commerces
          </Button>
        </div>
      </div>
    </div>
  );
};