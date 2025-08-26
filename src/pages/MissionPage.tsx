import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, ArrowRight, Users, Building, Handshake } from "lucide-react";
import { useState } from "react";

interface MissionPageProps {
  onNext: () => void;
}

export const MissionPage = ({ onNext }: MissionPageProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8 flex flex-col justify-center relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-10 text-5xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-16 left-10 text-3xl opacity-15 animate-bounce delay-500">🤝</div>

      <div className="max-w-lg mx-auto space-y-8">
        {/* Message principal */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <Handshake className="h-12 w-12 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Ici, chaque Gabonais peut trouver, recommander, soutenir et faire grandir nos opérateurs économiques locaux.
          </h1>
        </div>

        {/* Illustration avec icônes connectées */}
        <div className="relative flex justify-center items-center py-8 animate-fade-in delay-300">
          {/* Centre - ConsoGab */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl z-10">
            <span className="text-white font-bold text-sm">CG</span>
          </div>

          {/* Icônes autour */}
          <div className="absolute top-0 left-8 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-bounce delay-100">
            <Building className="h-6 w-6 text-primary" />
          </div>
          
          <div className="absolute top-0 right-8 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center animate-bounce delay-200">
            <Users className="h-6 w-6 text-secondary" />
          </div>
          
          <div className="absolute bottom-0 left-12 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center animate-bounce delay-300">
            <span className="text-accent font-bold text-lg">🏪</span>
          </div>
          
          <div className="absolute bottom-0 right-12 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-bounce delay-400">
            <span className="text-primary font-bold text-lg">🛒</span>
          </div>

          {/* Lignes de connexion */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-dashed border-primary/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          </div>
        </div>

        {/* Bouton info */}
        <div className="flex justify-center animate-fade-in delay-500">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            <Info className="h-4 w-4 mr-2" />
            Notre mission
          </Button>
        </div>

        {/* Popup info */}
        {showInfo && (
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 animate-scale-in">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Notre but est de créer un grand marché numérique national, accessible à tous, 
              qui valorise le savoir-faire gabonais et renforce les liens entre citoyens et opérateurs économiques.
            </p>
          </Card>
        )}

        {/* Bouton continuer */}
        <div className="pt-4 animate-fade-in delay-700">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Je continue
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};