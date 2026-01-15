/**
 * Hook pour les mises à jour temps réel de la messagerie
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MESSAGING_KEYS } from './useMessaging';
import { Message } from '../types';
import { useAuth } from '@/features/auth';

export function useMessagingRealtime(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messaging:${conversationId}`)
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

          // Ignorer si c'est notre propre message (déjà ajouté via optimistic update)
          if (newMessage.sender_id === user?.id) {
            // Mais mettre à jour le statut de "sending" à "sent"
            queryClient.setQueryData(MESSAGING_KEYS.messages(conversationId), (old: any) => {
              if (!old) return old;
              
              return {
                ...old,
                pages: old.pages.map((page: Message[]) =>
                  page.map((msg: Message) =>
                    msg.id.startsWith('temp-') && msg.content === newMessage.content
                      ? { ...newMessage, type: newMessage.type || 'text', status: 'sent' }
                      : msg
                  )
                )
              };
            });
            return;
          }

          // Récupérer le profil de l'expéditeur
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .single();

          const enrichedMessage: Message = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            sender_id: newMessage.sender_id,
            content: newMessage.content || '',
            type: newMessage.type || 'text',
            status: 'sent',
            created_at: newMessage.created_at,
            sender_profile: profile ? {
              id: profile.user_id,
              display_name: profile.display_name || 'Utilisateur',
              avatar_url: profile.avatar_url
            } : undefined
          };

          // Ajouter le nouveau message à la liste
          queryClient.setQueryData(MESSAGING_KEYS.messages(conversationId), (old: any) => {
            if (!old) return { pages: [[enrichedMessage]], pageParams: [0] };

            // Éviter les doublons
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

          // Rafraîchir la liste des conversations
          queryClient.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, user?.id]);
}

/**
 * Hook pour écouter les nouvelles conversations
 */
export function useConversationsRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-conversations:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Rafraîchir la liste des conversations
          queryClient.invalidateQueries({ 
            queryKey: MESSAGING_KEYS.conversations(user.id) 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
