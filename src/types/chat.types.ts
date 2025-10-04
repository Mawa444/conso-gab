/**
 * Types unifiés pour le système de messagerie Consogab
 * Utilisés par Business Chat ET Mimo Chat
 */

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'document' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ConversationType = 'private' | 'group' | 'business';
export type OriginType = 'business' | 'direct' | 'group';

export interface SenderProfile {
  id?: string;
  display_name?: string;
  avatar_url?: string;
  pseudo?: string;
  profile_picture_url?: string;
}

export interface UnifiedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  attachment_url?: string;
  status?: MessageStatus;
  created_at: string;
  edited_at?: string;
  reply_to_message_id?: string;
  content_json?: any;
  reactions?: any;
  sender_profile?: SenderProfile;
}

export interface ConversationParticipant {
  id?: string;
  user_id: string;
  role: 'consumer' | 'business' | 'member' | 'admin';
  joined_at?: string;
  last_read?: string;
  is_active?: boolean;
  profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface BusinessContext {
  business_id: string;
  business_name: string;
  logo_url?: string;
  business_category?: string;
  category?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
}

export interface UnifiedConversation {
  id: string;
  origin_type: OriginType;
  origin_id?: string; // business_id si origin_type='business'
  title: string;
  avatar_url?: string;
  conversation_type: ConversationType;
  last_message?: UnifiedMessage;
  last_activity: string;
  unread_count?: number;
  created_at: string;
  participants: ConversationParticipant[];
  business_context?: BusinessContext;
}

export interface ChatViewMode {
  showHeader: boolean;
  showActions: boolean;
  compact: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}
