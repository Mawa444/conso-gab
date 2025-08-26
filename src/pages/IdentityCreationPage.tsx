import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IdentityCreationPageProps {
  onNext: (data: { pseudo: string; firstName?: string; lastName?: string }) => void;
  onBack: () => void;
}

export const IdentityCreationPage = ({ onNext, onBack }: IdentityCreationPageProps) => {
  const [pseudo, setPseudo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudoStatus, setPseudoStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const validatePseudo = (value: string) => {
    const alphanumeric = /^[a-zA-Z0-9]+$/.test(value);
    const length = value.length >= 3 && value.length <= 20;
    return alphanumeric && length && value.length > 0;
  };

  const checkPseudoAvailability = async (pseudoValue: string) => {
    if (!validatePseudo(pseudoValue)) {
      setPseudoStatus('idle');
      return;
    }

    setPseudoStatus('checking');
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('pseudo')
        .eq('pseudo', pseudoValue)
        .single();
      
      if (error?.code === 'PGRST116') {
        // No rows found = available
        setPseudoStatus('available');
        setWelcomeMessage(`Wow ! Bienvenue, ${pseudoValue} 👋. Ce pseudo va vous représenter dans la communauté.`);
      } else {
        setPseudoStatus('taken');
        setWelcomeMessage("");
      }
    } catch (err) {
      console.error('Error checking pseudo:', err);
      setPseudoStatus('idle');
    }
  };

  useEffect(() => {
    if (pseudo) {
      const timer = setTimeout(() => checkPseudoAvailability(pseudo), 500);
      return () => clearTimeout(timer);
    } else {
      setPseudoStatus('idle');
      setWelcomeMessage("");
    }
  }, [pseudo]);

  const handleNext = () => {
    if (pseudoStatus === 'available') {
      onNext({
        pseudo,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined
      });
    }
  };

  const canContinue = pseudoStatus === 'available';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8 flex flex-col justify-center relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-10 text-4xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-20 left-10 text-3xl opacity-15 animate-bounce">✨</div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Créons votre identité
            </h1>
            <p className="text-muted-foreground">
              Choisissez comment vous souhaitez être reconnu dans la communauté
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border-primary/20 shadow-xl animate-fade-in delay-300">
          <div className="space-y-6">
            {/* Pseudo obligatoire */}
            <div className="space-y-2">
              <Label htmlFor="pseudo" className="text-base font-medium">
                Choisissez votre pseudo *
              </Label>
              <div className="relative">
                <Input
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="MonPseudo123"
                  className="pr-10 text-lg"
                  maxLength={20}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {pseudoStatus === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {pseudoStatus === 'available' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {pseudoStatus === 'taken' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  3-20 caractères alphanumériques uniquement
                </p>
                {pseudoStatus === 'taken' && (
                  <p className="text-xs text-red-500">
                    Ce pseudo n'est pas disponible
                  </p>
                )}
              </div>
            </div>

            {/* Message de bienvenue dynamique */}
            {welcomeMessage && (
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 animate-scale-in">
                <p className="text-sm text-foreground font-medium">
                  {welcomeMessage}
                </p>
              </Card>
            )}

            {/* Nom et prénom optionnels */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-muted-foreground">
                Nom complet (optionnel)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pour ceux qui souhaitent être plus formels dans leurs échanges
              </p>
            </div>
          </div>
        </Card>

        {/* Boutons d'action */}
        <div className="space-y-3 animate-fade-in delay-500">
          <Button
            onClick={handleNext}
            disabled={!canContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Étape suivante
          </Button>
          
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
};