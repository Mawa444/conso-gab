import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";
import { SignupWizard } from "./SignupWizard";
import { Eye, EyeOff, X } from "lucide-react";

// --- Helpers ---
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showSignupWizard, setShowSignupWizard] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  // --- Validations ---
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      return;
    }
    setEmailError(validateEmail(email) ? null : "Adresse email invalide");
  }, [email]);

  useEffect(() => {
    if (!password) {
      setPasswordError(null);
      return;
    }
    if (passwordStrength(password) < 2) {
      setPasswordError(
        "Le mot de passe doit contenir au moins 8 caractères, un chiffre et une majuscule."
      );
    } else {
      setPasswordError(null);
    }
  }, [password]);

  if (!open) return null;

  // --- Signup Wizard ---
  if (showSignupWizard) {
    return (
      <SignupWizard
        onComplete={async (signupData) => {
          setLoading(true);
          try {
            const { error } = await signUp(email, password, {
              full_name: signupData.fullName,
              user_type: signupData.userType,
              phone: signupData.phone,
              province: signupData.province,
              department: signupData.department,
              arrondissement: signupData.arrondissement,
              quartier: signupData.quartier,
              business_name: signupData.businessName,
              business_category: signupData.businessCategory,
              business_description: signupData.businessDescription,
              patriote_eco_pledge: signupData.patrioteEcoPledge,
            });

            if (error) throw new Error(error.message || "Erreur inconnue");

            toast({
              title: "Inscription réussie 🎉",
              description: "Bienvenue dans la communauté ConsoGab !",
            });

            // Connexion auto après inscription
            await signIn(email, password);
            onClose();
          } catch (err: any) {
            toast({
              title: "Erreur",
              description: err.message || "Une erreur inattendue est survenue",
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

  // --- Reset Password ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || !email) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw new Error(error.message);

      toast({
        title: "Email envoyé ✉️",
        description:
          "Un lien de réinitialisation vous a été envoyé. Vérifiez vos emails.",
      });

      setIsResetPassword(false);
      setIsLogin(true);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible d’envoyer l’email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Login / Register ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || passwordError) {
      toast({
        title: "Champs invalides",
        description: "Veuillez corriger les erreurs avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error.message || "Échec de la connexion");

        toast({
          title: "Connexion réussie ✅",
          description: "Bon retour parmi nous !",
        });
        onClose();
      } else {
        if (!email || !password) {
          toast({
            title: "Champs requis",
            description: "Veuillez remplir tous les champs",
            variant: "destructive",
          });
          return;
        }
        setShowSignupWizard(true);
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de terminer l’action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1200] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <Card className="w-full max-w-md shadow-xl border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle id="login-modal-title" className="text-xl font-bold">
              {isResetPassword
                ? "Mot de passe oublié"
                : isLogin
                ? "Connexion"
                : "Inscription"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fermer la fenêtre"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isResetPassword ? (
            // --- Reset Password Form ---
            <form
              onSubmit={handleResetPassword}
              className="space-y-4"
              noValidate
            >
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsResetPassword(false)}
                  className="text-sm"
                >
                  Retour à la connexion
                </Button>
              </div>
            </form>
          ) : (
            // --- Login / Register Form ---
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  required
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="pr-10"
                    required={!isResetPassword}
                    aria-invalid={!!passwordError}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}

                {/* Password Strength */}
                {!isLogin && password && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className={`h-2 rounded ${
                          strength <= 1
                            ? "bg-red-500 w-1/4"
                            : strength === 2
                            ? "bg-yellow-500 w-2/4"
                            : strength === 3
                            ? "bg-blue-500 w-3/4"
                            : "bg-green-600 w-full"
                        }`}
                      />
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Force du mot de passe :{" "}
                      {strength <= 1
                        ? "Faible"
                        : strength === 2
                        ? "Moyen"
                        : strength === 3
                        ? "Fort"
                        : "Très fort"}
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-white"
                disabled={loading}
              >
                {loading
                  ? "Chargement..."
                  : isLogin
                  ? "Se connecter"
                  : "Commencer l'inscription"}
              </Button>

              {/* Liens secondaires */}
              <div className="flex justify-between items-center">
                {isLogin && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => setIsResetPassword(true)}
                  >
                    Mot de passe oublié ?
                  </Button>
                )}

                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsLogin((prev) => !prev);
                    setIsResetPassword(false);
                  }}
                  className="text-sm ml-auto"
                >
                  {isLogin
                    ? "Pas encore de compte ? S'inscrire"
                    : "Déjà un compte ? Se connecter"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
