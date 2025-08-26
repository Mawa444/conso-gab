import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Lock } from "lucide-react";
import gabomaLogo from "@/assets/gaboma-logo.png";

interface AnonymousLockPopupProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
  onContinueAnonymous: () => void;
}

export const AnonymousLockPopup = ({ 
  open, 
  onClose, 
  onCreateAccount, 
  onContinueAnonymous 
}: AnonymousLockPopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img src={gabomaLogo} alt="ConsoGab" className="w-12 h-12 rounded-lg" />
          </div>
          <DialogTitle className="text-center text-xl">
            Temps d'exploration écoulé
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p>Vos 13 minutes de navigation anonyme sont terminées.</p>
          </div>

          <Card className="bg-muted/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">Rejoignez la communauté</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Accès illimité à tous les opérateurs économiques</li>
                <li>• Favoris et recommandations personnalisées</li>
                <li>• Messagerie directe avec les commerces</li>
                <li>• Participation à l'économie gabonaise</li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={onCreateAccount} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Créer mon compte gratuitement
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onContinueAnonymous} 
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Continuer 13 min de plus
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            ConsoGab • L'économie gabonaise à portée de main
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};