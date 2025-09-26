import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Calendar, 
  MapPin, 
  CreditCard,
  Package,
  Clock
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  conversationId: string;
  onActionSent?: () => void;
}

export const QuickActions = ({ conversationId, onActionSent }: QuickActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleQuickAction = async (actionType: string, content: string) => {
    if (!user || loading) return;

    setLoading(actionType);
    try {
      // Send message via Edge Function
      const { error } = await supabase.functions.invoke('send-message', {
        body: {
          conversation_id: conversationId,
          message_type: 'action',
          content,
          action_payload: {
            action_type: actionType,
            status: 'pending',
            created_by: user.id
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Action envoyée",
        description: content
      });

      onActionSent?.();

    } catch (error) {
      console.error('Error sending quick action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'action",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleOrder = () => {
    handleQuickAction('order', 'Je souhaite passer une commande');
  };

  const handleReservation = () => {
    handleQuickAction('reservation', 'Je souhaite faire une réservation');
  };

  const handleLocationRequest = async () => {
    if (!user || loading) return;

    setLoading('location');
    try {
      // Get conversation participants to find target
      const { data: participants } = await supabase
        .from('participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id);

      if (!participants || participants.length === 0) {
        throw new Error('Aucun destinataire trouvé');
      }

      const targetId = participants[0].user_id;

      // Create location request via Edge Function
      const { error } = await supabase.functions.invoke('location-request', {
        body: {
          conversation_id: conversationId,
          target_id: targetId,
          share_mode: 'one_time',
          purpose: 'general'
        }
      });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Demande de partage de position envoyée"
      });

      onActionSent?.();

    } catch (error) {
      console.error('Error requesting location:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer la demande",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handlePayment = () => {
    handleQuickAction('payment', 'Je souhaite procéder au paiement');
  };

  const handleQuote = () => {
    handleQuickAction('quote', 'Je souhaite demander un devis');
  };

  const handleAppointment = () => {
    handleQuickAction('appointment', 'Je souhaite prendre rendez-vous');
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-muted/5 overflow-x-auto">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handleOrder}
        disabled={loading === 'order'}
      >
        <ShoppingCart className="w-4 h-4" />
        Commander
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handleReservation}
        disabled={loading === 'reservation'}
      >
        <Calendar className="w-4 h-4" />
        Réserver
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handleLocationRequest}
        disabled={loading === 'location'}
      >
        <MapPin className="w-4 h-4" />
        Position
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handlePayment}
        disabled={loading === 'payment'}
      >
        <CreditCard className="w-4 h-4" />
        Payer
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handleQuote}
        disabled={loading === 'quote'}
      >
        <Package className="w-4 h-4" />
        Devis
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 whitespace-nowrap"
        onClick={handleAppointment}
        disabled={loading === 'appointment'}
      >
        <Clock className="w-4 h-4" />
        RDV
      </Button>
    </div>
  );
};

export default QuickActions;