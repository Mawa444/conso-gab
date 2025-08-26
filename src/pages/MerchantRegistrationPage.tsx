import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building, Upload, Globe, Phone, Mail, FileText, CheckCircle, Star } from "lucide-react";

interface MerchantRegistrationPageProps {
  identityData: {
    pseudo: string;
    firstName?: string;
    lastName?: string;
  };
  locationData: {
    useGPS: boolean;
    manualLocation?: string;
  };
  onNext: (data: MerchantFormData) => void;
  onBack: () => void;
}

interface MerchantFormData {
  businessName: string;
  description?: string;
  category: string;
  logo?: File;
  businessPhone?: string;
  businessEmail?: string;
  website?: string;
  whatsapp?: string;
  patentNumber?: string;
  requestVerification: boolean;
  visibility: 'public' | 'restricted' | 'private';
}

const businessCategories = [
  { id: 'artisan', label: '🔨 Artisan', description: 'Création manuelle' },
  { id: 'commerce', label: '🛒 Commerce', description: 'Vente de produits' },
  { id: 'service', label: '⚙️ Service', description: 'Prestations diverses' },
  { id: 'restauration', label: '🍽️ Restauration', description: 'Alimentation' },
  { id: 'technologie', label: '💻 Technologie', description: 'IT & Digital' },
  { id: 'transport', label: '🚗 Transport', description: 'Mobilité' },
];

export const MerchantRegistrationPage = ({ 
  identityData, 
  locationData, 
  onNext, 
  onBack 
}: MerchantRegistrationPageProps) => {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [patentNumber, setPatentNumber] = useState("");
  const [requestVerification, setRequestVerification] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'restricted' | 'private'>('public');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      handleStepComplete(step);
      setStep(step + 1);
    } else {
      onNext({
        businessName,
        description: description.trim() || undefined,
        category,
        logo: logo || undefined,
        businessPhone: businessPhone.trim() || undefined,
        businessEmail: businessEmail.trim() || undefined,
        website: website.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        patentNumber: patentNumber.trim() || undefined,
        requestVerification,
        visibility
      });
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return businessName.trim() && category;
      case 2:
        return true; // Toutes les infos de contact sont optionnelles
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center space-x-2 mb-8">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            stepNum === step 
              ? 'bg-primary text-white' 
              : completedSteps.includes(stepNum)
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
          }`}>
            {completedSteps.includes(stepNum) ? <CheckCircle className="h-4 w-4" /> : stepNum}
          </div>
          {stepNum < 3 && <div className="w-8 h-0.5 bg-muted mx-2"></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-10 text-4xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-20 left-10 text-3xl opacity-15 animate-bounce">🏪</div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            Espace Opérateur Économique
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {identityData.pseudo}
            </Badge>
            <Badge variant="outline" className="border-accent/30 text-accent">
              {locationData.manualLocation || "Position GPS"}
            </Badge>
          </div>
        </div>

        {renderProgressBar()}

        {/* Étape 1: Informations principales */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-6 w-6 text-primary" />
                  <Label className="text-base font-medium">Informations professionnelles</Label>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Nom de l'entreprise / atelier / boutique *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Mon Entreprise Gabonaise"
                      className="mt-1"
                    />
                    {businessName && (
                      <p className="text-xs text-green-600 mt-1">
                        ✨ Excellent ! Vos clients sauront qui vous êtes.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Catégorie d'activité *</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {businessCategories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={category === cat.id ? "default" : "outline"}
                          onClick={() => setCategory(cat.id)}
                          className="justify-start h-auto py-3 px-4"
                        >
                          <div className="text-left">
                            <div className="font-medium">{cat.label}</div>
                            <div className="text-xs opacity-80">{cat.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description de votre activité</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez votre savoir-faire gabonais..."
                      className="mt-1 min-h-20"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Étape 2: Contact et présentation */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
              <div className="space-y-4">
                <Label className="text-base font-medium">Contact et présentation</Label>
                
                <div className="space-y-4">
                  {/* Logo */}
                  <div className="space-y-3">
                    <Label>Logo / Photo d'enseigne</Label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                        {logo ? (
                          <img 
                            src={URL.createObjectURL(logo)} 
                            alt="Logo" 
                            className="w-full h-full rounded-lg object-cover" 
                          />
                        ) : (
                          <Building className="h-8 w-8 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label 
                          htmlFor="logo-upload" 
                          className="cursor-pointer flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary/80"
                        >
                          <Upload className="h-4 w-4" />
                          <span>{logo ? "Changer le logo" : "Téléverser un logo"}</span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="Téléphone professionnel"
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="Email professionnel"
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="Site web (optionnel)"
                        className="pl-10"
                      />
                    </div>
                    
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="WhatsApp Business"
                    />
                  </div>

                  {(businessPhone || businessEmail) && (
                    <p className="text-xs text-green-600">
                      ✅ Parfait ! Vos clients sauront comment vous joindre directement.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Étape 3: Certification et finalisation */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <div className="space-y-4">
                <Label className="text-base font-medium">Certification et visibilité</Label>
                
                <div className="space-y-4">
                  {/* Numéro de patente */}
                  <div>
                    <Label htmlFor="patentNumber">Numéro de patente (pour certification)</Label>
                    <div className="relative mt-1">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="patentNumber"
                        value={patentNumber}
                        onChange={(e) => setPatentNumber(e.target.value)}
                        placeholder="Numéro de patente (optionnel)"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Demande de certification */}
                  <Card className="p-4 bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-secondary mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm font-medium">Compte certifié avec badge</Label>
                        <p className="text-xs text-muted-foreground">
                          Augmentez votre crédibilité avec un badge de vérification
                        </p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={requestVerification}
                            onChange={(e) => setRequestVerification(e.target.checked)}
                            className="rounded border-primary/20"
                          />
                          <Label className="text-sm">Demander la certification</Label>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Visibilité */}
                  <div>
                    <Label className="text-base font-medium">Visibilité du profil</Label>
                    <RadioGroup value={visibility} onValueChange={(value: any) => setVisibility(value)} className="mt-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <Label htmlFor="public" className="text-sm">🌍 Public (recommandé pour les entreprises)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="restricted" id="restricted" />
                          <Label htmlFor="restricted" className="text-sm">👥 Cercle restreint</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private" className="text-sm">🔒 Privé</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </Card>

            {/* Message de fin */}
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <p className="text-center text-sm font-medium text-foreground">
                🎉 Bravo {identityData.pseudo} ! Votre espace professionnel sera bientôt prêt.
                <br />
                <span className="text-primary">Vous pourrez créer votre premier catalogue après inscription.</span>
              </p>
            </Card>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-3">
          <Button
            onClick={handleNext}
            disabled={!canContinue()}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {step === 3 ? "Finaliser mon espace pro 🚀" : "Étape suivante"}
          </Button>
          
          <Button
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
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