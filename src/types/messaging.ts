export type ConversationFilter = 
  | "all" 
  | "orders" 
  | "reservations" 
  | "payments" 
  | "appointments" 
  | "catalogs" 
  | "support" 
  | "unread" 
  | "archived"
  | "quotes"
  | "businesses";

export interface ConversationItem {
  id: string;
  business_id?: string;
  customer_id?: string;
  customer_name?: string;
  business_name?: string;
  business_logo?: string;
  customer_avatar?: string;
  business_avatar?: string;
  last_message: string;
  last_message_time: string;
  status: 'read' | 'unread' | 'archived';
  type?: 'order' | 'quote' | 'reservation' | 'support' | 'general';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  customer_type?: 'new' | 'regular' | 'vip';
  has_unread?: boolean;
  unread_count?: number;
  message_count?: number;
  order_amount?: number;
}