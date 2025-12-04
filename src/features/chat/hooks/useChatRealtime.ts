import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KEYS } from './useChatQueries';
import { Message } from '../types';
import { toast } from 'sonner';

export function useChatRealtime(conversationId: string) {
  const queryClient = useQueryClient();

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
          
          // Fetch profile for the new message sender to ensure UI is complete
          // In a real app we might already have it in cache or the payload might be enriched via edge function
          // For now, we'll just invalidate to be safe and simple, OR manually patch if we want instant speed.
          
          // Let's try to patch manually for instant feel
          const { data: profileData } = await supabase.rpc('get_unified_profile', { p_user_id: newMessage.sender_id });
          
          const enrichedMessage: Message = {
            ...newMessage,
            status: 'sent',
            sender_profile: profileData
          };

          queryClient.setQueryData<Message[]>(KEYS.messages(conversationId), (old) => {
            if (!old) return [enrichedMessage];
            // Avoid duplicates (if optimistic update worked)
            const exists = old.find(m => m.id === enrichedMessage.id || (m.id.startsWith('temp-') && m.content === enrichedMessage.content));
            if (exists) return old.map(m => m.id.startsWith('temp-') && m.content === enrichedMessage.content ? enrichedMessage : m);
            return [...old, enrichedMessage];
          });
          
          // Also invalidate conversations list to update last message/unread
          // We need userId for the key, but we can invalidate all 'conversations' queries
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          toast.error("Erreur de connexion au chat");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}
