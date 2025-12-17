/**
 * Helpers pour les requêtes Supabase vers des tables qui n'ont pas encore de types générés
 * Ces fonctions permettent de contourner temporairement les erreurs de types
 */

import { supabase } from "@/integrations/supabase/client";

// Type helper pour les requêtes non typées
export const getUntypedTable = (tableName: string) => {
  return (supabase as any).from(tableName);
};

// Interface générique pour les catalogues - SUPPRIMÉE (Utiliser Catalog de @/types/entities/catalog.types)

// Interface pour les activités
export interface ActivityLogEntry {
  id: string;
  business_id: string;
  user_id?: string;
  action_type: string;
  action_description: string;
  metadata?: any;
  created_at: string;
}

// Interface pour les réservations
export interface BookingData {
  id?: string;
  catalog_id: string;
  business_id: string;
  customer_id: string;
  booking_number: string;
  booking_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  special_requests?: string;
  created_at?: string;
}

// Interface pour les conversations
export interface ConversationData {
  id: string;
  type: string;
  origin_type?: string;
  origin_id?: string;
  title?: string;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

// Interface pour les messages
export interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: string;
  attachment_url?: string;
  attachment_type?: string;
  metadata?: any;
  is_read?: boolean;
  created_at: string;
}
