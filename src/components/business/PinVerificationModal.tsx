import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lock, Shield } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  action: string; // Description of the action requiring PIN
  severity?: "normal" | "high" | "critical";
}

export const PinVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerified, 
  action, 
  severity = "normal" 
}: PinVerificationModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxAttempts = 3;
  const blockDuration = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setAttempts(0);
      checkBlockStatus();
    }
  }, [isOpen]);

  const checkBlockStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('pin_blocked_until')
        .eq('user_id', user?.id)
        .single();

      if (profile?.pin_blocked_until) {
        const blockedUntil = new Date(profile.pin_blocked_until);
        if (blockedUntil > new Date()) {
          setIsBlocked(true);
          const remainingTime = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
          toast({
            title: "Accès bloqué",
            description: `Trop de tentatives incorrectes. Réessayez dans ${remainingTime} minutes.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const verifyPin = async () => {
    if (!pin || pin.length !== 4) {
      toast({
        title: "PIN invalide",
        description: "Le PIN doit contenir 4 chiffres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-pin', {
        body: { pin }
      });

      if (error) throw error;

      if (data.valid) {
        toast({
          title: "PIN vérifié",
          description: "Authentification réussie",
        });
        onVerified();
        onClose();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
          // Block user
          const blockedUntil = new Date(Date.now() + blockDuration);
          await supabase
            .from('profiles')
            .update({ pin_blocked_until: blockedUntil.toISOString() })
            .eq('user_id', user?.id);

          setIsBlocked(true);
          toast({
            title: "Accès bloqué",
            description: "Trop de tentatives incorrectes. Accès bloqué pour 15 minutes.",
            variant: "destructive"
          });
          onClose();
        } else {
          toast({
            title: "PIN incorrect",
            description: `Il vous reste ${maxAttempts - newAttempts} tentatives`,
            variant: "destructive"
          });
        }
        setPin("");
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le PIN",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPin();
    }
  };

  const getSeverityConfig = () => {
    switch (severity) {
      case "critical":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
          badge: <Badge variant="destructive">Action critique</Badge>,
          description: "Cette action nécessite une authentification renforcée"
        };
      case "high":
        return {
          icon: <Shield className="w-6 h-6 text-warning" />,
          badge: <Badge variant="secondary">Action sensible</Badge>,
          description: "Veuillez confirmer votre identité"
        };
      default:
        return {
          icon: <Lock className="w-6 h-6 text-primary" />,
          badge: <Badge variant="outline">Authentification requise</Badge>,
          description: "Saisissez votre PIN pour continuer"
        };
    }
  };

  const config = getSeverityConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {config.icon}
            <DialogTitle>Authentification PIN</DialogTitle>
          </div>
          {config.badge}
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{config.description}</p>
            <p className="font-medium">{action}</p>
          </div>

          {!isBlocked ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code PIN</label>
                <Input
                  type="password"
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg tracking-widest"
                  maxLength={4}
                  autoFocus
                />
              </div>

              {attempts > 0 && (
                <div className="text-center">
                  <p className="text-sm text-destructive">
                    Tentatives restantes: {maxAttempts - attempts}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Annuler
                </Button>
                <Button 
                  onClick={verifyPin} 
                  disabled={pin.length !== 4 || loading}
                  className="flex-1"
                >
                  {loading ? "Vérification..." : "Vérifier"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-medium text-destructive">Accès temporairement bloqué</h3>
                <p className="text-sm text-muted-foreground">
                  Trop de tentatives incorrectes. Veuillez réessayer plus tard.
                </p>
              </div>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};