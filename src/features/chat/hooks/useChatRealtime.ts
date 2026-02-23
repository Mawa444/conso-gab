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
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === user?.id) {
          queryClient.setQueryData(KEYS.messages(conversationId), (old: any) => {
            if (!old) return old;
            return { ...old, pages: old.pages.map((page: Message[]) =>
              page.map((m: Message) => m.id.startsWith('temp-') && m.content === msg.content
                ? { ...m, id: msg.id, status: 'sent' as const } : m))
            };
          });
          return;
        }
        const { data: profile } = await supabase.from('profiles').select('user_id, display_name, avatar_url').eq('user_id', msg.sender_id).single();
        const enriched: Message = {
          id: msg.id, conversation_id: msg.conversation_id, sender_id: msg.sender_id,
          content: msg.content || '', message_type: msg.type || 'text', status: 'sent',
          created_at: msg.created_at,
          sender_profile: profile ? { id: profile.user_id, display_name: profile.display_name || 'Utilisateur', avatar_url: profile.avatar_url } : undefined
        };
        queryClient.setQueryData<any>(KEYS.messages(conversationId), (old: any) => {
          if (!old) return { pages: [[enriched]], pageParams: [0] };
          const all = old.pages.flat();
          if (all.some((m: Message) => m.id === enriched.id)) return old;
          const pages = [...old.pages];
          pages[0] = [enriched, ...(pages[0] || [])];
          return { ...old, pages };
        });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient, user?.id]);
}
