import { Button } from "@/components/ui/button";
import { IntelligentSearchBar } from "@/components/search/IntelligentSearchBar";
import gabomaLogo from "@/assets/gaboma-logo.png";

interface HeroBlockProps {
  onSearch?: (item: any) => void;
  className?: string;
}

export const HeroBlock = ({ onSearch, className }: HeroBlockProps) => {
  return (
    <div className={`bg-gradient-to-br from-primary via-accent to-secondary p-8 rounded-2xl text-white relative overflow-hidden shadow-[var(--shadow-gaboma)] ${className}`}>
      {/* Motifs décoratifs */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full animate-pulse-soft"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full animate-float"></div>
      
      <div className="relative z-10 text-center space-y-6">
        {/* Logo et titre */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img 
            src={gabomaLogo} 
            alt="ConsoGab" 
            className="w-12 h-12 rounded-xl shadow-lg border border-white/20"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">ConsoGab</h1>
            <p className="text-sm text-white/80">Votre guide du commerce gabonais</p>
          </div>
        </div>

        {/* Message d'accueil */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Découvrez les meilleurs commerces du Gabon</h2>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Trouvez, évaluez et soutenez les entreprises locales avec notre plateforme intelligente
          </p>
        </div>

        {/* Barre de recherche intégrée */}
        <div className="max-w-md mx-auto">
          <IntelligentSearchBar
            onSelect={onSearch}
            placeholder="Rechercher commerces, services..."
            className="w-full"
          />
        </div>

        {/* Actions rapides */}
        <div className="flex justify-center gap-3">
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