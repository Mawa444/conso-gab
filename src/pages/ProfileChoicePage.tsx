import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Store, ArrowLeft } from "lucide-react";

interface ProfileChoicePageProps {
  onChoice: (role: 'consumer' | 'merchant') => void;
  onBack: () => void;
}

export const ProfileChoicePage = ({ onChoice, onBack }: ProfileChoicePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8">
      {/* Header avec retour */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Choisissez votre profil</h1>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Consommateur */}
        <Card 
          className="p-8 border-2 border-border hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-background to-muted/30"
          onClick={() => onChoice('consumer')}
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Je suis un consommateur</h2>
              <p className="text-muted-foreground text-sm">
                Je cherche des produits et services 100% Gaboma pour soutenir l'économie locale
              </p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Continuer en tant que consommateur
            </Button>
          </div>
        </Card>

        {/* Commerçant */}
        <Card 
          className="p-8 border-2 border-border hover:border-secondary cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-background to-muted/30"
          onClick={() => onChoice('merchant')}
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
              <Store className="h-10 w-10 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Je suis un commerçant</h2>
              <p className="text-muted-foreground text-sm">
                J'ai une entreprise, artisan, ou commerce et je veux promouvoir mes produits gabonais
              </p>
            </div>
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Continuer en tant que commerçant
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};