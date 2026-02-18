import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KEYS } from './useChatQueries';
import { Message } from '../types';
import { useAuth } from '@/features/auth';

export function useChatRealtime(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;

          // If it's our own message, just replace temp message
          if (newMessage.sender_id === user?.id) {
            queryClient.setQueryData(KEYS.messages(conversationId), (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page: Message[]) =>
                  page.map((msg: Message) =>
                    msg.id.startsWith('temp-') && msg.content === newMessage.content
                      ? { ...msg, id: newMessage.id, status: 'sent' as const }
                      : msg
                  )
                )
              };
            });
            return;
          }

          // Fetch sender profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .single();

          const enrichedMessage: Message = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            sender_id: newMessage.sender_id,
            content: newMessage.content || '',
            message_type: newMessage.type || 'text',
            status: 'sent',
            created_at: newMessage.created_at,
            sender_profile: profileData ? {
              id: profileData.user_id,
              display_name: profileData.display_name || 'Utilisateur',
              avatar_url: profileData.avatar_url
            } : undefined
          };

          queryClient.setQueryData<any>(KEYS.messages(conversationId), (old: any) => {
            if (!old) return { pages: [[enrichedMessage]], pageParams: [0] };

            // Avoid duplicates
            const allMessages = old.pages.flat();
            if (allMessages.some((m: Message) => m.id === enrichedMessage.id)) {
              return old;
            }

            const newPages = [...old.pages];
            if (newPages.length > 0) {
              newPages[0] = [enrichedMessage, ...newPages[0]];
            } else {
              newPages[0] = [enrichedMessage];
            }

            return { ...old, pages: newPages };
          });

          // Refresh conversations list
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, user?.id]);
}
