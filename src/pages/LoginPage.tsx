import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginPage = ({ onBack, onSuccess, onForgotPassword }: LoginPageProps) => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    identifier: '', // pseudo ou email
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier || !formData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    
    try {
      // Détecter si c'est un email ou un pseudo
      const isEmail = formData.identifier.includes('@');
      const email = isEmail ? formData.identifier : `${formData.identifier}@gaboma.app`;

      const { error } = await signIn(email, formData.password);

      if (error) {
        throw error;
      }

      toast.success("Connexion réussie!");
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'microsoft' | 'apple' | 'whatsapp') => {
    if (provider === 'whatsapp') {
      toast.info("Connexion WhatsApp disponible bientôt 🇬🇦");
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as 'google' | 'facebook' | 'azure',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Redirection en cours... 🇬🇦");
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast.error(`Erreur ${provider}: ${error.message}`);
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
            Connexion
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Retrouvez votre communauté gabonaise 🇬🇦
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="p-8 border-2 border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-br from-background to-primary/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifiant */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Pseudo ou Email</Label>
              <Input
                id="identifier"
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                placeholder="MonPseudo ou mon.email@exemple.com"
                autoComplete="username"
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pr-10"
                  autoComplete="current-password"
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
            </div>

            {/* Mot de passe oublié */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onForgotPassword}
                className="text-primary hover:text-primary/80"
              >
                Mot de passe oublié ?
              </Button>
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>

            {/* Message patriotique d'encouragement */}
            <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground">
                🇬🇦 Rejoignez la révolution économique gabonaise !
              </p>
            </div>

            {/* Connexions OAuth */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary/5 border-primary/20 transition-all duration-300 hover:shadow-md"
                onClick={() => handleOAuthLogin('google')}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connexion rapide avec Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-secondary/5 border-secondary/20 transition-all duration-300 hover:shadow-md"
                onClick={() => handleOAuthLogin('microsoft')}
              >
                <svg className="mr-2 h-4 w-4" fill="#00A4EF" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Continuer avec Microsoft
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-accent/5 border-accent/20 transition-all duration-300 hover:shadow-md"
                onClick={() => handleOAuthLogin('apple')}
              >
                <svg className="mr-2 h-4 w-4" fill="#000" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuer avec Apple
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-green-50 border-green-200 transition-all duration-300 hover:shadow-md"
                onClick={() => handleOAuthLogin('whatsapp')}
              >
                <svg className="mr-2 h-4 w-4" fill="#25D366" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.486z"/>
                </svg>
                Connexion via WhatsApp
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};