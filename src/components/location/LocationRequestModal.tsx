import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  AlertCircle,
  Send,
  Shield
} from "lucide-react";
import { useLocationSecurity } from "@/hooks/use-location-security";
import { toast } from "sonner";

interface LocationRequestModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  conversationId: string;
  targetUserName?: string;
}

export const LocationRequestModal = ({ 
  open, 
  onClose, 
  targetUserId, 
  conversationId,
  targetUserName = "l'utilisateur"
}: LocationRequestModalProps) => {
  const [purpose, setPurpose] = useState<'delivery' | 'meeting' | 'visit' | 'general'>('general');
  const [shareMode, setShareMode] = useState<'one_time' | 'live'>('one_time');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { requestLocation } = useLocationSecurity();

  const purposeOptions = {
    delivery: { label: "Livraison", icon: "🚚", description: "Pour une livraison de produits" },
    meeting: { label: "Rencontre", icon: "🤝", description: "Pour se rencontrer en personne" },
    visit: { label: "Visite", icon: "🏠", description: "Pour visiter un lieu" },
    general: { label: "Général", icon: "📍", description: "Autre raison" }
  };

  const shareModeOptions = {
    one_time: { 
      label: "Partage unique", 
      description: "Position partagée une seule fois (30 min)",
      duration: "30 minutes"
    },
    live: { 
      label: "Suivi en direct", 
      description: "Position partagée en temps réel (2h max)",
      duration: "2 heures maximum"
    }
  };

  const handleSendRequest = async () => {
    if (!purpose) {
      toast.error("Veuillez sélectionner l'objet de votre demande");
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestLocation(targetUserId, conversationId, purpose, shareMode);
      if (result) {
        toast.success("Demande de position envoyée avec succès");
        onClose();
      }
    } catch (error) {
      console.error('Erreur envoi demande:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Demander la position de {targetUserName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avertissement de confidentialité */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-sm">
                <Shield className="w-4 h-4" />
                Confidentialité et sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-orange-700">
                Les positions sont chiffrées et ne sont jamais stockées de façon permanente. 
                L'utilisateur peut accepter ou refuser votre demande.
              </p>
            </CardContent>
          </Card>

          {/* Objet de la demande */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Objet de votre demande</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(purposeOptions).map(([key, option]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer border-2 transition-all hover:border-primary/50 ${
                    purpose === key ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                  onClick={() => setPurpose(key as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Type de partage */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Type de partage demandé</label>
            <div className="space-y-3">
              {Object.entries(shareModeOptions).map(([key, option]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer border-2 transition-all hover:border-primary/50 ${
                    shareMode === key ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                  onClick={() => setShareMode(key as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">{option.label}</div>
                          <Badge variant={key === 'one_time' ? 'secondary' : 'outline'}>
                            {option.duration}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                      {key === 'live' && (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Message personnalisé */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Message personnalisé (optionnel)</label>
            <Textarea
              placeholder="Expliquez pourquoi vous avez besoin de cette position..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Résumé de la demande */}
          {purpose && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Résumé de votre demande</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Objet:</span>
                  <Badge variant="outline">
                    {purposeOptions[purpose].icon} {purposeOptions[purpose].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Type:</span>
                  <Badge variant={shareMode === 'one_time' ? 'secondary' : 'outline'}>
                    {shareModeOptions[shareMode].label} - {shareModeOptions[shareMode].duration}
                  </Badge>
                </div>
                {message && (
                  <div className="text-sm">
                    <span className="font-medium">Message:</span>
                    <p className="text-muted-foreground mt-1">{message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSendRequest} 
              disabled={!purpose || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>Envoi...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};