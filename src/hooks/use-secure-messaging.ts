import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { messageContentSchema, sanitizeContent, messageRateLimiter } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";

export const useSecureMessaging = (conversationId: string) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const sendSecureMessage = useCallback(async (messageData: {
    content: string;
    message_type?: 'text' | 'quote' | 'order' | 'audio' | 'video' | 'document' | 'reservation' | 'system' | 'action';
    attachment_url?: string;
    reply_to_id?: string;
    thread_id?: string;
  }) => {
    if (!conversationId || !user) return;

    setLoading(true);

    try {
      // Rate limiting check
      if (!messageRateLimiter(user.id)) {
        toast({
          variant: "destructive",
          title: "Rate limit exceeded",
          description: "Please wait before sending another message",
        });
        return;
      }

      // Input validation
      const validation = messageContentSchema.safeParse(messageData);
      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Invalid message",
          description: validation.error.errors[0]?.message || "Invalid message content",
        });
        return;
      }

      // Content sanitization
      const sanitizedContent = sanitizeContent(messageData.content);
      
      if (sanitizedContent.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid content",
          description: "Message content cannot be empty after sanitization",
        });
        return;
      }

      // Log security event
      await supabase.rpc('log_user_activity', {
        action_type_param: 'MESSAGE_SENT',
        action_description_param: 'Secure message sent with content validation',
        metadata_param: {
          conversation_id: conversationId,
          message_type: messageData.message_type || 'text',
          content_length: sanitizedContent.length,
          has_attachment: !!messageData.attachment_url,
          timestamp: new Date().toISOString(),
        }
      });

      // Send the sanitized message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: sanitizedContent,
          message_type: messageData.message_type || 'text',
          attachment_url: messageData.attachment_url,
          reply_to_id: messageData.reply_to_id,
          thread_id: messageData.thread_id,
          status: 'sent'
        });

      if (insertError) {
        throw insertError;
      }

      // Update conversation metadata
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      toast({
        title: "Message sent",
        description: "Your message has been sent securely",
      });

    } catch (err: any) {
      console.error('Error sending secure message:', err);
      
      // Log security error
      await supabase.rpc('log_user_activity', {
        action_type_param: 'MESSAGE_ERROR',
        action_description_param: 'Failed to send secure message',
        metadata_param: {
          conversation_id: conversationId,
          error: err.message,
          timestamp: new Date().toISOString(),
        }
      });

      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again later",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  const reportSuspiciousContent = useCallback(async (messageId: string, reason: string) => {
    if (!user) return;

    try {
      await supabase.rpc('log_user_activity', {
        action_type_param: 'SECURITY_REPORT',
        action_description_param: 'Suspicious content reported',
        metadata_param: {
          message_id: messageId,
          conversation_id: conversationId,
          reason: reason,
          reporter_id: user.id,
          timestamp: new Date().toISOString(),
        }
      });

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our platform safe",
      });
    } catch (err: any) {
      console.error('Error reporting content:', err);
      toast({
        variant: "destructive",
        title: "Failed to submit report",
        description: "Please try again later",
      });
    }
  }, [conversationId, user]);

  return {
    sendSecureMessage,
    reportSuspiciousContent,
    loading,
  };
};