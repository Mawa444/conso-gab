import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageItem, ConversationData } from "@/components/messaging/ConversationDetails";
import { useAuth } from "@/components/auth/AuthProvider";

export const useMessaging = (conversationId: string) => {
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
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
          business_profiles!conversations_business_id_fkey (
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
        const transformedConversation: ConversationData = {
          id: conversationData.id,
          business_name: conversationData.business_profiles?.business_name || "Entreprise",
          business_logo: conversationData.business_profiles?.logo_url,
          business_id: conversationData.business_id,
          customer_name: "Client",
          customer_avatar: undefined,
          customer_id: conversationData.customer_id,
          subject: conversationData.subject,
          created_at: conversationData.created_at,
          is_active: conversationData.is_active,
          business_info: {
            address: conversationData.business_profiles?.address,
            phone: conversationData.business_profiles?.phone,
            whatsapp: conversationData.business_profiles?.whatsapp,
            email: conversationData.business_profiles?.email,
            category: conversationData.business_profiles?.business_category
          },
          stats: {
            total_orders: 0, // This would come from a separate query
            total_spent: 0,
            conversations_count: 1
          }
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

      const transformedMessages: MessageItem[] = (messagesData || []).map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        sender_name: "Utilisateur",
        sender_avatar: undefined,
        content: msg.content,
        message_type: msg.message_type as MessageItem["message_type"] || "text",
        attachment_url: msg.attachment_url,
        created_at: msg.created_at,
        is_own_message: msg.sender_id === user.id,
        action_data: msg.message_type === "action" ? {
          type: "order_created", // This would be parsed from content or metadata
          data: {}
        } : undefined
      }));

      setMessages(transformedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  };

  const sendMessage = useCallback(async (messageData: {
    content: string;
    message_type: MessageItem["message_type"];
    attachment_url?: string;
  }) => {
    if (!conversationId || !user || !messageData.content.trim()) return;

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageData.content,
          message_type: messageData.message_type,
          attachment_url: messageData.attachment_url,
          status: 'sent'
        });

      if (insertError) {
        throw insertError;
      }

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Refresh messages
      await fetchMessages();
    } catch (err: any) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [conversationId, user]);

  const markAsRead = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      // Mark all messages in this conversation as read for the current user
      await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('status', 'sent');
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId, user]);

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    conversation,
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refetch: () => {
      fetchConversation();
      fetchMessages();
    }
  };
};