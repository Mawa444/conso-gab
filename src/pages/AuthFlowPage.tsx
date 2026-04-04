import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import gabomaLogo from "@/assets/gaboma-logo.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { TermsDialog } from "@/components/auth/TermsDialog";

type AuthView = 'welcome' | 'login' | 'signup';

interface AuthFlowPageProps {
  onComplete: () => void;
}

export const AuthFlowPage = ({ onComplete }: AuthFlowPageProps) => {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Signup fields
  const [pseudo, setPseudo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    try {
      const prefillEmail = localStorage.getItem('prefillEmail');
      if (prefillEmail && view === 'login') {
        setEmail(prefillEmail);
        localStorage.removeItem('prefillEmail');
      }
    } catch { /* ignore */ }
  }, [view]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/consumer/home', { replace: true });
      onComplete();
    }
  }, [user, loading, navigate, onComplete]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim().toLowerCase(), password);
      if (error) {
        toast.error(error.message || 'Erreur de connexion');
        return;
      }
      toast.success('Connexion réussie ! 👋');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !pseudo) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signUp(email.trim().toLowerCase(), password, {
        pseudo,
        role: 'consumer',
        first_name: firstName,
        last_name: lastName,
      });
      if (error) {
        if (error.message?.includes('existe déjà') || error.message === 'EXISTING_USER') {
          toast.error('Un compte existe déjà avec cet email. Connectez-vous.');
          setView('login');
        } else {
          toast.error(error.message || "Erreur lors de l'inscription");
        }
        return;
      }
      toast.success('Compte créé avec succès ! 🎉');
      // Auth context will handle redirect via onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Erreur Google: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Entrez votre email d'abord");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      toast.success('Email de récupération envoyé !');
    } catch (error: any) {
      toast.error("Erreur: " + error.message);
    }
  };

  const GoogleButton = () => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continuer avec Google
    </Button>
  );

  const TermsFooter = () => (
    <p className="text-xs text-center text-muted-foreground">
      En continuant, vous acceptez nos{' '}
      <TermsDialog>
        <button type="button" className="text-primary underline hover:no-underline">
          conditions d'utilisation
        </button>
      </TermsDialog>
    </p>
  );

  // Welcome
  if (view === 'welcome') {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <img src={gabomaLogo} alt="ConsoGab" className="w-36 h-36 object-contain mx-auto" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">ConsoGab</h1>
              <p className="text-lg text-muted-foreground">L'économie gabonaise à portée de main</p>
              <p className="text-sm text-muted-foreground">Découvrez et connectez-vous avec les commerces du Gabon</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button onClick={() => setView('login')} className="w-full h-12 text-base">
                Se connecter
              </Button>
              <Button onClick={() => setView('signup')} variant="outline" className="w-full h-12 text-base">
                Créer un compte
              </Button>
              <Separator />
              <GoogleButton />
              <TermsFooter />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Signup
  if (view === 'signup') {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <img src={gabomaLogo} alt="ConsoGab" className="w-24 h-24 object-contain mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
            <p className="text-sm text-muted-foreground">Rejoignez la communauté ConsoGab</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pseudo">Pseudo *</Label>
                  <Input
                    id="pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Votre nom d'utilisateur"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Seul votre pseudo sera visible publiquement</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="votre@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe * (min. 6 caractères)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Création en cours..." : "Créer mon compte"}
                </Button>
              </form>

              <Separator />
              <GoogleButton />

              <div className="text-center space-y-2">
                <button type="button" onClick={() => setView('login')} className="text-primary hover:underline text-sm">
                  Déjà un compte ? Se connecter
                </button>
              </div>
              <TermsFooter />
            </CardContent>
          </Card>

          <Button variant="ghost" size="sm" onClick={() => setView('welcome')} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>
      </div>
    );
  }

  // Login
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <img src={gabomaLogo} alt="ConsoGab" className="w-24 h-24 object-contain mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">ConsoGab 🇬🇦</h1>
          <p className="text-muted-foreground">Connectez-vous à votre compte</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="votre@email.com" required autoComplete="email" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" placeholder="••••••••" required autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <Separator />
            <GoogleButton />

            <div className="text-center space-y-2">
              <button type="button" onClick={() => setView('signup')} className="text-primary hover:underline text-sm">
                Créer un nouveau compte
              </button>
              <br />
              <button type="button" onClick={handleForgotPassword} className="text-muted-foreground hover:text-foreground text-xs">
                Mot de passe oublié ?
              </button>
            </div>
            <TermsFooter />
          </CardContent>
        </Card>

        <Button variant="ghost" size="sm" onClick={() => setView('welcome')} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
      </div>
    </div>
  );
};
