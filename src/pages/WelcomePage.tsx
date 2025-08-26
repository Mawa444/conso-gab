import { Button } from "@/components/ui/button";
import { Sparkles, Users, ShoppingBag, Heart } from "lucide-react";

interface WelcomePageProps {
  onNext: () => void;
}

export const WelcomePage = ({ onNext }: WelcomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Éléments décoratifs patriotiques animés */}
      <div className="absolute top-16 right-8 text-4xl animate-bounce">🇬🇦</div>
      <div className="absolute bottom-24 left-8 text-3xl animate-pulse">⭐</div>
      <div className="absolute top-1/3 left-12 text-2xl animate-bounce delay-300">🏪</div>
      <div className="absolute bottom-1/3 right-12 text-2xl animate-pulse delay-500">🛒</div>

      <div className="max-w-md mx-auto text-center space-y-8 relative z-10">
        {/* Logo et nom de l'app */}
        <div className="space-y-6 animate-fade-in">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl">
            <Sparkles className="h-16 w-16 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ConsoGab
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Message de bienvenue */}
        <div className="space-y-4 animate-fade-in delay-300">
          <h2 className="text-2xl font-bold text-foreground">
            Bienvenue sur ConsoGab 🇬🇦
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La plateforme qui connecte les citoyens et les opérateurs économiques du Gabon.
          </p>
        </div>

        {/* Icônes illustratives */}
        <div className="flex justify-center space-x-6 animate-fade-in delay-500">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Citoyens</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-xs text-muted-foreground">Commerce</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">Solidarité</span>
          </div>
        </div>

        {/* Bouton d'action principal */}
        <div className="pt-4 animate-fade-in delay-700">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Commencer mon aventure ✨
          </Button>
        </div>

        {/* Message patriotique subtil */}
        <div className="pt-2 animate-fade-in delay-1000">
          <p className="text-sm text-muted-foreground/80">
            Ensemble, bâtissons le Gabon de demain
          </p>
        </div>
      </div>
    </div>
  );
};