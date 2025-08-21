import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  commerce?: {
    name: string;
    owner: string;
    phone?: string;
    address: string;
  };
}

export const MessageModal = ({ open, onClose, commerce }: MessageModalProps) => {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"commande" | "info" | "reservation">("commande");

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Simuler l'envoi du message
    console.log("Message envoyé:", { message, phone, orderType, commerce });
    
    // Réinitialiser et fermer
    setMessage("");
    setPhone("");
    onClose();
  };

  const quickMessages = [
    "Bonjour, j'aimerais passer une commande",
    "Êtes-vous ouvert actuellement ?",
    "Quels sont vos prix ?",
    "Pouvez-vous me rappeler ?"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Contacter {commerce?.name || "le commerce"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {commerce && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="font-medium">{commerce.name}</div>
              <div className="text-sm text-muted-foreground">
                Propriétaire: {commerce.owner}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {commerce.address}
              </div>
              {commerce.phone && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Phone className="w-3 h-3" />
                  {commerce.phone}
                </div>
              )}
            </div>
          )}

          {/* Type de message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de demande</label>
            <div className="flex gap-2">
              {[
                { id: "commande", label: "Commande" },
                { id: "info", label: "Information" },
                { id: "reservation", label: "Réservation" }
              ].map(type => (
                <Badge
                  key={type.id}
                  variant={orderType === type.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setOrderType(type.id as any)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Messages rapides */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Messages rapides</label>
            <div className="grid grid-cols-1 gap-1">
              {quickMessages.map((msg, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-left h-auto p-2 text-sm"
                  onClick={() => setMessage(msg)}
                >
                  {msg}
                </Button>
              ))}
            </div>
          </div>

          {/* Votre téléphone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Votre numéro (optionnel)</label>
            <Input
              placeholder="Ex: +241 01 23 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Votre message</label>
            <Textarea
              placeholder="Décrivez votre demande..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={!message.trim()} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};