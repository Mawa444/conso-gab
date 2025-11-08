import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

export const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'utilisateur vient bien d'un lien de réinitialisation
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Si on a une session avec un access_token, c'est que le lien est valide
      if (session && session.access_token) {
        setIsValidToken(true);
      } else {
        toast({
          title: "Lien invalide",
          description: "Ce lien de réinitialisation est invalide ou expiré",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    checkSession();
  }, [navigate, toast]);

  const validatePassword = (password: string): boolean => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLength && hasUpper && hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      toast({
        title: "Mot de passe trop faible",
        description: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié !",
        description: "Votre mot de passe a été mis à jour avec succès",
      });

      // Redirection vers la page d'accueil après 2 secondes
      setTimeout(() => navigate('/consumer/home'), 2000);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-accent/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Vérification...</CardTitle>
            <CardDescription>Validation du lien de réinitialisation</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Nouveau mot de passe</CardTitle>
          <CardDescription className="text-center">
            Choisissez un nouveau mot de passe sécurisé pour votre compte
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new-password">
                Nouveau mot de passe
                <span className="text-xs text-muted-foreground ml-2">
                  (8 caractères, majuscule, chiffre)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Votre nouveau mot de passe"
                  className="pr-10"
                  required
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
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent"
              disabled={loading}
            >
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground"
              >
                Retour à l'accueil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
