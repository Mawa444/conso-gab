import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickMessageModalProps {
  open: boolean;
  onClose: () => void;
  business: {
    id: string;
    name: string;
  };
}

export const QuickMessageModal = ({ open, onClose, business }: QuickMessageModalProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSendQuick = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    try {
      // Créer ou récupérer la conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('origin_type', 'business')
        .eq('origin_id', business.id)
        .single();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            origin_type: 'business',
            origin_id: business.id,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;

        // Ajouter les participants
        await supabase.from('participants').insert([
          { conversation_id: conversationId, user_id: user.id, role: 'customer' }
        ]);
      }

      // Envoyer le message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message,
          message_type: 'text'
        });

      if (msgError) throw msgError;

      toast.success("Message envoyé !");
      setMessage("");
      onClose();
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleContinueInChat = () => {
    onClose();
    navigate(`/business/${business.id}`, { state: { openChat: true } });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Message rapide à {business.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Écrivez votre message ici..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendQuick}
              disabled={!message.trim() || sending}
              className="w-full gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? "Envoi..." : "Envoyer"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleContinueInChat}
              className="w-full gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Continuer dans Mimo Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
