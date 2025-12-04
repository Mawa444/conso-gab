import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as chatService from '../service';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreateMessageDTO, Message } from '../types';
import { toast } from 'sonner';

export const KEYS = {
  conversations: (userId: string) => ['conversations', userId],
  messages: (conversationId: string) => ['messages', conversationId],
};

export function useConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: KEYS.conversations(user?.id || ''),
    queryFn: () => chatService.fetchConversations(user?.id || ''),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: KEYS.messages(conversationId),
    queryFn: ({ pageParam = 0 }) => chatService.fetchMessages(conversationId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than limit (50), we reached the end
      if (lastPage.length < 50) return undefined;
      return allPages.length;
    },
    enabled: !!conversationId,
    staleTime: Infinity, // Realtime will update this
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: Omit<CreateMessageDTO, 'conversation_id'>) => 
      chatService.sendMessage({ ...data, conversation_id: conversationId }),
    
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: KEYS.messages(conversationId) });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(KEYS.messages(conversationId));

      // Optimistic update
      if (user) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.content,
          message_type: newMessage.message_type || 'text',
          status: 'sending',
          created_at: new Date().toISOString(),
          attachment_url: newMessage.attachment_url,
          sender_profile: {
            id: user.id,
            display_name: user.user_metadata?.display_name || 'Moi',
            avatar_url: user.user_metadata?.avatar_url
          }
        };

        // Update infinite query data
        queryClient.setQueryData(KEYS.messages(conversationId), (old: any) => {
          if (!old) return { pages: [[optimisticMessage]], pageParams: [0] };
          
          // Add to the first page (newest messages)
          const newPages = [...old.pages];
          if (newPages.length > 0) {
            newPages[0] = [optimisticMessage, ...newPages[0]];
          } else {
            newPages[0] = [optimisticMessage];
          }
          
          return {
            ...old,
            pages: newPages
          };
        });
      }

      return { previousMessages };
    },
    
    onError: (err, newTodo, context) => {
      toast.error("Erreur lors de l'envoi du message");
      queryClient.setQueryData(KEYS.messages(conversationId), context?.previousMessages);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: KEYS.conversations(user?.id || '') });
    },
  });
}

export function useBusinessConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (businessId: string) => {
      return chatService.getOrCreateBusinessConversation(businessId, user?.id || '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.conversations(user?.id || '') });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;
      return chatService.markAsRead(conversationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.conversations(user?.id || '') });
    },
  });
}
