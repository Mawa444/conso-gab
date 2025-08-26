import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Store, ArrowLeft } from "lucide-react";

interface ProfileChoicePageProps {
  onChoice: (role: 'consumer' | 'merchant') => void;
  onBack: () => void;
}

export const ProfileChoicePage = ({ onChoice, onBack }: ProfileChoicePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#009739]/10 via-[#FFD100]/10 to-[#0066B3]/10 px-6 py-8 relative overflow-hidden">
      {/* Éléments décoratifs patriotiques */}
      <div className="absolute top-10 right-10 text-6xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-20 left-10 text-4xl opacity-10 animate-bounce">⭐</div>
      
      {/* Header avec retour */}
      <div className="flex items-center mb-12">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-4 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Choisissez votre profil
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Ensemble, bâtissons le Gabon de demain 🇬🇦
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Consommateur */}
        <Card 
          className="group p-8 border-2 border-border hover:border-primary cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 bg-gradient-to-br from-primary/5 via-background to-primary/10 hover:from-primary/10 hover:to-primary/20 animate-in fade-in slide-in-from-bottom-4"
          onClick={() => onChoice('consumer')}
        >
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Je suis un consommateur</h2>
              <p className="text-foreground text-sm font-medium leading-relaxed">
                Je consomme et j'encourage le 100% Gabonais 🇬🇦
              </p>
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Continuer en tant que consommateur 🛒
            </Button>
          </div>
        </Card>

        {/* Opérateur économique */}
        <Card 
          className="group p-8 border-2 border-border hover:border-secondary cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 bg-gradient-to-br from-secondary/5 via-background to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 animate-in fade-in slide-in-from-bottom-6"
          onClick={() => onChoice('merchant')}
        >
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Store className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Je suis un Opérateur économique</h2>
              <p className="text-foreground text-sm font-medium leading-relaxed">
                Je valorise mon savoir-faire gabonais et je fais grandir l'économie nationale 🇬🇦
              </p>
            </div>
            <Button className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Continuer en tant qu'Opérateur économique 🏪
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};