import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Building, Mail, Lock, Phone, MapPin, Globe } from "lucide-react";
import gabomaLogo from "@/assets/gaboma-logo.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

type AuthStep = 'login' | 'signup' | 'profile-setup';

interface AuthFlowPageProps {
  onComplete: () => void;
}

interface SignupData {
  email: string;
  password: string;
  pseudo: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountType: 'consumer' | 'merchant';
  businessName?: string;
  businessCategory?: string;
  businessPhone?: string;
  businessEmail?: string;
}

export const AuthFlowPage = ({ onComplete }: AuthFlowPageProps) => {
  const { user, loading, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupData, setSignupData] = useState<Partial<SignupData>>({});

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast.success('Connexion réussie !');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!signupData.email || !signupData.password || !signupData.pseudo) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const { data, error } = await signUp(
        signupData.email,
        signupData.password,
        {
          pseudo: signupData.pseudo,
          role: signupData.accountType || 'consumer',
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          phone: signupData.phone
        }
      );

      if (error) throw error;

                      // Créer le profil business si nécessaire
      if (signupData.accountType === 'merchant' && data.user) {
        // Mapper les catégories vers les valeurs de l'énumération
        const categoryMap: Record<string, string> = {
          'artisan': 'manufacturing',
          'commerce': 'retail',
          'service': 'services',
          'restauration': 'restaurant',
          'technologie': 'technology',
          'transport': 'automotive'
        };

        const mappedCategory = categoryMap[signupData.businessCategory || 'service'] || 'other';

        const { error: businessError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: data.user.id,
            business_name: signupData.businessName || signupData.pseudo,
            business_category: mappedCategory as any,
            phone: signupData.businessPhone,
            email: signupData.businessEmail,
            is_active: true
          });

        if (businessError) {
          console.error('Erreur création business profile:', businessError);
        }
      }

      toast.success('Inscription réussie ! Bienvenue dans la communauté économique gabonaise ! 🇬🇦🎉');
      
      // Redirection selon le type de compte
      if (signupData.accountType === 'merchant') {
        // Petit délai pour permettre la création du business profile
        setTimeout(() => {
          navigate('/profile'); // Vers la boutique/profil professionnel
        }, 1000);
      } else {
        navigate('/'); // Vers l'accueil
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
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
    }
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={gabomaLogo} alt="ConsoGab" className="w-16 h-16 rounded-xl shadow-lg" />
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
                      className="pl-10"
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                    />
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
                  Pas encore de compte ? S'inscrire
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-background p-4 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6 py-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('login')}
              className="absolute top-4 left-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div className="flex justify-center">
              <img src={gabomaLogo} alt="ConsoGab" className="w-16 h-16 rounded-xl shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rejoignez ConsoGab</h1>
              <p className="text-muted-foreground">La communauté économique du Gabon 🇬🇦</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Création de compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Type de compte */}
                <div className="space-y-3">
                  <Label>Type de compte</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      variant={signupData.accountType === 'consumer' ? 'default' : 'outline'}
                      onClick={() => setSignupData({ ...signupData, accountType: 'consumer' })}
                      className="justify-start h-auto py-3"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Consommateur</div>
                        <div className="text-xs opacity-80">Je découvre et soutiens les opérateurs gabonais</div>
                      </div>
                    </Button>
                    
                    <Button
                      type="button"
                      variant={signupData.accountType === 'merchant' ? 'default' : 'outline'}
                      onClick={() => setSignupData({ ...signupData, accountType: 'merchant' })}
                      className="justify-start h-auto py-3"
                    >
                      <Building className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Opérateur économique</div>
                        <div className="text-xs opacity-80">Je valorise mon savoir-faire gabonais</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Informations de base */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="pseudo">Pseudo *</Label>
                    <Input
                      id="pseudo"
                      value={signupData.pseudo || ''}
                      onChange={(e) => setSignupData({ ...signupData, pseudo: e.target.value })}
                      placeholder="Votre nom d'utilisateur"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={signupData.firstName || ''}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={signupData.lastName || ''}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        placeholder="Nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupEmail"
                        type="email"
                        value={signupData.email || ''}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupPassword"
                        type="password"
                        value={signupData.password || ''}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={signupData.phone || ''}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="pl-10"
                        placeholder="+241 XX XX XX XX"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations business (si opérateur) */}
                {signupData.accountType === 'merchant' && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Badge variant="secondary" className="w-fit">
                        Informations professionnelles
                      </Badge>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Nom de l'entreprise/boutique</Label>
                        <Input
                          id="businessName"
                          value={signupData.businessName || ''}
                          onChange={(e) => setSignupData({ ...signupData, businessName: e.target.value })}
                          placeholder="Mon Entreprise Gabonaise"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessCategory">Catégorie d'activité</Label>
                        <select
                          id="businessCategory"
                          className="w-full p-2 border rounded-md bg-background"
                          value={signupData.businessCategory || ''}
                          onChange={(e) => setSignupData({ ...signupData, businessCategory: e.target.value })}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          <option value="artisan">🔨 Artisan</option>
                          <option value="commerce">🛒 Commerce</option>
                          <option value="service">⚙️ Service</option>
                          <option value="restauration">🍽️ Restauration</option>
                          <option value="technologie">💻 Technologie</option>
                          <option value="transport">🚗 Transport</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer mon compte"}
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
                  S'inscrire avec Google
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-primary hover:underline text-sm"
                >
                  Déjà inscrit ? Se connecter
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};