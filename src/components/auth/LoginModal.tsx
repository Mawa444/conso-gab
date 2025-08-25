import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";
import { SignupWizard } from "./SignupWizard";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showSignupWizard, setShowSignupWizard] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  if (!open) return null;

  if (showSignupWizard) {
    return (
      <SignupWizard
        onComplete={async (signupData) => {
          setLoading(true);
          try {
            const { data, error } = await signUp(email, password, {
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

            if (error) throw error;

            toast({
              title: "Inscription réussie ! 🎉",
              description: "Bienvenue dans la communauté ConsoGab !",
            });
            
            onClose();
          } catch (error: any) {
            toast({
              title: "Erreur",
              description: error.message,
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

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: "Connexion réussie !",
          description: "Bon retour parmi nous !",
        });
        onClose();
      } else {
        // Pour l'inscription, on ouvre le wizard
        if (!email || !password) {
          toast({
            title: "Erreur",
            description: "Veuillez remplir tous les champs",
            variant: "destructive",
          });
          return;
        }
        setShowSignupWizard(true);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isLogin ? "Connexion" : "Inscription"}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={loading}
            >
              {loading ? "Chargement..." : (isLogin ? "Se connecter" : "Commencer l'inscription")}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin 
                  ? "Pas encore de compte ? S'inscrire" 
                  : "Déjà un compte ? Se connecter"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};