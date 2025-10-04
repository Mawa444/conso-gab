import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Types
export interface MimoMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'document' | 'location' | 'system' | 'file' | 'video';
  created_at: string;
  edited_at?: string;
  reply_to_message_id?: string;
  reactions?: any;
  attachment_url?: string;
  status?: 'sent' | 'delivered' | 'read';
  sender_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface MimoConversation {
  id: string;
  title?: string;
  type: 'private' | 'group' | 'business';
  origin_type?: 'business' | 'direct' | 'group';
  origin_id?: string;
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
    logo_url?: string;
    whatsapp?: string;
    phone?: string;
    email?: string;
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
  sendMessage: (content: string, type?: string, attachmentUrl?: string) => Promise<void>;
  createConversation: (participants: string[], title?: string, type?: string) => Promise<MimoConversation>;
  createBusinessConversation: (businessId: string) => Promise<MimoConversation | null>;
  markAsRead: (conversationId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  
  // Real-time
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: () => void;
}

const MessagingContext = createContext<MimoChatContextType | undefined>(undefined);

// New exports for MessagingContext
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

  // Fetch conversations - META-STYLE (unified identity)
  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch conversations with participants
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          conversation_type,
          created_at,
          last_activity,
          origin_type,
          origin_id,
          participants!inner(
            user_id,
            role,
            last_read,
            created_at
          )
        `)
        .eq('participants.user_id', user.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = data.map(conv => conv.id);

      // Extract all unique participant user_ids for unified profile fetch
      const allParticipantIds = Array.from(
        new Set(
          data.flatMap((conv: any) => 
            conv.participants?.map((p: any) => p.user_id) || []
          )
        )
      );

      // META-STYLE: Batch fetch unified profiles + business contexts + last messages
      const [profilesResult, lastMessagesResult] = await Promise.all([
        // Unified profiles batch fetch (like Facebook User Graph)
        supabase.rpc('get_unified_profiles_batch', { 
          p_user_ids: allParticipantIds 
        }),
        
        // Get last messages for each conversation
        supabase
          .from('messages')
          .select('id, conversation_id, content, message_type, created_at, sender_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
      ]);

      const profilesMap = new Map(
        Object.entries(profilesResult.data || {}).map(([userId, profile]: [string, any]) => [
          userId,
          {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            type: profile.type
          }
        ])
      );

      const lastMessages = lastMessagesResult.data || [];

      // Fetch business contexts for business conversations
      const businessConvIds = data
        .filter((c: any) => c.origin_type === 'business' && c.origin_id)
        .map((c: any) => c.id);
      
      const businessContextsMap = new Map();
      if (businessConvIds.length > 0) {
        const contextResults = await Promise.all(
          businessConvIds.map(async (convId: string) => {
            const { data: ctx } = await supabase.rpc('get_conversation_context', {
              p_conversation_id: convId
            });
            return [convId, ctx];
          })
        );
        contextResults.forEach(([convId, ctx]) => {
          if (ctx && Object.keys(ctx).length > 0) {
            businessContextsMap.set(convId, ctx);
          }
        });
      }

      // Transform conversations with unified data
      const transformedConversations = await Promise.all(
        data.map(async (conv: any) => {
          const lastMessage = lastMessages.find((msg: any) => msg.conversation_id === conv.id);
          const userParticipant = conv.participants.find((p: any) => p.user_id === user.id);
          
          // Enrich participants with unified profiles
          const enrichedParticipants = conv.participants.map((p: any) => {
            const profile = profilesMap.get(p.user_id);
            return {
              ...p,
              joined_at: p.created_at,
              profile: profile || undefined
            };
          });
          
          // Calculate unread count
          let unreadCount = 0;
          if (userParticipant?.last_read) {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .gt('created_at', userParticipant.last_read)
              .neq('sender_id', user.id);
            unreadCount = count || 0;
          }
          
          // Enrich with business context if applicable
          let enrichedConv: any = { ...conv };
          const businessContext = businessContextsMap.get(conv.id);
          if (businessContext) {
            enrichedConv = {
              ...conv,
              title: businessContext.business_name || conv.title || 'Business',
              avatar_url: businessContext.logo_url,
              business_context: businessContext
            };
          }
          
          return {
            ...enrichedConv,
            type: conv.conversation_type as 'private' | 'group' | 'business',
            unread_count: unreadCount,
            participants: enrichedParticipants,
            last_message: lastMessage ? {
              ...lastMessage,
              sender_profile: profilesMap.get(lastMessage.sender_id)
            } : null
          };
        })
      );

      setConversations(transformedConversations as MimoConversation[]);
    } catch (err) {
      console.error('Fetch conversations error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages - META-STYLE (unified identity)
  const fetchMessages = async (conversationId: string, page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const MESSAGES_PER_PAGE = 50;
      const start = page * MESSAGES_PER_PAGE;
      const end = start + MESSAGES_PER_PAGE - 1;

      // Fetch messages
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          created_at,
          edited_at,
          reply_to_message_id,
          attachment_url,
          status
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(start, end);

      if (error) throw error;

      // META-STYLE: Batch fetch unified profiles for all senders
      const senderIds = [...new Set(data?.map((m: any) => m.sender_id) || [])];
      const { data: profilesData } = await supabase.rpc('get_unified_profiles_batch', {
        p_user_ids: senderIds
      });
      
      const profilesMap = new Map(
        Object.entries(profilesData || {}).map(([userId, profile]: [string, any]) => [
          userId,
          {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            type: profile.type
          }
        ])
      );

      // Enrich messages with unified sender profiles
      const transformedMessages = (data || []).map((msg: any) => {
        const profile = profilesMap.get(msg.sender_id);
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'image' | 'audio' | 'document' | 'location' | 'system' | 'file' | 'video',
          status: (msg.status || 'sent') as 'sent' | 'delivered' | 'read',
          sender_profile: profile || undefined
        };
      });

      // If page > 0, append to existing messages, otherwise replace
      if (page > 0) {
        setMessages(prev => [...prev, ...transformedMessages as MimoMessage[]]);
      } else {
        setMessages(transformedMessages as MimoMessage[]);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (content: string, type: string = 'text', attachmentUrl?: string) => {
    if (!user || !activeConversation) return;

    try {
      // Optimistic update
      const tempMessage: MimoMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content,
        message_type: type as any,
        attachment_url: attachmentUrl,
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
          message_type: type,
          attachment_url: attachmentUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? { 
          ...data, 
          message_type: data.message_type as MimoMessage['message_type'],
          status: (data.status || 'sent') as 'sent' | 'delivered' | 'read',
          sender_profile: tempMessage.sender_profile 
        } : msg)
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

  // Create business conversation
  const createBusinessConversation = async (businessId: string): Promise<MimoConversation | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setLoading(true);

      // Check if conversation already exists
      const existingConversation = conversations.find(
        c => c.origin_type === 'business' && c.origin_id === businessId
      );

      if (existingConversation) {
        return existingConversation;
      }

      // Fetch business info
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('business_name, user_id, logo_url, whatsapp, phone, email, business_category')
        .eq('id', businessId)
        .single();

      if (businessError || !businessData) {
        throw new Error('Business introuvable');
      }

      // Create conversation via edge function
      const { data: createData, error: createError } = await supabase.functions.invoke('create-conversation', {
        body: {
          origin_type: 'business',
          origin_id: businessId,
          title: businessData.business_name || 'Conversation Business',
          conversation_type: 'business',
          participants: [
            { user_id: user.id, role: 'consumer' },
            { user_id: businessData.user_id, role: 'business' }
          ]
        }
      });

      if (createError) throw createError;

      const newConversation = {
        ...createData.conversation,
        type: 'business' as const,
        origin_type: 'business' as const,
        origin_id: businessId,
        unread_count: 0,
        business_context: {
          business_id: businessId,
          business_name: businessData.business_name,
          category: businessData.business_category,
          logo_url: businessData.logo_url,
          whatsapp: businessData.whatsapp,
          phone: businessData.phone,
          email: businessData.email
        }
      } as MimoConversation;

      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      
      return newConversation;
    } catch (error: any) {
      console.error('Erreur création conversation business:', error);
      setError(error.message || 'Impossible de créer la conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

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

  // Real-time subscriptions with error handling
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
          
          // META-STYLE: Fetch unified profile for the new message sender
          const { data: profileData } = await supabase.rpc('get_unified_profile', {
            p_user_id: newMessage.sender_id
          });
          
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
    createBusinessConversation,
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