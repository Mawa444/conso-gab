/**
 * Types centralisés pour le système de messagerie Signal-like
 */

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationType = 'direct' | 'business' | 'group';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  pseudo?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  created_at: string;
  updated_at?: string;
  attachment_url?: string;
  attachment_name?: string;
  reply_to_id?: string;
  sender_profile?: UserProfile;
}

export interface Participant {
  user_id: string;
  joined_at: string;
  last_read_at?: string;
  profile?: UserProfile;
}

export interface BusinessContext {
  business_id: string;
  business_name: string;
  logo_url?: string;
  category?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  type: ConversationType;
  business_id?: string;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  last_message?: Message;
  unread_count: number;
  business_context?: BusinessContext;
}

export interface SendMessageDTO {
  conversation_id: string;
  content: string;
  type?: MessageType;
  attachment_url?: string;
  reply_to_id?: string;
}
