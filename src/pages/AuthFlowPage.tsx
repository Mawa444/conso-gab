import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Globe, Eye, EyeOff } from "lucide-react";
import gabomaLogo from "@/assets/gaboma-logo.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { GuidedSignupFlow } from "@/components/auth/GuidedSignupFlow";
import { useAuthCleanup } from "@/hooks/use-auth-cleanup";

type AuthStep = 'welcome' | 'login' | 'signup';

interface AuthFlowPageProps {
  onComplete: () => void;
}

export const AuthFlowPage = ({ onComplete }: AuthFlowPageProps) => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const { cleanupAuthState } = useAuthCleanup();
  const [step, setStep] = useState<AuthStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Pré-remplir l'email si disponible
  useEffect(() => {
    try {
      const prefillEmail = localStorage.getItem('prefillEmail');
      if (prefillEmail && step === 'login') {
        setEmail(prefillEmail);
        localStorage.removeItem('prefillEmail');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [step]);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate('/consumer/home', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Erreur de connexion');
        return;
      }
      
      // Redirection automatique vers la page d'accueil
      toast.success('Connexion réussie ! 👋');
      navigate('/consumer/home', { replace: true });
      onComplete();
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome step - first screen
  if (step === 'welcome') {
    return (
      <div className="auth-page noselect">
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <img src={gabomaLogo} alt="ConsoGab" className="w-40 h-40 object-contain" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">ConsoGab</h1>
                <p className="text-lg text-muted-foreground">L'économie gabonaise à portée de main</p>
                <p className="text-sm text-muted-foreground">
                  Découvrez, soutenez et connectez-vous avec les commerces du Gabon
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <Button 
                  onClick={() => setStep('login')} 
                  className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                >
                  Se connecter
                </Button>
                
                <Button 
                  onClick={() => setStep('signup')} 
                  variant="outline"
                  className="w-full h-12 text-base"
                >
                  Créer un nouveau compte
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Continuer avec Google
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

                <p className="text-xs text-center text-muted-foreground mt-6">
                  En continuant, vous acceptez nos conditions d'utilisation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Guided signup flow
  if (step === 'signup') {
    return (
      <div className="auth-page noselect">
        <GuidedSignupFlow 
          onComplete={() => {
            toast.success('Compte créé ! Vous pouvez maintenant vous connecter.');
            setStep('login');
          }}
          onBack={() => setStep('welcome')}
        />
      </div>
    );
  }

  // Login step
  if (step === 'login') {
    return (
      <div className="auth-page noselect">
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img src={gabomaLogo} alt="ConsoGab" className="w-32 h-32 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ConsoGab 🇬🇦</h1>
                <p className="text-muted-foreground">L'économie gabonaise à portée de main</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Connexion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 selectable"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 selectable"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>

                <Separator />

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Continuer avec Google
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

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep('signup')}
                    className="text-primary hover:underline text-sm"
                  >
                    Créer un nouveau compte
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        toast.error('Veuillez entrer votre email d\'abord');
                        return;
                      }
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/auth`
                        });
                        if (error) throw error;
                        toast.success('Email de récupération envoyé !');
                      } catch (error: any) {
                        toast.error('Erreur lors de l\'envoi: ' + error.message);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};