export interface SenderProfile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  sender_profile?: SenderProfile;
}

export interface Participant {
  user_id: string;
  last_read_at?: string | null;
  joined_at: string;
  profile?: SenderProfile;
}

export interface BusinessContext {
  business_id: string;
  business_name: string;
  logo_url?: string | null;
  category?: string;
}

export interface Conversation {
  id: string;
  title?: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  unread_count: number;
  participants: Participant[];
  last_message?: Message;
  business_context?: BusinessContext;
}

export interface CreateMessageDTO {
  conversation_id: string;
  content: string;
  message_type?: string;
}
