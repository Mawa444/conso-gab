import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onDeleteScheduled: () => void;
}

export const DeleteBusinessModal = ({ 
  isOpen, 
  onClose, 
  businessId, 
  businessName,
  onDeleteScheduled 
}: DeleteBusinessModalProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm">("warning");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Veuillez saisir votre mot de passe");
      return;
    }

    setIsLoading(true);
    try {
      // Vérifier le mot de passe en tentant une réauthentification
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: password
      });

      if (authError) {
        toast.error("Mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Programmer la suppression
      const { error } = await supabase.rpc('schedule_business_deletion', {
        business_profile_id: businessId
      });

      if (error) {
        toast.error("Erreur lors de la programmation de suppression");
        return;
      }

      // Logger l'activité
      await supabase.rpc('log_user_activity', {
        action_type_param: 'BUSINESS_DELETE_SCHEDULED',
        action_description_param: `Suppression de l'entreprise ${businessName} programmée pour dans 72h`,
        business_id_param: businessId,
        metadata_param: {
          business_name: businessName,
          scheduled_for: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        }
      });

      toast.success("Suppression programmée pour dans 72h", {
        description: "Vous pouvez annuler cette action jusqu'à l'expiration du délai."
      });
      
      onDeleteScheduled();
      onClose();
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep("warning");
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetModal();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md mx-auto">
        {step === "warning" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Supprimer l'entreprise
              </DialogTitle>
              <DialogDescription>
                Cette action est irréversible après 72h
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-red-800">Délai de grâce de 72h</h3>
                      <p className="text-sm text-red-700">
                        Votre entreprise sera désactivée immédiatement mais vous aurez 72 heures 
                        pour annuler cette suppression avant qu'elle ne devienne définitive.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">Conséquences immédiates :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Profil invisible sur l'application</li>
                  <li>• Catalogues et produits masqués</li>
                  <li>• Nouvelles commandes bloquées</li>
                  <li>• Notifications de suppression programmée</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Après 72h (suppression définitive) :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Toutes les données supprimées définitivement</li>
                  <li>• Impossible de récupérer catalogues et produits</li>
                  <li>• Historique des commandes effacé</li>
                  <li>• Aucune possibilité de restauration</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setStep("confirm")}
                  className="flex-1"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Saisissez votre mot de passe pour confirmer
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-amber-600 text-amber-800">
                      Entreprise : {businessName}
                    </Badge>
                  </div>
                  <p className="text-sm text-amber-800">
                    Cette entreprise sera supprimée définitivement dans 72h si vous ne l'annulez pas.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe du compte</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="border-red-200 focus:border-red-400"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Pour votre sécurité, confirmez votre identité avec votre mot de passe
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep("warning")} 
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button 
                  type="submit"
                  variant="destructive" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};