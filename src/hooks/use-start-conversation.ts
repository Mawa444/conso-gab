import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('StartConversation');

/**
 * Hook unifié pour démarrer une conversation depuis n'importe quel point d'entrée
 * Garantit qu'une seule conversation existe entre deux utilisateurs (style WhatsApp/Messenger)
 */
export const useStartConversation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Démarre ou reprend une conversation avec un utilisateur
   */
  const startDirectConversation = async (targetUserId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      logger.info('Starting direct conversation', { targetUserId });

      // Appel RPC pour obtenir ou créer la conversation unique
      const { data: conversationId, error } = await supabase.rpc(
        'get_or_create_direct_conversation',
        {
          p_user_id_1: user.id,
          p_user_id_2: targetUserId
        }
      );

      if (error) throw error;

      logger.info('Conversation created/retrieved', { conversationId });

      // Navigation directe vers la conversation
      navigate(`/messaging/${conversationId}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Impossible de démarrer la conversation');
    }
  };

  /**
   * Démarre ou reprend une conversation avec une entreprise
   */
  const startBusinessConversation = async (businessId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      logger.info('Starting business conversation', { businessId });

      // Appel RPC pour obtenir ou créer la conversation business unique
      const { data: conversationId, error } = await supabase.rpc(
        'get_or_create_business_conversation',
        {
          p_business_id: businessId,
          p_user_id: user.id
        }
      );

      if (error) throw error;

      logger.info('Business conversation created/retrieved', { conversationId });

      // Navigation directe vers la conversation
      navigate(`/messaging/${conversationId}`);
    } catch (error) {
      console.error('Error starting business conversation:', error);
      toast.error('Impossible de contacter cette entreprise');
    }
  };

  return {
    startDirectConversation,
    startBusinessConversation
  };
};
