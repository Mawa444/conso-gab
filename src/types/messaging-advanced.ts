// Types avancés pour le système de messagerie ConsoGab

export type ConversationType = 'direct' | 'group' | 'support' | 'order' | 'reservation' | 'quote';
export type MessageType = 'text' | 'audio' | 'video' | 'document' | 'quote' | 'order' | 'reservation' | 'system' | 'action';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

// Conversation avec métadonnées étendues
export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  conversation_type: ConversationType;
  subject?: string;
  participants: string[];
  metadata: any;
  tags: string[];
  priority: SupportPriority;
  status: string;
  assigned_agent_id?: string;
  is_archived: boolean;
  is_starred: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  business_profile?: {
    business_name: string;
    logo_url?: string;
    phone?: string;
    email?: string;
  };
  last_message?: Message;
  unread_count?: number;
}

// Message avec support multimédia et threading
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  thread_id?: string;
  reply_to_id?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_size?: number;
  metadata: any;
  reactions: any;
  read_by: any;
  status: MessageStatus;
  is_edited: boolean;
  is_deleted: boolean;
  scheduled_for?: string;
  created_at: string;
  edited_at?: string;

  // Données calculées côté client
  is_own_message?: boolean;
  sender_name?: string;
  sender_avatar?: string;
  thread_messages?: Message[];
}

// Devis intégré à la messagerie
export interface Quote {
  id: string;
  conversation_id: string;
  business_id: string;
  customer_id: string;
  quote_number: string;
  items: QuoteItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: QuoteStatus;
  valid_until?: string;
  terms_conditions?: string;
  notes?: string;
  discount_percentage: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  expired_at?: string;
}

export interface QuoteItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

// Réservation intégrée
export interface Reservation {
  id: string;
  conversation_id: string;
  business_id: string;
  customer_id: string;
  catalog_id?: string;
  reservation_number: string;
  service_name: string;
  start_datetime: string;
  end_datetime: string;
  duration_minutes?: number;
  guest_count: number;
  status: ReservationStatus;
  total_amount: number;
  deposit_amount: number;
  special_requests?: string;
  customer_notes?: string;
  business_notes?: string;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

// Ticket de support
export interface SupportTicket {
  id: string;
  conversation_id: string;
  business_id: string;
  customer_id: string;
  assigned_agent_id?: string;
  ticket_number: string;
  category: string;
  subcategory?: string;
  priority: SupportPriority;
  status: SupportStatus;
  subject: string;
  description?: string;
  resolution?: string;
  resolution_time_minutes?: number;
  first_response_time_minutes?: number;
  satisfaction_score?: number;
  satisfaction_feedback?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

// Template de message
export interface MessageTemplate {
  id: string;
  business_id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usage_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Workflow d'automatisation
export interface AutomationWorkflow {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_conditions: Record<string, any>;
  actions: WorkflowAction[];
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  type: 'send_message' | 'create_task' | 'update_status' | 'send_notification' | 'create_quote' | 'schedule_reminder';
  delay: number; // en secondes
  condition?: string;
  config: Record<string, any>;
}

// Filtres pour les conversations
export interface ConversationFilters {
  type?: ConversationType[];
  status?: string[];
  priority?: SupportPriority[];
  tags?: string[];
  date_from?: string;
  date_to?: string;
  search_query?: string;
  assigned_agent?: string;
  is_starred?: boolean;
  is_archived?: boolean;
}

// États du système de messagerie
export interface MessagingState {
  conversations: Conversation[];
  activeConversation?: Conversation;
  messages: Record<string, Message[]>; // conversation_id -> messages
  quotes: Record<string, Quote[]>; // conversation_id -> quotes
  reservations: Record<string, Reservation[]>; // conversation_id -> reservations
  supportTickets: Record<string, SupportTicket>; // conversation_id -> ticket
  templates: MessageTemplate[];
  workflows: AutomationWorkflow[];
  loading: boolean;
  error?: string;
}

// Actions quick pour les conversations
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action_type: 'quote' | 'reservation' | 'support' | 'order' | 'payment' | 'reminder';
  permissions?: string[];
  business_types?: string[];
}

// Notifications temps réel
export interface RealtimeNotification {
  type: 'new_message' | 'quote_updated' | 'reservation_confirmed' | 'support_assigned';
  conversation_id: string;
  data: Record<string, any>;
  timestamp: string;
}

// Données statistiques pour les analytics
export interface MessagingStats {
  total_conversations: number;
  active_conversations: number;
  response_time_avg: number; // en minutes
  satisfaction_score_avg: number;
  quotes_sent: number;
  quotes_accepted: number;
  reservations_confirmed: number;
  support_tickets_resolved: number;
}