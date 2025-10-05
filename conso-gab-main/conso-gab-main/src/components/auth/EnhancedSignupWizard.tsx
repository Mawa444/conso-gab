import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LocationStep } from "./LocationStep";
import { useLocationSecurity } from "@/hooks/use-location-security";
import { 
  User, 
  MapPin, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Home,
  Building,
  Shield
} from "lucide-react";

interface EnhancedSignupData {
  pseudo: string;
  phone: string;
  role: 'consumer' | 'merchant';
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  location?: any;
  // Nouvelles propriétés pour la géolocalisation
  homeLocation?: any;
  officeLocation?: any;
  locationPrivacy?: 'private' | 'shared_with_contacts' | 'public';
}

interface EnhancedSignupWizardProps {
  onComplete: (data: EnhancedSignupData) => void;
  email: string;
}

const STEPS = [
  { id: 'profile', title: 'Profil', icon: User },
  { id: 'location', title: 'Position', icon: MapPin },
  { id: 'privacy', title: 'Confidentialité', icon: Shield },
  { id: 'review', title: 'Vérification', icon: CheckCircle }
];

export const EnhancedSignupWizard = ({ onComplete, email }: EnhancedSignupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<EnhancedSignupData>({
    pseudo: '',
    phone: '',
    role: 'consumer'
  });
  
  const { saveUserLocation } = useLocationSecurity();

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Profile
        return !!(data.pseudo && data.phone && data.role && 
          (data.role !== 'merchant' || data.businessName));
      case 1: // Location
        return !!(data.homeLocation || data.officeLocation);
      case 2: // Privacy
        return !!data.locationPrivacy;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Étape finale - sauvegarder et compléter
      await handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Sauvegarder les positions avec chiffrement
      if (data.homeLocation) {
        await saveUserLocation(data.homeLocation, 'home');
      }
      if (data.officeLocation) {
        await saveUserLocation(data.officeLocation, 'office');
      }

      // Transmettre les données pour création du compte
      onComplete(data);
    } catch (error) {
      console.error('Erreur sauvegarde géolocalisation:', error);
    }
  };

  const updateData = (updates: Partial<EnhancedSignupData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Informations de base</h3>
              <p className="text-sm text-muted-foreground">
                Créons votre profil ConsoGab
              </p>
            </div>
            {/* Contenu du formulaire profile existant */}
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                {data.role === 'consumer' ? (
                  <Home className="w-12 h-12 text-blue-500" />
                ) : (
                  <Building className="w-12 h-12 text-green-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Position {data.role === 'consumer' ? 'domicile' : 'bureau'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.role === 'consumer' 
                    ? 'Définissez votre position domicile pour les livraisons et services'
                    : 'Définissez la position de votre bureau pour faciliter les visites clients'
                  }
                </p>
              </div>
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800">Position sécurisée</p>
                    <p className="text-sm text-blue-700">
                      Vos coordonnées seront chiffrées et ne seront jamais partagées sans votre autorisation explicite.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <LocationStep
              onLocationChange={(locationData) => {
                if (data.role === 'consumer') {
                  updateData({ homeLocation: locationData });
                } else {
                  updateData({ officeLocation: locationData });
                }
              }}
              initialLocation={data.role === 'consumer' ? data.homeLocation : data.officeLocation}
            />
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 mx-auto text-green-500" />
              <h3 className="text-xl font-semibold">Paramètres de confidentialité</h3>
              <p className="text-sm text-muted-foreground">
                Choisissez qui peut voir votre position
              </p>
            </div>

            <div className="space-y-4">
              {['private', 'shared_with_contacts', ...(data.role === 'merchant' ? ['public'] : [])].map((privacy) => (
                <Card 
                  key={privacy}
                  className={`cursor-pointer border-2 transition-all ${
                    data.locationPrivacy === privacy 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/30'
                  }`}
                  onClick={() => updateData({ locationPrivacy: privacy as any })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            {privacy === 'private' && '🔒 Privé'}
                            {privacy === 'shared_with_contacts' && '👥 Partagé avec contacts'}
                            {privacy === 'public' && '🌐 Public'}
                          </div>
                          {data.locationPrivacy === privacy && (
                            <Badge variant="default" className="bg-green-500">
                              Sélectionné
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {privacy === 'private' && 'Seul vous avez accès à cette position'}
                          {privacy === 'shared_with_contacts' && 'Visible par vos contacts uniquement'}
                          {privacy === 'public' && 'Visible dans votre profil business public'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <h3 className="text-xl font-semibold">Récapitulatif</h3>
              <p className="text-sm text-muted-foreground">
                Vérifiez vos informations avant de créer le compte
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {email}</div>
                  <div><strong>Pseudo:</strong> {data.pseudo}</div>
                  <div><strong>Téléphone:</strong> {data.phone}</div>
                  <div><strong>Rôle:</strong> {data.role === 'consumer' ? 'Consommateur' : 'Professionnel'}</div>
                  {data.businessName && (
                    <div><strong>Entreprise:</strong> {data.businessName}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Type:</strong> {data.role === 'consumer' ? 'Position domicile' : 'Position bureau'}
                  </div>
                  <div>
                    <strong>Confidentialité:</strong>{' '}
                    {data.locationPrivacy === 'private' && 'Privé 🔒'}
                    {data.locationPrivacy === 'shared_with_contacts' && 'Partagé avec contacts 👥'}
                    {data.locationPrivacy === 'public' && 'Public 🌐'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Position configurée et chiffrée ✓
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isValid = isStepValid(index);

            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`
                  p-2 rounded-full transition-all
                  ${isActive ? 'bg-primary text-white' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs text-center">
                  <div className={`font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  {isCompleted && (
                    <div className="text-green-500">✓</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <Progress value={(currentStep + 1) / STEPS.length * 100} className="h-2" />
      </div>

      {/* Contenu de l'étape */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline" 
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isStepValid(currentStep)}
          className="flex-1"
        >
          {currentStep === STEPS.length - 1 ? (
            'Créer le compte'
          ) : (
            <>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};