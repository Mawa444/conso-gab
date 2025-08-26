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
import { useAuth } from "./AuthProvider";
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
  const [currentStep, setCurrentStep] = useState<SignupStep>('profile-choice');
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState<Partial<SignupData>>({});

  const steps = [
    { id: 'profile-choice', title: 'Type de compte', step: 1 },
    { id: 'basic-info', title: 'Informations de base', step: 2 },
    { id: 'contact-info', title: 'Contact', step: 3 },
    { id: 'location-info', title: 'Localisation', step: 4 },
    ...(signupData.accountType === 'merchant' ? [{ id: 'business-info', title: 'Informations business', step: 5 }] : []),
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as SignupStep);
    } else {
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
    
    try {
      if (!signupData.email || !signupData.password || !signupData.pseudo) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const { data, error } = await signUp(
        signupData.email,
        signupData.password,
        {
          pseudo: signupData.pseudo,
          role: signupData.accountType || 'consumer',
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          phone: signupData.phone,
          country: signupData.country,
          province: signupData.province,
          department: signupData.department,
          arrondissement: signupData.arrondissement,
          quartier: signupData.quartier,
          address: signupData.address,
          latitude: signupData.latitude,
          longitude: signupData.longitude
        }
      );

      if (error) throw error;

      // Créer le profil business si nécessaire
      if (signupData.accountType === 'merchant' && data.user) {
        const categoryMap: Record<string, string> = {
          'artisan': 'manufacturing',
          'commerce': 'retail',
          'service': 'services',
          'restauration': 'restaurant',
          'technologie': 'technology',
          'transport': 'automotive'
        };

        const mappedCategory = categoryMap[signupData.businessCategory || 'service'] || 'other';

        const { error: businessError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: data.user.id,
            business_name: signupData.businessName || signupData.pseudo,
            business_category: mappedCategory as any,
            phone: signupData.businessPhone,
            email: signupData.businessEmail,
            country: signupData.country,
            province: signupData.province,
            department: signupData.department,
            arrondissement: signupData.arrondissement,
            quartier: signupData.quartier,
            address: signupData.address,
            latitude: signupData.latitude,
            longitude: signupData.longitude,
            is_active: true
          });

        if (businessError) {
          console.error('Erreur création business profile:', businessError);
        }
      }

      toast.success('Bienvenue dans la communauté ConsoGab ! 🇬🇦');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
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
      case 'profile-choice':
        return signupData.accountType;
      case 'basic-info':
        return signupData.pseudo && signupData.firstName && signupData.lastName;
      case 'contact-info':
        return signupData.email && signupData.password;
      case 'location-info':
        return signupData.province || (signupData.latitude && signupData.longitude);
      case 'business-info':
        return signupData.businessName && signupData.businessCategory;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
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
            <img src={gabomaLogo} alt="ConsoGab" className="w-12 h-12 rounded-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Création de votre compte</h1>
            <p className="text-muted-foreground text-sm">Rejoignez la communauté économique gabonaise</p>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Étape {currentStepIndex + 1} sur {steps.length}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-base">
              {steps.find(step => step.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Profile Choice Step */}
            {currentStep === 'profile-choice' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Choisissez le type de compte qui vous correspond
                </p>
                
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant={signupData.accountType === 'consumer' ? 'default' : 'outline'}
                    onClick={() => setSignupData({ ...signupData, accountType: 'consumer' })}
                    className="w-full justify-start h-auto py-4"
                  >
                    <User className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Consommateur</div>
                      <div className="text-xs opacity-80">Je découvre et soutiens les opérateurs gabonais</div>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={signupData.accountType === 'merchant' ? 'default' : 'outline'}
                    onClick={() => setSignupData({ ...signupData, accountType: 'merchant' })}
                    className="w-full justify-start h-auto py-4"
                  >
                    <Building className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Opérateur économique</div>
                      <div className="text-xs opacity-80">Je valorise mon savoir-faire gabonais</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Basic Info Step */}
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

            {/* Contact Info Step */}
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

            {/* Location Step */}
            {currentStep === 'location-info' && (
              <div className="space-y-4">
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

            {/* Business Info Step */}
            {currentStep === 'business-info' && signupData.accountType === 'merchant' && (
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Informations professionnelles
                </Badge>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nom de l'entreprise/boutique *</Label>
                  <Input
                    id="businessName"
                    value={signupData.businessName || ''}
                    onChange={(e) => setSignupData({ ...signupData, businessName: e.target.value })}
                    placeholder="Mon Entreprise Gabonaise"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessCategory">Catégorie d'activité *</Label>
                  <select
                    id="businessCategory"
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    value={signupData.businessCategory || ''}
                    onChange={(e) => setSignupData({ ...signupData, businessCategory: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="artisan">Artisan</option>
                    <option value="commerce">Commerce</option>
                    <option value="service">Service</option>
                    <option value="restauration">Restauration</option>
                    <option value="technologie">Technologie</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Téléphone professionnel</Label>
                  <Input
                    id="businessPhone"
                    value={signupData.businessPhone || ''}
                    onChange={(e) => setSignupData({ ...signupData, businessPhone: e.target.value })}
                    placeholder="+241 XX XX XX XX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email professionnel</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={signupData.businessEmail || ''}
                    onChange={(e) => setSignupData({ ...signupData, businessEmail: e.target.value })}
                    placeholder="contact@monentreprise.ga"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
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

            {/* OAuth Options (only on first step) */}
            {currentStep === 'profile-choice' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    S'inscrire avec Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('github')}
                  >
                    Continuer avec GitHub
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};