export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_tracking: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          source_entity_id: string | null
          source_entity_type: string | null
          target_entity_id: string | null
          target_entity_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          target_entity_id?: string | null
          target_entity_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          target_entity_id?: string | null
          target_entity_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action_description: string
          action_type: string
          business_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          business_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          business_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          action_config: Json | null
          action_type: string
          business_id: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      booking_time_slots: {
        Row: {
          catalog_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_time_slots_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      business_collaborators: {
        Row: {
          accepted_at: string | null
          business_id: string
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          permissions: Json | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          business_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          permissions?: Json | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_collaborators_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          address: string | null
          arrondissement: string | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_name: string
          carousel_images: Json | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          cover_updated_at: string | null
          created_at: string
          deactivation_scheduled_at: string | null
          department: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_deactivated: boolean | null
          is_primary: boolean | null
          is_sleeping: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: unknown
          logo_updated_at: string | null
          logo_url: string | null
          longitude: number | null
          office_location: Json | null
          office_location_type: string | null
          office_location_updated_at: string | null
          owner_id: string | null
          phone: string | null
          province: string | null
          quartier: string | null
          slug: string | null
          social_media: Json | null
          status: string | null
          telegram: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          arrondissement?: string | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_name: string
          carousel_images?: Json | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          cover_updated_at?: string | null
          created_at?: string
          deactivation_scheduled_at?: string | null
          department?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_deactivated?: boolean | null
          is_primary?: boolean | null
          is_sleeping?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: unknown
          logo_updated_at?: string | null
          logo_url?: string | null
          longitude?: number | null
          office_location?: Json | null
          office_location_type?: string | null
          office_location_updated_at?: string | null
          owner_id?: string | null
          phone?: string | null
          province?: string | null
          quartier?: string | null
          slug?: string | null
          social_media?: Json | null
          status?: string | null
          telegram?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          arrondissement?: string | null
          business_category?: Database["public"]["Enums"]["business_category"]
          business_name?: string
          carousel_images?: Json | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          cover_updated_at?: string | null
          created_at?: string
          deactivation_scheduled_at?: string | null
          department?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_deactivated?: boolean | null
          is_primary?: boolean | null
          is_sleeping?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: unknown
          logo_updated_at?: string | null
          logo_url?: string | null
          longitude?: number | null
          office_location?: Json | null
          office_location_type?: string | null
          office_location_updated_at?: string | null
          owner_id?: string | null
          phone?: string | null
          province?: string | null
          quartier?: string | null
          slug?: string | null
          social_media?: Json | null
          status?: string | null
          telegram?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      catalog: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          is_bookable: boolean | null
          price: number | null
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_bookable?: boolean | null
          price?: number | null
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_bookable?: boolean | null
          price?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_booking_config: {
        Row: {
          advance_booking_days: number | null
          booking_duration_minutes: number | null
          cancellation_hours: number | null
          catalog_id: string
          created_at: string
          id: string
          max_bookings_per_slot: number | null
          updated_at: string
        }
        Insert: {
          advance_booking_days?: number | null
          booking_duration_minutes?: number | null
          cancellation_hours?: number | null
          catalog_id: string
          created_at?: string
          id?: string
          max_bookings_per_slot?: number | null
          updated_at?: string
        }
        Update: {
          advance_booking_days?: number | null
          booking_duration_minutes?: number | null
          cancellation_hours?: number | null
          catalog_id?: string
          created_at?: string
          id?: string
          max_bookings_per_slot?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_booking_config_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_bookings: {
        Row: {
          booking_date: string
          catalog_id: string
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["reservation_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          catalog_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          catalog_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_bookings_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_comments: {
        Row: {
          catalog_id: string
          content: string
          created_at: string
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          catalog_id: string
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          catalog_id?: string
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_comments_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_image_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          image_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_id?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_image_likes: {
        Row: {
          created_at: string
          id: string
          image_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_likes: {
        Row: {
          catalog_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_likes_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          business_id: string
          catalog_type: string | null
          category: string | null
          cover_url: string | null
          created_at: string
          delivery_available: boolean | null
          delivery_cost: number | null
          delivery_zones: string[] | null
          description: string | null
          display_order: number | null
          has_limited_quantity: boolean | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_public: boolean | null
          keywords: string[] | null
          max_price: number | null
          min_price: number | null
          name: string
          price_currency: string | null
          price_details: Json | null
          price_type: string | null
          quantity_available: number | null
          seo_score: number | null
          subcategory: string | null
          synonyms: string[] | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          business_id: string
          catalog_type?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_cost?: number | null
          delivery_zones?: string[] | null
          description?: string | null
          display_order?: number | null
          has_limited_quantity?: boolean | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          max_price?: number | null
          min_price?: number | null
          name: string
          price_currency?: string | null
          price_details?: Json | null
          price_type?: string | null
          quantity_available?: number | null
          seo_score?: number | null
          subcategory?: string | null
          synonyms?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          business_id?: string
          catalog_type?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_cost?: number | null
          delivery_zones?: string[] | null
          description?: string | null
          display_order?: number | null
          has_limited_quantity?: boolean | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          price_currency?: string | null
          price_details?: Json | null
          price_type?: string | null
          quantity_available?: number | null
          seo_score?: number | null
          subcategory?: string | null
          synonyms?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          title: string | null
          type: Database["public"]["Enums"]["conversation_type"] | null
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          title?: string | null
          type?: Database["public"]["Enums"]["conversation_type"] | null
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          title?: string | null
          type?: Database["public"]["Enums"]["conversation_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          business_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_requests: {
        Row: {
          conversation_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          purpose: string | null
          requested_by: string
          requester_id: string | null
          share_mode: string | null
          status: string | null
          target_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          purpose?: string | null
          requested_by: string
          requester_id?: string | null
          share_mode?: string | null
          status?: string | null
          target_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          purpose?: string | null
          requested_by?: string
          requester_id?: string | null
          share_mode?: string | null
          status?: string | null
          target_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      location_share_history: {
        Row: {
          accuracy: number | null
          id: string
          latitude: number | null
          location: unknown
          longitude: number | null
          request_id: string | null
          shared_at: string
          shared_with: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          request_id?: string | null
          shared_at?: string
          shared_with: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          request_id?: string | null
          shared_at?: string
          shared_with?: string
          user_id?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          business_id: string | null
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_actions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          business_id: string
          category: string | null
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          business_id: string
          category?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          business_id?: string
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
          type: Database["public"]["Enums"]["message_type"] | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
          type?: Database["public"]["Enums"]["message_type"] | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          type?: Database["public"]["Enums"]["message_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          created_at: string
          delivery_address: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_method: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          business_id: string
          catalog_id: string | null
          category: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_available: boolean | null
          is_on_sale: boolean | null
          name: string
          price: number
          sale_price: number | null
          sku: string | null
          stock_quantity: number | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          business_id: string
          catalog_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_on_sale?: boolean | null
          name: string
          price: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          business_id?: string
          catalog_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_on_sale?: boolean | null
          name?: string
          price?: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_image_likes: {
        Row: {
          created_at: string
          id: string
          image_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_updated_at: string | null
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          cover_updated_at: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_updated_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          cover_updated_at?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_updated_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          cover_updated_at?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number | null
          business_id: string
          created_at: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["quote_status"] | null
          title: string
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          title: string
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          business_id: string
          created_at: string
          id: string
          notes: string | null
          party_size: number | null
          reservation_date: string
          status: Database["public"]["Enums"]["reservation_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          notes?: string | null
          party_size?: number | null
          reservation_date: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          party_size?: number | null
          reservation_date?: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          reply_text: string | null
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reply_text?: string | null
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reply_text?: string | null
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["support_priority"] | null
          status: Database["public"]["Enums"]["support_status"] | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["support_priority"] | null
          status?: Database["public"]["Enums"]["support_status"] | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["support_priority"] | null
          status?: Database["public"]["Enums"]["support_status"] | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_current_mode: {
        Row: {
          created_at: string
          current_business_id: string | null
          current_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_business_id?: string | null
          current_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_business_id?: string | null
          current_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_current_mode_current_business_id_fkey"
            columns: ["current_business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          arrondissement: string | null
          country: string | null
          created_at: string
          department: string | null
          home_location: Json | null
          home_location_type: string | null
          id: string
          latitude: number | null
          location_updated_at: string | null
          longitude: number | null
          phone: string | null
          profile_picture_url: string | null
          province: string | null
          pseudo: string
          quartier: string | null
          role: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          address?: string | null
          arrondissement?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          home_location?: Json | null
          home_location_type?: string | null
          id?: string
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          province?: string | null
          pseudo: string
          quartier?: string | null
          role: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          address?: string | null
          arrondissement?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          home_location?: Json | null
          home_location_type?: string | null
          id?: string
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          province?: string | null
          pseudo?: string
          quartier?: string | null
          role?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      cancel_business_deletion: {
        Args: { p_business_id: string }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_businesses_in_bbox: {
        Args: {
          p_limit?: number
          p_max_lat: number
          p_max_lng: number
          p_min_lat: number
          p_min_lng: number
        }
        Returns: {
          address: string | null
          arrondissement: string | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_name: string
          carousel_images: Json | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          cover_updated_at: string | null
          created_at: string
          deactivation_scheduled_at: string | null
          department: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_deactivated: boolean | null
          is_primary: boolean | null
          is_sleeping: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: unknown
          logo_updated_at: string | null
          logo_url: string | null
          longitude: number | null
          office_location: Json | null
          office_location_type: string | null
          office_location_updated_at: string | null
          owner_id: string | null
          phone: string | null
          province: string | null
          quartier: string | null
          slug: string | null
          social_media: Json | null
          status: string | null
          telegram: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "business_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_conversations_for_user: {
        Args: { p_user_id?: string }
        Returns: {
          business_id: string
          business_name: string
          id: string
          last_message_at: string
          last_message_content: string
          other_participant_avatar: string
          other_participant_name: string
          title: string
          type: string
          unread_count: number
        }[]
      }
      get_my_business_profiles: {
        Args: never
        Returns: {
          business_name: string
          id: string
          is_owner: boolean
          is_primary: boolean
          logo_url: string
          role: string
        }[]
      }
      get_nearest_businesses: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
        }
        Returns: {
          address: string
          business_category: string
          business_name: string
          city: string
          cover_image_url: string
          description: string
          distance_km: number
          id: string
          latitude: number
          logo_url: string
          longitude: number
          phone: string
          quartier: string
          whatsapp: string
        }[]
      }
      get_or_create_business_conversation: {
        Args: { p_business_id: string; p_user_id: string }
        Returns: string
      }
      get_or_create_direct_conversation: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: string
      }
      get_user_context: { Args: { p_user_id: string }; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      log_user_activity: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_business_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      schedule_business_deletion: {
        Args: { p_business_id: string; p_days_until_deletion?: number }
        Returns: boolean
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      switch_user_profile: { Args: { profile_id?: string }; Returns: Json }
      toggle_business_sleep_mode: {
        Args: { p_business_id: string; p_is_sleeping: boolean }
        Returns: boolean
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      account_type: "individual" | "business"
      app_role: "admin" | "moderator" | "business_owner" | "user"
      business_category:
        | "agriculture"
        | "automotive"
        | "beauty"
        | "education"
        | "entertainment"
        | "finance"
        | "fitness"
        | "healthcare"
        | "manufacturing"
        | "other"
        | "real_estate"
        | "restaurant"
        | "retail"
        | "services"
        | "technology"
      contact_method:
        | "whatsapp"
        | "email"
        | "telegram"
        | "phone"
        | "sms"
        | "internal"
      conversation_type:
        | "direct"
        | "group"
        | "support"
        | "order"
        | "reservation"
        | "quote"
      message_status: "sent" | "delivered" | "read"
      message_type:
        | "text"
        | "audio"
        | "video"
        | "document"
        | "quote"
        | "order"
        | "reservation"
        | "system"
        | "action"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      quote_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "converted"
      reservation_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      support_priority: "low" | "medium" | "high" | "urgent"
      support_status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["individual", "business"],
      app_role: ["admin", "moderator", "business_owner", "user"],
      business_category: [
        "agriculture",
        "automotive",
        "beauty",
        "education",
        "entertainment",
        "finance",
        "fitness",
        "healthcare",
        "manufacturing",
        "other",
        "real_estate",
        "restaurant",
        "retail",
        "services",
        "technology",
      ],
      contact_method: [
        "whatsapp",
        "email",
        "telegram",
        "phone",
        "sms",
        "internal",
      ],
      conversation_type: [
        "direct",
        "group",
        "support",
        "order",
        "reservation",
        "quote",
      ],
      message_status: ["sent", "delivered", "read"],
      message_type: [
        "text",
        "audio",
        "video",
        "document",
        "quote",
        "order",
        "reservation",
        "system",
        "action",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      quote_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "converted",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      support_priority: ["low", "medium", "high", "urgent"],
      support_status: [
        "open",
        "in_progress",
        "waiting_customer",
        "resolved",
        "closed",
      ],
    },
  },
} as const
