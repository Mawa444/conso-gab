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

  // Fetch conversations with unified identity system
  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch conversations with participants
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

      const conversationIds = data?.map(conv => conv.id) || [];

      // 2. Extract all unique participant user_ids
      const allParticipantIds = new Set<string>();
      data.forEach((conv: any) => {
        conv.participants?.forEach((p: any) => {
          allParticipantIds.add(p.user_id);
        });
      });

      // 3. Fetch user profiles
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, pseudo, profile_picture_url')
        .in('user_id', Array.from(allParticipantIds));

      const profilesMap = new Map(
        userProfiles?.map(p => [p.user_id, {
          display_name: p.pseudo,
          avatar_url: p.profile_picture_url
        }]) || []
      );

      // 4. Fetch business profiles for business conversations
      const businessOriginIds = data
        .filter((c: any) => c.origin_type === 'business' && c.origin_id)
        .map(c => c.origin_id);

      let businessProfilesMap = new Map();
      if (businessOriginIds.length > 0) {
        const { data: businessProfiles } = await supabase
          .from('business_profiles')
          .select('id, business_name, logo_url, whatsapp, phone, email, business_category')
          .in('id', businessOriginIds);

        businessProfilesMap = new Map(
          businessProfiles?.map(bp => [bp.id, bp]) || []
        );
      }

      // 5. Fetch last messages
      const { data: lastMessagesData } = await supabase
        .from('messages')
        .select('id, conversation_id, content, message_type, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Group messages by conversation (keep only the latest)
      const lastMessagesMap = new Map();
      lastMessagesData?.forEach((msg: any) => {
        if (!lastMessagesMap.has(msg.conversation_id)) {
          lastMessagesMap.set(msg.conversation_id, msg);
        }
      });

      const lastMessages = Array.from(lastMessagesMap.values());

      // 6. Dédupliquer les conversations business par origin_id + user
      const uniqueConversationsMap = new Map();
      data.forEach((conv: any) => {
        if (conv.origin_type === 'business' && conv.origin_id) {
          const key = `${conv.origin_id}-${user.id}`;
          // Garder seulement la plus récente
          if (!uniqueConversationsMap.has(key) || 
              new Date(conv.last_activity) > new Date(uniqueConversationsMap.get(key).last_activity)) {
            uniqueConversationsMap.set(key, conv);
          }
        } else {
          // Pour les conversations non-business, garder toutes
          uniqueConversationsMap.set(conv.id, conv);
        }
      });

      const deduplicatedConversations = Array.from(uniqueConversationsMap.values());

      // 7. Transform conversations with unified data
      const transformedConversations = await Promise.all(
        (deduplicatedConversations || []).map(async (conv: any) => {
          const lastMessage = lastMessagesMap.get(conv.id);
          const userParticipant = conv.participants.find((p: any) => p.user_id === user.id);
          
          // Enrich participants with unified profile data
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
          
          // Enrich business conversations with context
          let enrichedConv: any = { ...conv };
          if (conv.origin_type === 'business' && conv.origin_id) {
            const businessProfile = businessProfilesMap.get(conv.origin_id);
            if (businessProfile) {
              enrichedConv = {
                ...conv,
                title: businessProfile.business_name || conv.title || 'Business',
                avatar_url: businessProfile.logo_url,
                business_context: {
                  business_id: businessProfile.id,
                  business_name: businessProfile.business_name,
                  logo_url: businessProfile.logo_url,
                  whatsapp: businessProfile.whatsapp,
                  phone: businessProfile.phone,
                  email: businessProfile.email,
                  business_category: businessProfile.business_category
                }
              };
            }
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
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages with unified profiles
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
          attachment_url
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(start, end);

      if (error) throw error;

      // Fetch sender profiles using unified identity (Meta-style)
      const senderIds = [...new Set(data?.map((m: any) => m.sender_id) || [])];
      const { data: unifiedProfilesData } = await supabase
        .rpc('get_unified_profiles_batch', {
          p_user_ids: senderIds
        });
      
      const profilesMap = new Map();
      if (unifiedProfilesData) {
        Object.entries(unifiedProfilesData).forEach(([userId, profileData]: [string, any]) => {
          profilesMap.set(userId, {
            display_name: profileData.display_name,
            avatar_url: profileData.avatar_url
          });
        });
      }

      // Enrich messages with sender profiles
      const transformedMessages = (data || []).map((msg: any) => {
        const profile = profilesMap.get(msg.sender_id);
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'image' | 'audio' | 'document' | 'location' | 'system',
          sender_profile: profile
        };
      });

      // If page > 0, append to existing messages, otherwise replace
      if (page > 0) {
        setMessages(prev => [...prev, ...transformedMessages as MimoMessage[]]);
      } else {
        setMessages(transformedMessages as MimoMessage[]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
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
      console.error('Error sending message:', err);
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

  // Create business conversation - META-STYLE ATOMIC
  // Facebook principe: 1 user + 1 business = 1 thread unique, toujours le même
  const createBusinessConversation = async (businessId: string): Promise<MimoConversation | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setLoading(true);

      // Check if conversation already exists in local state
      const existingConversation = conversations.find(
        c => c.origin_type === 'business' && c.origin_id === businessId
      );

      if (existingConversation) {
        return existingConversation;
      }

      // Appel RPC atomique : trouve OU crée (Meta-style)
      const { data: conversationId, error: rpcError } = await supabase
        .rpc('get_or_create_business_conversation', {
          p_business_id: businessId,
          p_user_id: user.id
        });

      if (rpcError) throw rpcError;

      // Fetch complete conversation data
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          conversation_type,
          created_at,
          last_activity,
          origin_type,
          origin_id,
          participants(user_id, role, created_at)
        `)
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Fetch business context
      const { data: businessContext } = await supabase
        .rpc('get_conversation_context', { p_conversation_id: conversationId });

      // Fetch participant profiles
      const participantIds = convData.participants?.map((p: any) => p.user_id) || [];
      const { data: profilesData } = await supabase
        .rpc('get_unified_profiles_batch', { p_user_ids: participantIds });

      const profilesMap = new Map();
      if (profilesData) {
        Object.entries(profilesData).forEach(([userId, profileData]: [string, any]) => {
          profilesMap.set(userId, {
            display_name: profileData.display_name,
            avatar_url: profileData.avatar_url
          });
        });
      }

      const enrichedParticipants = (convData.participants || []).map((p: any) => ({
        ...p,
        joined_at: p.created_at,
        profile: profilesMap.get(p.user_id)
      }));

      const newConversation: MimoConversation = {
        id: convData.id,
        title: convData.title,
        type: convData.conversation_type as 'private' | 'group' | 'business',
        origin_type: convData.origin_type as 'business' | 'direct' | 'group',
        origin_id: convData.origin_id,
        created_at: convData.created_at,
        last_activity: convData.last_activity,
        unread_count: 0,
        participants: enrichedParticipants,
        business_context: businessContext ? {
          business_id: (businessContext as any).business_id,
          business_name: (businessContext as any).business_name,
          category: (businessContext as any).category,
          logo_url: (businessContext as any).logo_url,
          whatsapp: (businessContext as any).whatsapp,
          phone: (businessContext as any).phone,
          email: (businessContext as any).email
        } : undefined
      };

      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      
      return newConversation;
    } catch (error: any) {
      console.error('Erreur conversation business:', error);
      setError(error.message || 'Impossible de charger la conversation');
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
