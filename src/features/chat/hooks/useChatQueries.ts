import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as chatService from '../service';
import { useAuth } from '@/features/auth';
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
    staleTime: 60_000,
  });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: KEYS.messages(conversationId),
    queryFn: ({ pageParam = 0 }) => chatService.fetchMessages(conversationId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.length < 50 ? undefined : allPages.length,
    enabled: !!conversationId,
    staleTime: Infinity,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: Omit<CreateMessageDTO, 'conversation_id'>) =>
      chatService.sendMessage({ ...data, conversation_id: conversationId }),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: KEYS.messages(conversationId) });
      const prev = queryClient.getQueryData(KEYS.messages(conversationId));
      if (user) {
        const opt: Message = {
          id: `temp-${Date.now()}`, conversation_id: conversationId,
          sender_id: user.id, content: newMessage.content,
          message_type: 'text', status: 'sending', created_at: new Date().toISOString(),
          sender_profile: { id: user.id, display_name: user.user_metadata?.display_name || 'Moi', avatar_url: user.user_metadata?.avatar_url }
        };
        queryClient.setQueryData(KEYS.messages(conversationId), (old: any) => {
          if (!old) return { pages: [[opt]], pageParams: [0] };
          const pages = [...old.pages];
          pages[0] = [opt, ...(pages[0] || [])];
          return { ...old, pages };
        });
      }
      return { prev };
    },
    onError: (_err, _v, ctx) => {
      toast.error("Erreur lors de l'envoi");
      if (ctx?.prev) queryClient.setQueryData(KEYS.messages(conversationId), ctx.prev);
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
    mutationFn: (businessId: string) => chatService.getOrCreateBusinessConversation(businessId, user?.id || ''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.conversations(user?.id || '') }),
  });
}

export function useDirectConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (otherUserId: string) => {
      if (!user) throw new Error('Non authentifié');
      return chatService.getOrCreateDirectConversation(user.id, otherUserId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.conversations(user?.id || '') }),
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!user) return Promise.resolve();
      return chatService.markAsRead(conversationId, user.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.conversations(user?.id || '') }),
  });
}

export function useSearchUsers(query: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: () => chatService.searchUsers(query, user?.id || ''),
    enabled: !!query && query.length >= 2 && !!user,
    staleTime: 30_000,
  });
}

export function useSearchBusinesses(query: string) {
  return useQuery({
    queryKey: ['search-businesses', query],
    queryFn: () => chatService.searchBusinesses(query),
    enabled: !!query && query.length >= 2,
    staleTime: 30_000,
  });
}
