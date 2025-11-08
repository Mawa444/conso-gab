import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";
import { SignupWizard } from "./SignupWizard";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgotPassword';

// Fonctions de validation
const validatePassword = (password: string): { meets: boolean; strength: number } => {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const meets = hasLength && hasUpper && hasNumber;
  let strength = 0;
  if (hasLength) strength++;
  if (hasUpper) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;

  return { meets, strength };
};

const getPasswordStrengthText = (strength: number): string => {
  if (strength <= 1) return "Très faible";
  if (strength === 2) return "Faible";
  if (strength === 3) return "Moyen";
  return "Fort";
};

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showSignupWizard, setShowSignupWizard] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Réinitialisation des champs lors du changement de mode
  useEffect(() => {
    if (mode === 'forgotPassword') {
      setPassword("");
    }
    setPasswordError("");
    setEmailError("");
  }, [mode]);

  // Gestion de la fermeture par Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  if (showSignupWizard) {
    return (
      <SignupWizard
        email={email}
        password={password}
        onComplete={async (signupData) => {
          setLoading(true);
          try {
            const { data, error } = await signUp(email, password, {
              role: signupData.userType === "createur" ? 'merchant' : 'consumer',
              pseudo: signupData.fullName,
              phone: signupData.phone,
              country: signupData.country,
              province: signupData.province,
              department: signupData.department,
              arrondissement: signupData.arrondissement,
              quartier: signupData.quartier,
              address: signupData.address,
              latitude: signupData.latitude,
              longitude: signupData.longitude,
              businessName: signupData.businessName,
              businessCategory: signupData.businessCategory,
              businessDescription: signupData.businessDescription,
              patrioteEcoPledge: signupData.patrioteEcoPledge,
            });

            if (error) throw error;

            toast({
              title: "Inscription réussie ! 🎉",
              description: "Bienvenue dans la communauté ConsoGab !",
            });
            
            // Redirection automatique vers consumer/home
            navigate('/consumer/home', { replace: true });
            onClose();
          } catch (error: any) {
            toast({
              title: "Erreur",
              description: "Une erreur s'est produite lors de l'inscription",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }}
        onClose={() => setShowSignupWizard(false)}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError("");
    setEmailError("");

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: "Connexion réussie !",
          description: "Bon retour parmi nous !",
        });
        
        // Redirection automatique vers consumer/home
        navigate('/consumer/home', { replace: true });
        onClose();
      } else if (mode === 'signup') {
        // Validation du mot de passe pour l'inscription
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.meets) {
          setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre");
          return;
        }
        
        if (!email || !password) {
          toast({
            title: "Erreur",
            description: "Veuillez remplir tous les champs",
            variant: "destructive",
          });
          return;
        }
        setShowSignupWizard(true);
      } else if (mode === 'forgotPassword') {
        if (!email) {
          setEmailError('Veuillez entrer votre email');
          return;
        }
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) throw error;
        
        toast({
          title: "Email envoyé !",
          description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
        });
        setMode('login');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Email ou mot de passe incorrect", // Message générique pour la sécurité
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion du clic en dehors du modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const passwordValidation = validatePassword(password);
  const showPasswordStrength = mode === 'signup' && password.length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[var(--z-modal)] p-4"
      style={{ zIndex: 'var(--z-modal)' }}
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md" ref={modalRef}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {mode === 'login' && "Connexion"}
              {mode === 'signup' && "Inscription"}
              {mode === 'forgotPassword' && "Mot de passe oublié"}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-muted-foreground"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                required
                aria-describedby={emailError ? "email-error" : undefined}
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p id="email-error" className="text-sm text-destructive mt-1">
                  {emailError}
                </p>
              )}
            </div>
            
            {mode !== 'forgotPassword' && (
              <div>
                <Label htmlFor="password">
                  Mot de passe
                  {mode === 'signup' && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (8 caractères, majuscule, chiffre)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    autoComplete={mode === 'login' ? "current-password" : "new-password"}
                    className={`pr-10 ${passwordError ? "border-destructive" : ""}`}
                    required
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {showPasswordStrength && (
                  <div className="mt-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-muted rounded">
                        <div 
                          className={`h-2 rounded transition-all duration-200 ${
                            passwordValidation.strength <= 1 ? 'bg-red-500 w-1/4' :
                            passwordValidation.strength === 2 ? 'bg-orange-500 w-2/4' :
                            passwordValidation.strength === 3 ? 'bg-yellow-500 w-3/4' :
                            'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getPasswordStrengthText(passwordValidation.strength)}
                      </span>
                    </div>
                  </div>
                )}
                
                {passwordError && (
                  <p id="password-error" className="text-sm text-destructive mt-1">
                    {passwordError}
                  </p>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={loading}
            >
              {loading ? "Chargement..." : 
                mode === 'login' ? "Se connecter" : 
                mode === 'signup' ? "Commencer l'inscription" :
                "Envoyer le lien"
              }
            </Button>
            
            <div className="text-center space-y-2">
              {mode === 'login' && (
                <>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode('signup')}
                    className="text-sm"
                  >
                    Pas encore de compte ? S'inscrire
                  </Button>
                  <br />
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode('forgotPassword')}
                    className="text-xs text-muted-foreground"
                  >
                    <KeyRound className="w-3 h-3 mr-1" />
                    Mot de passe oublié ?
                  </Button>
                </>
              )}
              
              {mode === 'signup' && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('login')}
                  className="text-sm"
                >
                  Déjà un compte ? Se connecter
                </Button>
              )}
              
              {mode === 'forgotPassword' && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('login')}
                  className="text-sm"
                >
                  Retour à la connexion
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};