import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Award, ArrowRight } from "lucide-react";

interface FinalWelcomePageProps {
  userRole: 'consumer' | 'merchant';
  userName: string;
  onComplete: () => void;
}

export const FinalWelcomePage = ({ userRole, userName, onComplete }: FinalWelcomePageProps) => {
  const isConsumer = userRole === 'consumer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 py-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Éléments décoratifs patriotiques festifs */}
      <div className="absolute top-16 right-8 text-6xl animate-bounce">🇬🇦</div>
      <div className="absolute bottom-24 left-8 text-4xl animate-pulse delay-300">⭐</div>
      <div className="absolute top-1/4 left-12 text-3xl animate-bounce delay-500">🎉</div>
      <div className="absolute bottom-1/3 right-12 text-3xl animate-pulse delay-700">✨</div>

      <div className="max-w-lg mx-auto text-center space-y-8 relative z-10">
        {/* Animation de célébration */}
        <div className="space-y-6 animate-scale-in">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary via-secondary to-accent rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            {isConsumer ? (
              <Users className="h-16 w-16 text-white" />
            ) : (
              <Building className="h-16 w-16 text-white" />
            )}
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🎉 Bienvenue dans la grande communauté ConsoGab ! 🇬🇦
            </h1>
            <p className="text-xl text-foreground font-medium">
              Félicitations {userName} !
            </p>
          </div>
        </div>

        {/* Illustration des citoyens connectés */}
        <div className="relative py-8 animate-fade-in delay-300">
          <div className="flex justify-center items-center space-x-4">
            {/* Citoyens représentés par des cercles colorés */}
            <div className="flex -space-x-2">
              <div className="w-12 h-12 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">👥</span>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">🏪</span>
              </div>
              <div className="w-12 h-12 bg-accent rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">🛒</span>
              </div>
            </div>
            
            {/* Votre avatar au centre */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-secondary flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-white font-bold text-sm">
                {isConsumer ? "🛒" : "🏪"}
              </span>
            </div>
            
            {/* Plus d'utilisateurs */}
            <div className="flex -space-x-2">
              <div className="w-12 h-12 bg-primary/80 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">🎨</span>
              </div>
              <div className="w-12 h-12 bg-secondary/80 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">⚙️</span>
              </div>
              <div className="w-12 h-12 bg-accent/80 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">🍽️</span>
              </div>
            </div>
          </div>
          
          {/* Drapeau gabonais stylisé en arrière-plan */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <div className="w-full h-8 bg-gradient-to-r from-primary to-secondary mx-auto rounded-lg"></div>
            <div className="w-full h-8 bg-gradient-to-r from-secondary to-accent mx-auto rounded-lg mt-2"></div>
            <div className="w-full h-8 bg-gradient-to-r from-accent to-primary mx-auto rounded-lg mt-2"></div>
          </div>
        </div>

        {/* Message personnalisé selon le rôle */}
        <Card className="p-6 bg-gradient-to-br from-background/80 to-primary/5 border-primary/20 backdrop-blur-sm animate-fade-in delay-500">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {isConsumer ? "Consommateur patriote" : "Opérateur économique"}
              </Badge>
              <Award className="h-5 w-5 text-secondary" />
            </div>
            
            <p className="text-foreground font-medium leading-relaxed">
              {isConsumer ? (
                <>
                  Vous êtes maintenant connecté à l'écosystème économique gabonais ! 
                  Découvrez les commerces autour de vous, soutenez nos entrepreneurs locaux, 
                  et contribuez à faire grandir notre économie nationale.
                </>
              ) : (
                <>
                  Votre espace professionnel est prêt ! Vous pouvez maintenant créer votre catalogue, 
                  présenter vos produits et services, et vous connecter directement avec vos clients gabonais. 
                  Faites rayonner votre savoir-faire !
                </>
              )}
            </p>
          </div>
        </Card>

        {/* Bouton d'entrée dans l'app */}
        <div className="pt-4 animate-fade-in delay-700">
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white font-bold py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 group"
          >
            {isConsumer ? "Accéder à ma page d'accueil" : "Accéder à mon tableau de bord"}
            <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>
        </div>

        {/* Message patriotique final */}
        <div className="pt-2 animate-fade-in delay-1000">
          <p className="text-sm text-muted-foreground/80 font-medium">
            Ensemble, construisons l'économie numérique du Gabon 🇬🇦
          </p>
        </div>
      </div>

      {/* Particules flottantes pour l'effet festif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-secondary rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary rounded-full animate-bounce delay-1200"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-accent rounded-full animate-bounce delay-1400"></div>
      </div>
    </div>
  );
};