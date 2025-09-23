import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation } from "@/types/messaging-advanced";
import { useAuth } from "@/components/auth/AuthProvider";

export const useMessaging = (conversationId: string) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConversation = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          *,
          business_profiles!business_id (
            business_name,
            logo_url,
            business_category,
            address,
            phone,
            whatsapp,
            email
          )
        `)
        .eq('id', conversationId)
        .single();

      if (conversationError) {
        throw conversationError;
      }

      if (conversationData) {
        const transformedConversation: Conversation = {
          id: conversationData.id,
          business_id: conversationData.business_id,
          customer_id: conversationData.customer_id,
          conversation_type: conversationData.conversation_type,
          subject: conversationData.subject,
          participants: conversationData.participants || [],
          metadata: conversationData.metadata || {},
          tags: conversationData.tags || [],
          priority: conversationData.priority,
          status: conversationData.status,
          assigned_agent_id: conversationData.assigned_agent_id,
          is_archived: conversationData.is_archived,
          is_starred: conversationData.is_starred,
          last_message_at: conversationData.last_message_at,
          created_at: conversationData.created_at,
          updated_at: conversationData.updated_at,
          business_profile: conversationData.business_profiles ? {
            business_name: conversationData.business_profiles.business_name,
            logo_url: conversationData.business_profiles.logo_url,
            phone: conversationData.business_profiles.phone,
            email: conversationData.business_profiles.email
          } : undefined
        };

        setConversation(transformedConversation);
      }
    } catch (err: any) {
      console.error('Error fetching conversation:', err);
      setError(err.message);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      const transformedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        thread_id: msg.thread_id,
        reply_to_id: msg.reply_to_id,
        attachment_url: msg.attachment_url,
        attachment_type: msg.attachment_type,
        attachment_size: msg.attachment_size,
        metadata: msg.metadata || {},
        reactions: msg.reactions || {},
        read_by: msg.read_by || {},
        status: msg.status,
        is_edited: msg.is_edited,
        is_deleted: msg.is_deleted,
        scheduled_for: msg.scheduled_for,
        created_at: msg.created_at,
        edited_at: msg.edited_at,
        is_own_message: msg.sender_id === user.id,
        sender_name: msg.sender_id === user.id ? "Vous" : "Client"
      }));

      setMessages(transformedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  };

  const sendMessage = useCallback(async (messageData: {
    content: string;
    message_type?: Message["message_type"];
    attachment_url?: string;
    reply_to_id?: string;
    thread_id?: string;
  }) => {
    if (!conversationId || !user || !messageData.content.trim()) return;

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          attachment_url: messageData.attachment_url,
          reply_to_id: messageData.reply_to_id,
          thread_id: messageData.thread_id,
          status: 'sent'
        });

      if (insertError) {
        throw insertError;
      }

      // Update conversation updated_at and last_message_at
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Refresh messages
      await fetchMessages();
    } catch (err: any) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [conversationId, user, fetchMessages]);

  const markAsRead = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      // Mark all messages in this conversation as read for the current user
      const readByUpdate = { [`${user.id}`]: new Date().toISOString() };
      
      await supabase
        .from('messages')
        .update({ read_by: readByUpdate })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId, user]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Get current message to update reactions
      const { data: messageData } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (messageData) {
        const currentReactions = messageData.reactions ? 
          (typeof messageData.reactions === 'object' && messageData.reactions !== null ? 
            { ...messageData.reactions as any, [`${user.id}`]: emoji } :
            { [`${user.id}`]: emoji }
          ) : { [`${user.id}`]: emoji };

        await supabase
          .from('messages')
          .update({ reactions: currentReactions })
          .eq('id', messageId);

        await fetchMessages();
      }
    } catch (err: any) {
      console.error('Error adding reaction:', err);
    }
  }, [user, fetchMessages]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchConversation(),
        fetchMessages()
      ]);
      
      setLoading(false);
    };

    loadData();
  }, [conversationId, user]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  return {
    conversation,
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    addReaction,
    refetch: () => {
      fetchConversation();
      fetchMessages();
    }
  };
};