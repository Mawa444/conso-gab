import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Moon, Sun, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SleepModeToggleProps {
  businessId: string;
  businessName: string;
  currentSleepState: boolean;
  onStateChange: (newState: boolean) => void;
}

export const SleepModeToggle = ({ 
  businessId, 
  businessName, 
  currentSleepState, 
  onStateChange 
}: SleepModeToggleProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingState, setPendingState] = useState<boolean>(false);

  const handleToggleRequest = (newState: boolean) => {
    setPendingState(newState);
    setShowConfirmDialog(true);
  };

  const confirmToggle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('toggle_business_sleep_mode', {
        business_profile_id: businessId,
        sleep_mode: pendingState
      });

      if (error) {
        toast.error("Erreur lors de la modification du mode sommeil");
        return;
      }

      // Logger l'activité
      await supabase.rpc('log_user_activity', {
        action_type_param: pendingState ? 'BUSINESS_SLEEP_ENABLED' : 'BUSINESS_SLEEP_DISABLED',
        action_description_param: `Mode sommeil ${pendingState ? 'activé' : 'désactivé'} pour ${businessName}`,
        business_id_param: businessId,
        metadata_param: {
          business_name: businessName,
          sleep_mode: pendingState,
          timestamp: new Date().toISOString()
        }
      });

      onStateChange(pendingState);
      toast.success(
        pendingState ? "Mode sommeil activé" : "Mode sommeil désactivé",
        {
          description: pendingState 
            ? "Votre entreprise est maintenant invisible sur l'application"
            : "Votre entreprise est maintenant visible sur l'application"
        }
      );
      
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={`border-2 ${currentSleepState ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentSleepState ? (
                <Moon className="w-5 h-5 text-orange-600" />
              ) : (
                <Sun className="w-5 h-5 text-green-600" />
              )}
              Mode Sommeil
            </div>
            <Badge 
              className={currentSleepState 
                ? "bg-orange-100 text-orange-800" 
                : "bg-green-100 text-green-800"
              }
            >
              {currentSleepState ? "Endormie" : "Active"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {currentSleepState ? "Entreprise en sommeil" : "Entreprise active"}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentSleepState 
                  ? "Invisible sur l'application et moteurs de recherche"
                  : "Visible et référencée normalement"
                }
              </p>
            </div>
            <Switch
              checked={currentSleepState}
              onCheckedChange={handleToggleRequest}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          <div className="bg-white/50 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              {currentSleepState ? (
                <EyeOff className="w-4 h-4 text-orange-600" />
              ) : (
                <Eye className="w-4 h-4 text-green-600" />
              )}
              État actuel
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {currentSleepState ? (
                <>
                  <li>• Profil masqué des résultats de recherche</li>
                  <li>• Catalogues et produits invisibles</li>
                  <li>• Nouvelles commandes suspendues</li>
                  <li>• Tableau de bord toujours accessible</li>
                </>
              ) : (
                <>
                  <li>• Profil visible dans les recherches</li>
                  <li>• Catalogues et produits affichés</li>
                  <li>• Commandes acceptées normalement</li>
                  <li>• Référencement actif</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingState ? (
                <Moon className="w-5 h-5 text-orange-600" />
              ) : (
                <Sun className="w-5 h-5 text-green-600" />
              )}
              {pendingState ? "Activer le mode sommeil" : "Désactiver le mode sommeil"}
            </DialogTitle>
            <DialogDescription>
              Cette action prend effet immédiatement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className={`border-2 ${pendingState ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-1 flex-shrink-0 ${pendingState ? 'text-orange-600' : 'text-green-600'}`} />
                  <div className="space-y-2">
                    <h3 className={`font-semibold ${pendingState ? 'text-orange-800' : 'text-green-800'}`}>
                      {pendingState ? "Mise en sommeil" : "Réveil de l'entreprise"}
                    </h3>
                    <p className={`text-sm ${pendingState ? 'text-orange-700' : 'text-green-700'}`}>
                      {pendingState 
                        ? "Votre entreprise deviendra immédiatement invisible sur ConsoGab. Vous pourrez la réactiver à tout moment."
                        : "Votre entreprise redeviendra visible et référencée sur ConsoGab."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium">
                {pendingState ? "Conséquences de la mise en sommeil :" : "Conséquences du réveil :"}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {pendingState ? (
                  <>
                    <li>• Profil masqué immédiatement</li>
                    <li>• Aucune nouvelle commande possible</li>
                    <li>• Invisible des moteurs de recherche internes</li>
                    <li>• Tableau de bord reste accessible</li>
                    <li>• Réactivation possible à tout moment</li>
                  </>
                ) : (
                  <>
                    <li>• Profil immédiatement visible</li>
                    <li>• Commandes à nouveau possibles</li>
                    <li>• Référencement réactivé</li>
                    <li>• Notifications clients restaurées</li>
                    <li>• Catalogues et produits affichés</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={confirmToggle}
                disabled={isLoading}
                className={`flex-1 ${pendingState ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLoading ? "Application..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};