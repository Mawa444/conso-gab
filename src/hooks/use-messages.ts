import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Message, Attachment } from './use-conversations';

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as Message['message_type'],
        status: msg.status as Message['status'],
        attachments: msg.attachments?.map((att: any) => ({
          ...att,
          file_type: att.file_type as Attachment['file_type']
        })) || []
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTextMessage = async (content: string, replyToId?: string) => {
    if (!content.trim() || !user) return;

    setSending(true);
    try {
      // Créer le message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
          reply_to_message_id: replyToId,
          status: 'sent'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Mettre à jour la dernière activité de la conversation
      await supabase
        .from('conversations')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', conversationId);

      // Ajouter le message localement
      const typedMessage: Message = {
        ...message,
        message_type: 'text',
        status: 'sent',
        attachments: []
      };
      setMessages(prev => [...prev, typedMessage]);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const sendMediaMessage = async (
    file: File, 
    messageType: 'image' | 'audio' | 'video' | 'document',
    caption?: string
  ) => {
    if (!user) return;

    setSending(true);
    try {
      // Upload du fichier vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const bucket = messageType === 'image' ? 'catalog-images' : 'product-images';
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(`messages/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      // Créer le message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: caption || '',
          message_type: messageType,
          attachment_url: urlData.publicUrl,
          status: 'sent'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Créer l'attachement
      const attachmentData = {
        message_id: message.id,
        url: urlData.publicUrl,
        file_type: messageType,
        file_size: file.size,
        file_name: file.name,
        mime_type: file.type
      };

      // Pour les images, ajouter dimensions
      if (messageType === 'image') {
        const img = new Image();
        img.onload = async () => {
          await supabase
            .from('attachments')
            .insert({
              ...attachmentData,
              width: img.width,
              height: img.height
            });
        };
        img.src = urlData.publicUrl;
      } else {
        await supabase
          .from('attachments')
          .insert(attachmentData);
      }

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', conversationId);

      // Ajouter le message localement
      const typedMessage: Message = {
        ...message,
        message_type: messageType,
        status: 'sent',
        attachments: [{
          ...attachmentData,
          id: crypto.randomUUID(),
          file_type: messageType
        }]
      };
      setMessages(prev => [...prev, typedMessage]);
      
      return message;
    } catch (error) {
      console.error('Error sending media message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le fichier",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({
          content: 'Message supprimé',
          message_type: 'system'
        })
        .eq('id', messageId);

      // Mettre à jour localement
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: 'Message supprimé', message_type: 'system' }
          : msg
      ));
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive"
      });
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      await supabase
        .from('messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      // Mettre à jour localement
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, edited_at: new Date().toISOString() }
          : msg
      ));
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le message",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    sending,
    fetchMessages,
    sendTextMessage,
    sendMediaMessage,
    deleteMessage,
    editMessage
  };
};