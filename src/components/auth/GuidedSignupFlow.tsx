import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, User, Building, Mail, Phone, Lock, Globe } from "lucide-react";
import gabomaLogo from "@/assets/gaboma-logo.png";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LocationStep } from "./LocationStep";

type SignupStep = 'profile-choice' | 'basic-info' | 'contact-info' | 'location-info' | 'business-info' | 'final';

interface SignupData {
  accountType: 'consumer' | 'merchant';
  pseudo: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  businessName?: string;
  businessCategory?: string;
  businessPhone?: string;
  businessEmail?: string;
  // Location data
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface GuidedSignupFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export const GuidedSignupFlow = ({ onComplete, onBack }: GuidedSignupFlowProps) => {
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignupStep>('basic-info');
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState<Partial<SignupData>>({ accountType: 'consumer' });

  const steps = [
    { id: 'basic-info', title: 'Informations de base', step: 1 },
    { id: 'contact-info', title: 'Contact', step: 2 },
    { id: 'location-info', title: 'Localisation', step: 3 },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    console.log('👉 nextStep called', { currentStep, stepIndex: currentStepIndex, totalSteps: steps.length });
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      console.log('➡️ Moving to next step');
      setCurrentStep(steps[currentIndex + 1].id as SignupStep);
    } else {
      console.log('🏁 Triggering account creation');
      handleCreateAccount();
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as SignupStep);
    } else {
      onBack();
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    console.log('🚀 Starting account creation...', {
      email: signupData.email,
      pseudo: signupData.pseudo,
      hasLocation: !!(signupData.latitude && signupData.longitude)
    });
    
    try {
      if (!signupData.email || !signupData.password || !signupData.pseudo) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      console.log('📤 Calling signUp API...');
      const { data, error } = await signUp(
        signupData.email,
        signupData.password,
        {
          pseudo: signupData.pseudo,
          role: signupData.accountType || 'consumer',
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          phone: signupData.phone,
          country: signupData.country || 'Gabon',
          province: signupData.province,
          department: signupData.department,
          arrondissement: signupData.arrondissement,
          quartier: signupData.quartier,
          address: signupData.address,
          latitude: signupData.latitude,
          longitude: signupData.longitude
        }
      );

      if (error) {
        console.error('❌ SignUp error:', error);
        if (error.message === "EXISTING_USER") {
          toast.error('Un compte existe déjà avec cet email.');
          setTimeout(() => {
            toast.info('Redirection vers la connexion...');
            onBack();
          }, 1500);
          return;
        }
        throw error;
      }

      console.log('✅ Account created successfully:', data?.user?.id);
      toast.success('Compte créé avec succès ! Redirection...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Completing signup flow...');
      onComplete();
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      console.log('🏁 Account creation completed');
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Erreur de connexion ${provider}: ${error.message}`);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basic-info':
        return !!(signupData.pseudo && signupData.firstName && signupData.lastName);
      case 'contact-info':
        return !!(signupData.email && signupData.password);
      case 'location-info':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background p-4 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col" style={{ maxHeight: 'calc(100dvh - 2rem)' }}>
        <div className="text-center space-y-3 py-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
           <div className="flex justify-center">
             <img src={gabomaLogo} alt="ConsoGab" className="w-20 h-20 object-contain" />
           </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Création de votre compte</h1>
            <p className="text-muted-foreground text-xs">Rejoignez la communauté économique gabonaise</p>
          </div>
          
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Étape {currentStepIndex + 1} sur {steps.length}
            </p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-center text-base">
              {steps.find(step => step.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3 pb-3">

            {currentStep === 'basic-info' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pseudo">Pseudo *</Label>
                  <Input
                    id="pseudo"
                    value={signupData.pseudo || ''}
                    onChange={(e) => setSignupData({ ...signupData, pseudo: e.target.value })}
                    placeholder="Votre nom d'utilisateur"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Votre nom à l'état civil ne sera jamais affiché publiquement. Seul votre pseudo est visible.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={signupData.firstName || ''}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={signupData.lastName || ''}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'contact-info' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email || ''}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={signupData.password || ''}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={signupData.phone || ''}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="pl-10"
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'location-info' && (
              <div className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Votre localisation
                </Badge>
                
                <LocationStep
                  onLocationChange={(locationData) => 
                    setSignupData({ ...signupData, ...locationData })
                  }
                  initialLocation={{
                    country: signupData.country,
                    province: signupData.province,
                    department: signupData.department,
                    arrondissement: signupData.arrondissement,
                    quartier: signupData.quartier,
                    address: signupData.address,
                    latitude: signupData.latitude,
                    longitude: signupData.longitude,
                  }}
                />
              </div>
            )}

          </CardContent>
          
          <div className="border-t p-4 flex-shrink-0 bg-card">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="w-24"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>

              <Button
                onClick={nextStep}
                disabled={!canProceed() || isLoading}
                className="w-32"
              >
                {currentStepIndex === steps.length - 1 ? (
                  isLoading ? "Création..." : "Créer"
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};