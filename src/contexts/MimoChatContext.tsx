import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Types
export interface MimoMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'document' | 'location' | 'system';
  created_at: string;
  read_at?: string;
  edited_at?: string;
  reply_to?: string;
  reactions?: string[];
  attachment_url?: string;
  sender_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface MimoConversation {
  id: string;
  title?: string;
  type: 'private' | 'group' | 'business';
  created_at: string;
  last_message?: MimoMessage;
  last_activity: string;
  unread_count: number;
  participants: {
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
    profile?: {
      display_name?: string;
      avatar_url?: string;
    };
  }[];
  business_context?: {
    business_id: string;
    business_name: string;
    category: string;
  };
}

interface MimoChatContextType {
  conversations: MimoConversation[];
  activeConversation: MimoConversation | null;
  messages: MimoMessage[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  setActiveConversation: (conversation: MimoConversation | null) => void;
  sendMessage: (content: string, type?: string) => Promise<void>;
  createConversation: (participants: string[], title?: string, type?: string) => Promise<MimoConversation>;
  markAsRead: (conversationId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  
  // Real-time
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: () => void;
}

const MimoChatContext = createContext<MimoChatContextType | undefined>(undefined);

export const useMimoChat = () => {
  const context = useContext(MimoChatContext);
  if (!context) {
    throw new Error('useMimoChat must be used within a MimoChatProvider');
  }
  return context;
};

interface MimoChatProviderProps {
  children: ReactNode;
}

export const MimoChatProvider: React.FC<MimoChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MimoConversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<MimoConversation | null>(null);
  const [messages, setMessages] = useState<MimoMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          type,
          created_at,
          last_activity,
          participants!inner(
            user_id,
            role,
            joined_at,
            profiles(display_name, avatar_url)
          ),
          messages(
            id,
            content,
            message_type,
            created_at,
            sender_id,
            profiles(display_name, avatar_url)
          )
        `)
        .eq('participants.user_id', user.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;

      // Transform and calculate unread counts
      const transformedConversations = data?.map(conv => ({
        ...conv,
        unread_count: 0, // TODO: Calculate from read receipts
        last_message: conv.messages?.[0] || null
      })) || [];

      setConversations(transformedConversations as MimoConversation[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          created_at,
          read_at,
          edited_at,
          reply_to,
          attachment_url,
          profiles(display_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages = data?.map(msg => ({
        ...msg,
        sender_profile: msg.profiles
      })) || [];

      setMessages(transformedMessages as MimoMessage[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (content: string, type: string = 'text') => {
    if (!user || !activeConversation) return;

    try {
      // Optimistic update
      const tempMessage: MimoMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content,
        message_type: type as any,
        created_at: new Date().toISOString(),
        sender_profile: {
          display_name: user.user_metadata?.display_name || 'Vous',
          avatar_url: user.user_metadata?.avatar_url
        }
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send to server
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: user.id,
          content,
          message_type: type
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? { ...data, sender_profile: tempMessage.sender_profile } : msg)
      );

      // Update conversation last_activity
      await supabase
        .from('conversations')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', activeConversation.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
      // Remove failed message
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    }
  };

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

  // Mark as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('participants')
        .update({ last_read_at: new Date().toISOString() })
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

  // Real-time subscriptions
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
        (payload) => {
          const newMessage = payload.new as MimoMessage;
          setMessages(prev => [...prev, newMessage]);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const unsubscribeFromConversation = () => {
    // Will be handled by the component cleanup
  };

  // Initialize
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
    markAsRead,
    fetchConversations,
    fetchMessages,
    subscribeToConversation,
    unsubscribeFromConversation
  };

  return (
    <MimoChatContext.Provider value={value}>
      {children}
    </MimoChatContext.Provider>
  );
};