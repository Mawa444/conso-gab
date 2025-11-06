import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { createDomainLogger } from '@/lib/logger';
import * as conversationService from '@/services/messaging/conversationService';
import * as messageService from '@/services/messaging/messageService';
import * as directConversationService from '@/services/messaging/directConversationService';
import type { RealtimeChannel } from '@supabase/supabase-js';

const logger = createDomainLogger('MessagingContext');

// Import types from centralized location
import type { MimoMessage, MimoConversation } from '@/types/chat.types';

interface MimoChatContextType {
  conversations: MimoConversation[];
  activeConversation: MimoConversation | null;
  messages: MimoMessage[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  setActiveConversation: (conversation: MimoConversation | null) => void;
  sendMessage: (content: string, type?: string, attachmentUrl?: string) => Promise<void>;
  createConversation: (participants: string[], title?: string, type?: string) => Promise<MimoConversation>;
  createBusinessConversation: (businessId: string) => Promise<MimoConversation | null>;
  createDirectConversation: (targetUserId: string) => Promise<MimoConversation | null>;
  markAsRead: (conversationId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  
  // Real-time
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: () => void;
}

const MessagingContext = createContext<MimoChatContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

// Keep old export for backward compatibility
export const useMimoChat = useMessaging;

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MimoConversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<MimoConversation | null>(null);
  const [messages, setMessages] = useState<MimoMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // ============================================
  // META-STYLE ARCHITECTURE: UNIFIED MESSAGING
  // ============================================

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await conversationService.fetchConversationsForUser(user.id);
      setConversations(data);
    } catch (err) {
      logger.error('Error fetching conversations', { error: err });
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (conversationId: string, page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const data = await messageService.fetchMessagesForConversation(conversationId, page);
      
      if (page > 0) {
        setMessages(prev => [...prev, ...data]);
      } else {
        setMessages(data);
      }
    } catch (err) {
      logger.error('Error fetching messages', { error: err });
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, type: string = 'text', attachmentUrl?: string) => {
    if (!user || !activeConversation) return;

    try {
      const tempMessage = messageService.createTempMessage(
        activeConversation.id,
        user.id,
        content,
        type as MimoMessage['message_type'],
        attachmentUrl,
        {
          display_name: user.user_metadata?.display_name || 'Vous',
          avatar_url: user.user_metadata?.avatar_url,
        }
      );

      setMessages(prev => [...prev, tempMessage]);

      const sentMessage = await messageService.sendMessageToConversation(
        activeConversation.id,
        user.id,
        content,
        type as MimoMessage['message_type'],
        attachmentUrl
      );

      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? sentMessage : msg)
      );

      await fetchConversations();
    } catch (err) {
      logger.error('Error sending message', { error: err });
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    }
  }, [user, activeConversation, fetchConversations]);

  // Create conversation
  const createConversation = async (
    participants: string[], 
    title?: string, 
    type: string = 'private'
  ): Promise<MimoConversation> => {
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase.functions.invoke('create-conversation', {
      body: {
        participants: [...participants, user.id].map(id => ({ user_id: id, role: 'member' })),
        title,
        type,
        origin_type: 'mimo_chat',
        origin_id: null
      }
    });

    if (error) throw error;

    const newConversation = data.conversation as MimoConversation;
    setConversations(prev => [newConversation, ...prev]);
    return newConversation;
  };

  const createBusinessConversation = useCallback(async (businessId: string): Promise<MimoConversation | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setLoading(true);

      // Vérifier dans le state local d'abord
      const existingConversation = conversations.find(
        c => c.origin_type === 'business' && c.origin_id === businessId
      );

      if (existingConversation) {
        logger.info('Business conversation already exists in state', { conversationId: existingConversation.id });
        return existingConversation;
      }

      // Créer/récupérer via RPC atomique (Meta-style)
      const conversationId = await conversationService.getOrCreateBusinessConversation(businessId, user.id);
      const newConversation = await conversationService.fetchConversationById(conversationId);
      
      // Ajouter au state seulement si pas déjà présente
      setConversations(prev => {
        const alreadyExists = prev.some(c => c.id === newConversation.id);
        if (alreadyExists) {
          return prev;
        }
        return [newConversation, ...prev];
      });
      
      return newConversation;
    } catch (error) {
      logger.error('Error creating business conversation', { error, businessId, userId: user.id });
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de la conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, conversations]);

  const createDirectConversation = useCallback(async (targetUserId: string): Promise<MimoConversation | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    if (user.id === targetUserId) {
      setError('Impossible de créer une conversation avec soi-même');
      return null;
    }

    try {
      setLoading(true);

      // Vérifier dans le state local d'abord
      const existingConversation = conversations.find(c => {
        const isDirectConv = c.origin_type === 'direct' || c.type === 'private';
        const hasTargetUser = c.participants?.some(p => p.user_id === targetUserId);
        const hasCurrentUser = c.participants?.some(p => p.user_id === user.id);
        return isDirectConv && hasTargetUser && hasCurrentUser && c.participants.length === 2;
      });

      if (existingConversation) {
        logger.info('Direct conversation already exists in state', { conversationId: existingConversation.id });
        return existingConversation;
      }

      // Créer/récupérer via RPC atomique (Meta-style)
      const conversationId = await directConversationService.getOrCreateDirectConversation(user.id, targetUserId);
      const newConversation = await conversationService.fetchConversationById(conversationId);
      
      // Ajouter au state seulement si pas déjà présente
      setConversations(prev => {
        const alreadyExists = prev.some(c => c.id === newConversation.id);
        if (alreadyExists) {
          return prev;
        }
        return [newConversation, ...prev];
      });
      
      return newConversation;
    } catch (error) {
      logger.error('Error creating direct conversation', { error, targetUserId, userId: user.id });
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de la conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, conversations]);

  // Mark as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('participants')
        .update({ last_read: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  // Set active conversation
  const setActiveConversation = (conversation: MimoConversation | null) => {
    setActiveConversationState(conversation);
    if (conversation) {
      fetchMessages(conversation.id);
      markAsRead(conversation.id);
    } else {
      setMessages([]);
    }
  };

  // Real-time subscriptions (Meta-style: instant sync)
  const subscribeToConversation = (conversationId: string) => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as MimoMessage;
          
          // Fetch unified profile for the new message (Meta-style)
          const { data: profileData } = await supabase
            .rpc('get_unified_profile', { p_user_id: newMessage.sender_id });
          
          const profile = profileData as any;
          const enrichedMessage = {
            ...newMessage,
            sender_profile: profile ? {
              display_name: profile.display_name,
              avatar_url: profile.avatar_url
            } : undefined
          };
          
          setMessages(prev => [...prev, enrichedMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Connexion perdue. Tentative de reconnexion...');
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError('Connexion expirée. Veuillez rafraîchir la page.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const unsubscribeFromConversation = () => {
    // Will be handled by the component cleanup
  };

  // Initialize (Meta-style: automatic sync on login)
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: MimoChatContextType = {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    isConnected,
    setActiveConversation,
    sendMessage,
    createConversation,
    createBusinessConversation,
    createDirectConversation,
    markAsRead,
    fetchConversations,
    fetchMessages,
    subscribeToConversation,
    unsubscribeFromConversation
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

// Keep old export for backward compatibility
export const MimoChatProvider = MessagingProvider;
