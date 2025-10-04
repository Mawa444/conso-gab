import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface BusinessMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
  content: string;
  attachment_url?: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  content_json?: any;
  sender?: {
    id: string;
    pseudo?: string;
    profile_picture_url?: string;
  };
}

export interface BusinessConversation {
  id: string;
  origin_type: 'business';
  origin_id: string; // business_id
  title: string;
  conversation_type: string;
  last_activity: string;
  created_at: string;
  participants: Array<{
    user_id: string;
    role: 'consumer' | 'business';
  }>;
}

/**
 * Hook personnalisé pour gérer les conversations business isolées
 * Garantit qu'il n'y a qu'une seule conversation par paire (user, business)
 */
export const useBusinessConversation = (businessId: string) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<BusinessConversation | null>(null);
  const [messages, setMessages] = useState<BusinessMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère ou crée la conversation unique avec ce business
   */
  const fetchOrCreateConversation = useCallback(async () => {
    if (!user || !businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Chercher une conversation existante
      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          participants (
            user_id,
            role
          )
        `)
        .eq('origin_type', 'business')
        .eq('origin_id', businessId);

      if (fetchError) throw fetchError;

      // Filtrer pour trouver une conversation où l'utilisateur est participant
      const userConversation = existingConversations?.find(conv => 
        conv.participants?.some((p: any) => p.user_id === user.id)
      );

      if (userConversation) {
        console.log('✅ Conversation existante trouvée:', userConversation.id);
        setConversation(userConversation as BusinessConversation);
        return userConversation.id;
      }

      // 2. Si pas de conversation, en créer une
      console.log('📝 Création d\'une nouvelle conversation avec le business', businessId);
      
      // Récupérer les infos du business pour le titre
      const { data: businessData } = await supabase
        .from('business_profiles')
        .select('business_name')
        .eq('id', businessId)
        .single();

      // Récupérer l'owner du business pour savoir qui ajouter comme participant
      const { data: businessOwner } = await supabase
        .from('business_profiles')
        .select('user_id')
        .eq('id', businessId)
        .single();

      if (!businessOwner) {
        throw new Error('Business owner introuvable');
      }

      // Appeler l'edge function pour créer la conversation
      const { data: createData, error: createError } = await supabase.functions.invoke('create-conversation', {
        body: {
          origin_type: 'business',
          origin_id: businessId,
          title: businessData?.business_name || 'Conversation Business',
          participants: [
            { user_id: user.id, role: 'consumer' },
            { user_id: businessOwner.user_id, role: 'business' }
          ]
        }
      });

      if (createError) throw createError;

      console.log('✅ Conversation créée avec succès:', createData.conversation.id);
      setConversation(createData.conversation);
      return createData.conversation.id;

    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération/création de la conversation:', err);
      setError(err.message || 'Erreur de connexion');
      toast.error('Impossible de charger la conversation');
    } finally {
      setIsLoading(false);
    }
  }, [user, businessId]);

  /**
   * Récupère les messages de la conversation
   */
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            user_profiles!inner (
              pseudo,
              profile_picture_url
            )
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50); // Pagination : 50 derniers messages

      if (error) throw error;

      // Transformer les données pour le format attendu
      const transformedMessages: BusinessMessage[] = data?.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        message_type: msg.message_type,
        content: msg.content || '',
        attachment_url: msg.attachment_url,
        status: msg.status,
        created_at: msg.created_at,
        content_json: msg.content_json,
        sender: {
          id: msg.sender_id,
          pseudo: msg.sender?.user_profiles?.pseudo,
          profile_picture_url: msg.sender?.user_profiles?.profile_picture_url
        }
      })) || [];

      setMessages(transformedMessages);
    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération des messages:', err);
      toast.error('Impossible de charger les messages');
    }
  }, []);

  /**
   * Envoie un message
   */
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' = 'text',
    attachmentUrl?: string
  ) => {
    if (!conversation || !user) {
      toast.error('Conversation non initialisée');
      return;
    }

    if (!content.trim() && messageType === 'text') {
      return; // Ne pas envoyer de message vide
    }

    try {
      setIsSending(true);

      // Appeler l'edge function pour envoyer le message
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
          conversation_id: conversation.id,
          message_type: messageType,
          content: content,
          attachment_url: attachmentUrl || ''
        }
      });

      if (error) {
        console.error('❌ Erreur edge function:', error);
        throw error;
      }

      console.log('✅ Message envoyé avec succès:', data);
      
      // Ajouter le message optimistiquement (il sera dédupliqué par le real-time)
      const optimisticMessage: BusinessMessage = {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        sender_id: user.id,
        message_type: messageType,
        content: content,
        attachment_url: attachmentUrl,
        status: 'sent',
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          pseudo: undefined,
          profile_picture_url: undefined
        }
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

    } catch (err: any) {
      console.error('❌ Erreur lors de l\'envoi du message:', err);
      toast.error('Impossible d\'envoyer le message');
    } finally {
      setIsSending(false);
    }
  }, [conversation, user]);

  /**
   * Marquer les messages comme lus
   */
  const markAsRead = useCallback(async () => {
    if (!conversation || !user) return;

    try {
      await supabase
        .from('participants')
        .update({ last_read: new Date().toISOString() })
        .eq('conversation_id', conversation.id)
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Erreur marquage lu:', err);
    }
  }, [conversation, user]);

  /**
   * Setup du real-time
   */
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`business-chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        async (payload) => {
          console.log('📨 Nouveau message reçu:', payload.new);
          
          // Récupérer les infos du sender
          const { data: senderData } = await supabase
            .from('user_profiles')
            .select('pseudo, profile_picture_url')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage: BusinessMessage = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            message_type: payload.new.message_type,
            content: payload.new.content || '',
            attachment_url: payload.new.attachment_url,
            status: payload.new.status,
            created_at: payload.new.created_at,
            sender: {
              id: payload.new.sender_id,
              pseudo: senderData?.pseudo,
              profile_picture_url: senderData?.profile_picture_url
            }
          };

          setMessages(prev => {
            // Éviter les doublons
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Marquer comme lu si l'utilisateur est actif
          if (payload.new.sender_id !== user.id) {
            markAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, markAsRead]);

  /**
   * Initialisation
   */
  useEffect(() => {
    const init = async () => {
      const convId = await fetchOrCreateConversation();
      if (convId) {
        await fetchMessages(convId);
      }
    };

    init();
  }, [fetchOrCreateConversation, fetchMessages]);

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    markAsRead
  };
};
