import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, User, Star, Trophy, Flag, Navigation, Loader2, CheckCircle, Globe, MapIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProvinces, useDepartments, useArrondissements, useQuartiers } from "@/hooks/use-location-data";
import { LocationStep } from "./LocationStep";

type UserType = "explorateur" | "createur";

// ✅ Supprimé: email, password (gérés dans LoginModal)
interface SignupData {
  userType: UserType;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  country?: string;
  province: string;
  department: string;
  arrondissement: string;
  quartier: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  logoUrl?: string;
  patrioteEcoPledge: boolean;
}

interface SignupWizardProps {
  onComplete: (data: SignupData) => void;
  onClose: () => void;
}

export const SignupWizard = ({ onComplete, onClose }: SignupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<SignupData>>({ userType: "explorateur" });
  const [points, setPoints] = useState(0);
  const { toast } = useToast();

  const { data: provinces } = useProvinces();
  const { data: departments } = useDepartments(data.province);
  const { data: arrondissements } = useArrondissements(data.department);
  const { data: quartiers } = useQuartiers(data.arrondissement);

  const steps = [
    "Accueil",
    "Rôle", 
    "Informations",
    "Localisation",
    "Mise en avant",
    "Engagement",
    "Finalisation"
  ];

  const addPoints = (pointsToAdd: number, message: string) => {
    setPoints(prev => prev + pointsToAdd);
    toast({
      title: `+${pointsToAdd} points! 🎉`,
      description: message,
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 9; // +241 + 8 chiffres = 11, mais on accepte 9+ chiffres
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🇬🇦</div>
            <h2 className="text-2xl font-bold text-primary">
              Bienvenue dans la communauté des ConsoGab
            </h2>
            <p className="text-muted-foreground text-lg">
              Ici, chaque action compte pour construire notre économie locale.
            </p>
            <Button 
              onClick={nextStep}
              className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 text-lg"
              size="lg"
            >
              Commencer mon inscription
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold">Bienvenue dans ConsoGab !</h2>
            <p className="text-muted-foreground">Vous créez un profil consommateur. Vous pourrez créer votre entreprise plus tard depuis votre profil.</p>
            <Button 
              onClick={() => {
                setData(prev => ({ ...prev, userType: "explorateur" }));
                addPoints(10, "Bienvenue ! Découvrez l'économie gabonaise 🇬🇦");
                nextStep();
              }}
              className="w-full"
            >
              Commencer
            </Button>
          </div>
        );

      case 2:
        const isInfoValid = data.fullName?.trim() && isValidPhone(data.phone || "");
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Informations personnelles</h2>
              <p className="text-muted-foreground">Ton profil, c'est ton passeport dans l'économie locale ✨</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={data.fullName || ""}
                  onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value.trim() }))}
                  placeholder="Votre nom complet"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={data.phone || ""}
                  onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+241 XX XX XX XX"
                />
                {data.phone !== undefined && !isValidPhone(data.phone) && data.phone.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">Numéro de téléphone invalide</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              <Button 
                onClick={() => {
                  addPoints(15, "Informations de base complétées !");
                  nextStep();
                }}
                disabled={!isInfoValid}
                className="w-[120px]"
              >
                Suivant
              </Button>
            </div>
          </div>
        );

      case 3:
        const isLocationValid = !!(
          (data.province && data.department && data.arrondissement && data.quartier) ||
          (data.latitude != null && data.longitude != null)
        );
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Localisation</h2>
              <p className="text-muted-foreground">Où te trouves-tu au Gabon ?</p>
            </div>
            
            <LocationStep
              onLocationChange={(locationData) => {
                setData(prev => ({ 
                  ...prev,
                  country: locationData.country,
                  province: locationData.province || locationData.region,
                  department: locationData.department,
                  arrondissement: locationData.arrondissement,
                  quartier: locationData.quartier || locationData.neighborhood,
                  address: locationData.address || locationData.formattedAddress,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude
                }));
              }}
              initialLocation={{
                country: data.country,
                province: data.province,
                department: data.department,
                arrondissement: data.arrondissement,
                quartier: data.quartier,
                address: data.address
              }}
            />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              <Button 
                onClick={() => {
                  addPoints(20, "Localisation validée ! Les Gabonais proches de toi pourront te trouver facilement 🚀");
                  nextStep();
                }}
                disabled={!isLocationValid}
                className="w-[120px]"
              >
                Suivant
              </Button>
            </div>
          </div>
        );

      case 4:
        if (data.userType === "explorateur") {
          return (
            <div className="space-y-6 text-center">
              <h2 className="text-xl font-bold">Presque fini !</h2>
              <p className="text-muted-foreground">En tant qu'explorateur, tu es prêt à découvrir notre économie locale !</p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep} size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button onClick={nextStep} className="w-[120px]">
                  Suivant
                </Button>
              </div>
            </div>
          );
        }

        const isBusinessValid = !!data.businessName?.trim();
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Mise en avant de ton activité</h2>
              <p className="text-muted-foreground">Ta vitrine digitale nationale 🏗️</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Nom de ton activité *</Label>
                <Input
                  id="businessName"
                  value={data.businessName || ""}
                  onChange={(e) => setData(prev => ({ ...prev, businessName: e.target.value.trim() }))}
                  placeholder="Nom de votre entreprise"
                />
              </div>
              
              <div>
                <Label htmlFor="businessCategory">Catégorie</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={data.businessCategory || ""}
                  onChange={(e) => setData(prev => ({ ...prev, businessCategory: e.target.value }))}
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Services">Services</option>
                  <option value="Artisanat">Artisanat</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Technologie">Technologie</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="businessDescription">Description (150 caractères max)</Label>
                <Textarea
                  id="businessDescription"
                  value={data.businessDescription || ""}
                  onChange={(e) => setData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  placeholder="Décrivez votre activité en quelques mots..."
                  maxLength={150}
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              <Button 
                onClick={() => {
                  addPoints(25, "Description complète ! Ta vitrine digitale est créée 🎨");
                  nextStep();
                }}
                disabled={!isBusinessValid}
                className="w-[120px]"
              >
                Suivant
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🇬🇦</div>
            <h2 className="text-xl font-bold">Engagement citoyen</h2>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <p className="font-medium text-primary">"Chaque achat local fait grandir notre pays."</p>
              <p className="font-medium text-accent">"Soutenir un créateur gabonais, c'est investir dans ton voisin, ton frère, ta sœur."</p>
              <p className="font-medium text-secondary">"Consommer gabonais, c'est bâtir notre futur ensemble 🇬🇦."</p>
            </div>
            
            <div className="flex items-center space-x-2 justify-center">
              <Checkbox 
                id="pledge"
                checked={data.patrioteEcoPledge || false}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, patrioteEcoPledge: checked as boolean }))
                }
              />
              <Label htmlFor="pledge" className="text-sm font-medium">
                Je m'engage à soutenir le Made in Gabon ✔️
              </Label>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              <Button 
                onClick={() => {
                  addPoints(50, "Badge Patriote Éco débloqué ! 🏆");
                  nextStep();
                }}
                disabled={!data.patrioteEcoPledge}
                className="w-[120px] bg-gradient-to-r from-primary to-accent"
              >
                Suivant
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-2xl font-bold text-primary">
              Félicitations {data.fullName?.split(' ')[0]} !
            </h2>
            <p className="text-lg">Tu as rejoint les bâtisseurs du Made in Gabon.</p>
            
            <div className="space-y-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                Nouveau Membre
              </Badge>
              
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                <p className="font-bold text-2xl text-primary">{points} points gagnés !</p>
                <p className="text-sm text-muted-foreground">Ton aventure ConsoGab commence maintenant</p>
              </div>
            </div>
            
            <Button 
              onClick={() => onComplete(data as SignupData)}
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              size="lg"
            >
              Découvrir ma communauté
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">
              {steps[currentStep]} ({currentStep + 1}/{steps.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              {points > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {points} pts
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-muted-foreground"
              >
                ✕
              </Button>
            </div>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};