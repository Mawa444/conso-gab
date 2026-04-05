/**
 * Hooks React Query pour la messagerie
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import * as messagingService from '../services/messaging.service';
import { SendMessageDTO, Message, Conversation } from '../types';
import { toast } from 'sonner';

export const MESSAGING_KEYS = {
  conversations: (userId: string) => ['messaging', 'conversations', userId],
  messages: (conversationId: string) => ['messaging', 'messages', conversationId],
  conversation: (conversationId: string) => ['messaging', 'conversation', conversationId],
};

/**
 * Hook pour récupérer la liste des conversations
 */
export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: MESSAGING_KEYS.conversations(user?.id || ''),
    queryFn: () => messagingService.getConversations(user?.id || ''),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
  });
}

/**
 * Hook pour récupérer une conversation spécifique
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: MESSAGING_KEYS.conversation(conversationId),
    queryFn: () => messagingService.getConversationById(conversationId),
    enabled: !!conversationId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook pour récupérer les messages d'une conversation avec pagination infinie
 */
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: MESSAGING_KEYS.messages(conversationId),
    queryFn: ({ pageParam = 0 }) => messagingService.getMessages(conversationId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 50) return undefined;
      return allPages.length;
    },
    enabled: !!conversationId,
    staleTime: Infinity, // Le realtime va mettre à jour
  });
}

/**
 * Hook pour envoyer un message
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: Omit<SendMessageDTO, 'conversation_id'>) =>
      messagingService.sendMessage({ ...data, conversation_id: conversationId }),

    onMutate: async (newMessage) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: MESSAGING_KEYS.messages(conversationId) });

      // Sauvegarder l'état précédent
      const previousMessages = queryClient.getQueryData(MESSAGING_KEYS.messages(conversationId));

      // Mise à jour optimiste
      if (user) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.content,
          type: newMessage.type || 'text',
          status: 'sending',
          created_at: new Date().toISOString(),
          attachment_url: newMessage.attachment_url,
          sender_profile: {
            id: user.id,
            display_name: user.user_metadata?.display_name || 'Moi',
            avatar_url: user.user_metadata?.avatar_url
          }
        };

        queryClient.setQueryData(MESSAGING_KEYS.messages(conversationId), (old: any) => {
          if (!old) return { pages: [[optimisticMessage]], pageParams: [0] };

          const newPages = [...old.pages];
          if (newPages.length > 0) {
            newPages[0] = [optimisticMessage, ...newPages[0]];
          } else {
            newPages[0] = [optimisticMessage];
          }

          return { ...old, pages: newPages };
        });
      }

      return { previousMessages };
    },

    onError: (err, newMessage, context) => {
      toast.error("Erreur lors de l'envoi du message");
      if (context?.previousMessages) {
        queryClient.setQueryData(MESSAGING_KEYS.messages(conversationId), context.previousMessages);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.conversations(user?.id || '') });
    },
  });
}

/**
 * Hook pour démarrer une conversation avec un business
 */
export function useStartBusinessConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (businessId: string) => {
      if (!user) throw new Error('Non authentifié');
      return messagingService.getOrCreateBusinessConversation(businessId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.conversations(user?.id || '') });
    },
  });
}

/**
 * Hook pour démarrer une conversation directe
 */
export function useStartDirectConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('Non authentifié');
      return messagingService.getOrCreateDirectConversation(user.id, otherUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.conversations(user?.id || '') });
    },
  });
}

/**
 * Hook pour marquer une conversation comme lue
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;
      return messagingService.markConversationRead(conversationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_KEYS.conversations(user?.id || '') });
    },
  });
}
