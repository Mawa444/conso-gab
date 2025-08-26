import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, Mail, Phone, Upload, Star, Award } from "lucide-react";

interface ConsumerRegistrationPageProps {
  identityData: {
    pseudo: string;
    firstName?: string;
    lastName?: string;
  };
  locationData: {
    useGPS: boolean;
    manualLocation?: string;
  };
  onNext: (data: ConsumerFormData) => void;
  onBack: () => void;
}

interface ConsumerFormData {
  email?: string;
  phone?: string;
  profilePicture?: File;
  interests: string[];
  visibility: 'public' | 'restricted' | 'private';
}

const interestOptions = [
  { id: 'commerce', label: '🛒 Commerce général', color: 'bg-primary' },
  { id: 'artisanat', label: '🎨 Artisanat local', color: 'bg-secondary' },
  { id: 'alimentation', label: '🍽️ Alimentation', color: 'bg-accent' },
  { id: 'services', label: '⚙️ Services', color: 'bg-primary' },
  { id: 'mode', label: '👗 Mode & Beauté', color: 'bg-secondary' },
  { id: 'technologie', label: '💻 Technologie', color: 'bg-accent' },
];

export const ConsumerRegistrationPage = ({ 
  identityData, 
  locationData, 
  onNext, 
  onBack 
}: ConsumerRegistrationPageProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'restricted' | 'private'>('public');
  const [showGamification, setShowGamification] = useState(false);

  const handleInterestToggle = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = () => {
    // Déclencher gamification
    setShowGamification(true);
    
    setTimeout(() => {
      onNext({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        profilePicture: profilePicture || undefined,
        interests,
        visibility
      });
    }, 2000);
  };

  if (showGamification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 py-8 flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-8 animate-scale-in">
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Award className="h-16 w-16 text-white" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                🎉 Félicitations {identityData.pseudo} !
              </h2>
              <p className="text-lg text-primary font-medium">
                Votre profil est prêt !
              </p>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-secondary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">Points Citoyens 🎖️</p>
                <p className="text-sm text-muted-foreground">
                  Chaque interaction (avis, commentaires, likes) vous fait gagner des points !
                </p>
              </div>
            </div>
          </Card>

          <div className="w-full bg-primary/20 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-10 text-4xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-20 left-10 text-3xl opacity-15 animate-bounce">🛒</div>

      <div className="max-w-md mx-auto space-y-8 pt-4">
        {/* Header avec récap */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            Finalisez votre profil consommateur
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

        <div className="space-y-6">
          {/* Contact (optionnel) */}
          <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border-primary/20">
            <div className="space-y-4">
              <Label className="text-base font-medium">Contact (recommandé)</Label>
              
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="pl-10"
                  />
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+241 XX XX XX XX"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Photo de profil */}
          <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
            <div className="space-y-4">
              <Label className="text-base font-medium">Photo de profil (encouragé)</Label>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                  {profilePicture ? (
                    <img 
                      src={URL.createObjectURL(profilePicture)} 
                      alt="Profil" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <Label 
                    htmlFor="profile-upload" 
                    className="cursor-pointer flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary/80"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{profilePicture ? "Changer de photo" : "Ajouter une photo"}</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Style fun et accueillant recommandé !
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Centres d'intérêt */}
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <div className="space-y-4">
              <Label className="text-base font-medium">Centres d'intérêt</Label>
              
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((interest) => (
                  <Button
                    key={interest.id}
                    variant={interests.includes(interest.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`justify-start text-left h-auto py-3 px-3 ${
                      interests.includes(interest.id) 
                        ? `${interest.color} text-white hover:opacity-90` 
                        : "border-primary/20 hover:bg-primary/5"
                    }`}
                  >
                    <span className="text-xs leading-tight">{interest.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Visibilité */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="space-y-4">
              <Label className="text-base font-medium">Visibilité du profil</Label>
              
              <RadioGroup value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="text-sm">🌍 Public (visible à tous)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restricted" id="restricted" />
                    <Label htmlFor="restricted" className="text-sm">👥 Cercle restreint (amis/contacts)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="text-sm">🔒 Privé (moi seul)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </Card>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3 animate-fade-in delay-500">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Finaliser mon profil 🚀
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