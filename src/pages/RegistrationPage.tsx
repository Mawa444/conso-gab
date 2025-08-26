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

  const handleOAuthSignup = async (provider: 'google' | 'microsoft') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'microsoft' ? 'azure' : provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding?role=${role}`,
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Redirection en cours... 🇬🇦");
    } catch (error: any) {
      console.error('OAuth signup error:', error);
      toast.error(`Erreur ${provider}: ${error.message}`);
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
    <div className="min-h-screen bg-gradient-to-br from-[#009739]/10 via-[#FFD100]/10 to-[#0066B3]/10 px-6 py-8 relative overflow-hidden">
      {/* Éléments décoratifs patriotiques */}
      <div className="absolute top-10 right-10 text-6xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-20 left-10 text-4xl opacity-10 animate-bounce">⭐</div>

      {/* Header */}
      <div className="flex items-center mb-12">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-4 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Inscription
          </h1>
          <p className="text-muted-foreground font-medium">
            {role === 'consumer' ? 'Consommateur patriote 🇬🇦' : 'Opérateur économique 🏪'}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="p-8 border-2 border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-br from-background to-primary/5">
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
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading || !validation.pseudoLength || !validation.passwordLength || !validation.passwordMatch || pseudoAvailable !== true}
            >
              {loading ? "Création en cours... 🇬🇦" : "Créer mon compte gabonais 🚀"}
            </Button>

            {/* Message patriotique d'encouragement */}
            <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground">
                🇬🇦 Rejoignez nos entrepreneurs gabonais !
              </p>
            </div>

            {/* Connexions rapides OAuth */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary/5 border-primary/20 transition-all duration-300 hover:shadow-md"
                onClick={() => handleOAuthSignup('google')}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Inscription rapide avec Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-secondary/5 border-secondary/20 transition-all duration-300 hover:shadow-md"
                onClick={() => handleOAuthSignup('microsoft')}
              >
                <svg className="mr-2 h-4 w-4" fill="#00A4EF" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Continuer avec Microsoft
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};