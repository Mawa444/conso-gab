import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationPageProps {
  role: 'consumer' | 'merchant';
  onBack: () => void;
  onSuccess: () => void;
}

export const RegistrationPage = ({ role, onBack, onSuccess }: RegistrationPageProps) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pseudoAvailable, setPseudoAvailable] = useState<boolean | null>(null);
  const [pseudoChecking, setPseudoChecking] = useState(false);
  
  const [formData, setFormData] = useState({
    pseudo: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    profilePicture: null as File | null,
    visibility: 'public'
  });

  const [validation, setValidation] = useState({
    pseudoLength: false,
    passwordLength: false,
    passwordMatch: false,
  });

  const validatePseudo = (pseudo: string) => {
    const alphanumeric = /^[a-zA-Z0-9]+$/.test(pseudo);
    const length = pseudo.length >= 3 && pseudo.length <= 20;
    return alphanumeric && length;
  };

  const checkPseudoAvailability = async (pseudo: string) => {
    if (!validatePseudo(pseudo)) {
      setPseudoAvailable(null);
      return;
    }

    setPseudoChecking(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('pseudo')
        .eq('pseudo', pseudo)
        .single();
      
      setPseudoAvailable(error?.code === 'PGRST116'); // No rows found = available
    } catch (err) {
      console.error('Error checking pseudo:', err);
    }
    setPseudoChecking(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'pseudo') {
      const isValid = validatePseudo(value);
      setValidation(prev => ({ ...prev, pseudoLength: isValid }));
      
      if (isValid) {
        const debounceTimer = setTimeout(() => checkPseudoAvailability(value), 500);
        return () => clearTimeout(debounceTimer);
      } else {
        setPseudoAvailable(null);
      }
    }
    
    if (field === 'password') {
      setValidation(prev => ({ 
        ...prev, 
        passwordLength: value.length >= 6,
        passwordMatch: value === formData.confirmPassword
      }));
    }
    
    if (field === 'confirmPassword') {
      setValidation(prev => ({ 
        ...prev, 
        passwordMatch: value === formData.password
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.pseudoLength || !validation.passwordLength || !validation.passwordMatch || pseudoAvailable !== true) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    if (!formData.email && !formData.phone) {
      toast.error("Veuillez fournir un email ou un numéro de téléphone");
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        role,
        pseudo: formData.pseudo,
        phone: formData.phone,
        visibility: formData.visibility,
        profile_picture_url: null // TODO: Handle file upload
      };

      const { error } = await signUp(
        formData.email || `${formData.pseudo}@gaboma.app`, // Fallback email if only phone provided
        formData.password,
        userData
      );

      if (error) {
        throw error;
      }

      toast.success("Compte créé avec succès! Vérifiez votre email.");
      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Inscription</h1>
          <p className="text-muted-foreground">
            {role === 'consumer' ? 'Consommateur' : 'Commerçant / Entreprise'}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pseudo */}
            <div className="space-y-2">
              <Label htmlFor="pseudo">Pseudo *</Label>
              <div className="relative">
                <Input
                  id="pseudo"
                  value={formData.pseudo}
                  onChange={(e) => handleInputChange('pseudo', e.target.value)}
                  placeholder="MonPseudo123"
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {pseudoChecking ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : pseudoAvailable === true ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : pseudoAvailable === false ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                3-20 caractères alphanumériques uniquement
              </p>
              {pseudoAvailable === false && (
                <p className="text-xs text-red-500">Ce pseudo n'est pas disponible</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${validation.passwordLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-muted-foreground">Minimum 6 caractères</span>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${validation.passwordMatch ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-muted-foreground">Les mots de passe correspondent</span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="mon.email@exemple.com"
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+241 XX XX XX XX"
              />
            </div>

            {/* Visibilité du profil */}
            <div className="space-y-3">
              <Label>Visibilité du profil</Label>
              <RadioGroup 
                value={formData.visibility}
                onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="text-sm">Public (visible à tous)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="restricted" id="restricted" />
                  <Label htmlFor="restricted" className="text-sm">Cercle restreint (amis/clients)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="text-sm">Privé (moi seul)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !validation.pseudoLength || !validation.passwordLength || !validation.passwordMatch || pseudoAvailable !== true}
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};