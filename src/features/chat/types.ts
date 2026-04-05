export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'document' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
export type ConversationType = 'private' | 'group' | 'business';
export type ParticipantRole = 'admin' | 'member' | 'business' | 'consumer';

export interface SenderProfile {
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
  message_type: MessageType;
  status: MessageStatus;
  created_at: string;
  updated_at?: string;
  
  // Attachments
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_size?: number;

  // Metadata
  reply_to_message_id?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds[]
  
  // Joined Data
  sender_profile?: SenderProfile;
}

export interface Participant {
  user_id: string;
  role: ParticipantRole;
  last_read_at?: string;
  joined_at: string;
  
  // Joined Data
  profile?: SenderProfile;
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
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  
  // Origin (Context)
  origin_type?: string;
  origin_id?: string;

  // Computed
  unread_count: number;
  
  // Joined Data
  participants: Participant[];
  last_message?: Message;
  business_context?: BusinessContext;
}

export interface CreateMessageDTO {
  conversation_id: string;
  content: string;
  message_type?: MessageType;
  attachment_url?: string;
  reply_to_message_id?: string;
}
