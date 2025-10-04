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
    PostgrestVersion: "13.0.4"
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          duration: number | null
          file_name: string | null
          file_size: number | null
          file_type: string
          height: number | null
          id: string
          message_id: string | null
          mime_type: string | null
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type: string
          height?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string
          height?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          url?: string
          width?: number | null
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
          actions: Json
          business_id: string | null
          created_at: string
          created_by: string
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_conditions: Json | null
          trigger_event: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          business_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_conditions?: Json | null
          trigger_event: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          business_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_conditions?: Json | null
          trigger_event?: string
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
          blocked_at: string | null
          blocked_id: string
          blocker_id: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_id: string
          blocker_id: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_id?: string
          blocker_id?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      booking_time_slots: {
        Row: {
          business_id: string
          catalog_id: string
          created_at: string
          current_bookings: number | null
          end_time: string
          id: string
          is_available: boolean | null
          max_capacity: number | null
          price: number | null
          slot_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          business_id: string
          catalog_id: string
          created_at?: string
          current_bookings?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          price?: number | null
          slot_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          catalog_id?: string
          created_at?: string
          current_bookings?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          price?: number | null
          slot_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      business_profiles: {
        Row: {
          address: string | null
          arrondissement: string | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_name: string
          city: string | null
          country: string | null
          cover_image_url: string | null
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
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
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
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
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
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          notification_types: Json
          subscriber_user_id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_types?: Json
          subscriber_user_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_types?: Json
          subscriber_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog: {
        Row: {
          business_id: string | null
          created_at: string | null
          description: string | null
          id: string
          seo_metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          seo_metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          seo_metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
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
          allow_online_payment: boolean
          available_days: string[] | null
          booking_enabled: boolean
          booking_hours: Json | null
          booking_slots_duration: number | null
          booking_type: string
          business_id: string
          cancellation_policy: string | null
          catalog_id: string
          created_at: string
          deposit_amount: number | null
          deposit_required: boolean | null
          id: string
          max_bookings_per_slot: number | null
          require_approval: boolean
          special_instructions: string | null
          updated_at: string
        }
        Insert: {
          advance_booking_days?: number | null
          allow_online_payment?: boolean
          available_days?: string[] | null
          booking_enabled?: boolean
          booking_hours?: Json | null
          booking_slots_duration?: number | null
          booking_type?: string
          business_id: string
          cancellation_policy?: string | null
          catalog_id: string
          created_at?: string
          deposit_amount?: number | null
          deposit_required?: boolean | null
          id?: string
          max_bookings_per_slot?: number | null
          require_approval?: boolean
          special_instructions?: string | null
          updated_at?: string
        }
        Update: {
          advance_booking_days?: number | null
          allow_online_payment?: boolean
          available_days?: string[] | null
          booking_enabled?: boolean
          booking_hours?: Json | null
          booking_slots_duration?: number | null
          booking_type?: string
          business_id?: string
          cancellation_policy?: string | null
          catalog_id?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_required?: boolean | null
          id?: string
          max_bookings_per_slot?: number | null
          require_approval?: boolean
          special_instructions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_bookings: {
        Row: {
          booking_date: string
          booking_number: string
          booking_time: string
          booking_type: string
          business_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          catalog_id: string
          confirmed_at: string | null
          created_at: string
          customer_email: string | null
          customer_id: string
          customer_name: string
          customer_phone: string | null
          deposit_paid: number | null
          end_time: string | null
          id: string
          notes: string | null
          payment_status: string | null
          special_requests: string | null
          status: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_number: string
          booking_time: string
          booking_type: string
          business_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          catalog_id: string
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          deposit_paid?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_number?: string
          booking_time?: string
          booking_type?: string
          business_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          catalog_id?: string
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          deposit_paid?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_comments: {
        Row: {
          catalog_id: string
          comment: string
          created_at: string | null
          id: string
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          catalog_id: string
          comment: string
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          catalog_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_comments_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_image_comments: {
        Row: {
          catalog_id: string
          comment: string
          created_at: string | null
          id: string
          image_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          catalog_id: string
          comment: string
          created_at?: string | null
          id?: string
          image_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          catalog_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          image_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_image_comments_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_image_likes: {
        Row: {
          catalog_id: string
          created_at: string | null
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          catalog_id: string
          created_at?: string | null
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          catalog_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_image_likes_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_likes: {
        Row: {
          catalog_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          catalog_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          catalog_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_likes_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          availability_zone: string | null
          base_price: number | null
          business_hours: Json | null
          business_id: string
          catalog_type: string | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          cover_blurhash: string | null
          cover_image_url: string | null
          cover_url: string | null
          created_at: string
          delivery_available: boolean | null
          delivery_cost: number | null
          delivery_zones: string[] | null
          description: string | null
          display_order: number | null
          folder: string | null
          geo_city: string | null
          geo_district: string | null
          has_limited_quantity: boolean | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_public: boolean | null
          keywords: string[] | null
          language: string | null
          name: string
          on_sale: boolean | null
          phonetics: string[] | null
          price_currency: string | null
          price_details: Json | null
          price_type: string | null
          sale_percentage: number | null
          seo_score: number | null
          subcategory: string | null
          synonyms: string[] | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          availability_zone?: string | null
          base_price?: number | null
          business_hours?: Json | null
          business_id: string
          catalog_type?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          cover_blurhash?: string | null
          cover_image_url?: string | null
          cover_url?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_cost?: number | null
          delivery_zones?: string[] | null
          description?: string | null
          display_order?: number | null
          folder?: string | null
          geo_city?: string | null
          geo_district?: string | null
          has_limited_quantity?: boolean | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          language?: string | null
          name: string
          on_sale?: boolean | null
          phonetics?: string[] | null
          price_currency?: string | null
          price_details?: Json | null
          price_type?: string | null
          sale_percentage?: number | null
          seo_score?: number | null
          subcategory?: string | null
          synonyms?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          availability_zone?: string | null
          base_price?: number | null
          business_hours?: Json | null
          business_id?: string
          catalog_type?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          cover_blurhash?: string | null
          cover_image_url?: string | null
          cover_url?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_cost?: number | null
          delivery_zones?: string[] | null
          description?: string | null
          display_order?: number | null
          folder?: string | null
          geo_city?: string | null
          geo_district?: string | null
          has_limited_quantity?: boolean | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_public?: boolean | null
          keywords?: string[] | null
          language?: string | null
          name?: string
          on_sale?: boolean | null
          phonetics?: string[] | null
          price_currency?: string | null
          price_details?: Json | null
          price_type?: string | null
          sale_percentage?: number | null
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
      conversation_members: {
        Row: {
          conversation_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_read_at: string | null
          notifications_enabled: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string | null
          created_at: string | null
          id: string
          last_activity: string | null
          metadata: Json | null
          origin_id: string | null
          origin_type: string | null
          title: string | null
          visibility: string | null
        }
        Insert: {
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          metadata?: Json | null
          origin_id?: string | null
          origin_type?: string | null
          title?: string | null
          visibility?: string | null
        }
        Update: {
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          metadata?: Json | null
          origin_id?: string | null
          origin_type?: string | null
          title?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
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
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      location_requests: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          purpose: string | null
          requester_id: string
          share_mode: string | null
          shared_at: string | null
          shared_location: Json | null
          status: string | null
          target_id: string
          updated_at: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          purpose?: string | null
          requester_id: string
          share_mode?: string | null
          shared_at?: string | null
          shared_location?: Json | null
          status?: string | null
          target_id: string
          updated_at?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          purpose?: string | null
          requester_id?: string
          share_mode?: string | null
          shared_at?: string | null
          shared_location?: Json | null
          status?: string | null
          target_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      location_share_history: {
        Row: {
          expires_at: string
          id: string
          location_data: Json
          purpose: string | null
          request_id: string | null
          share_mode: string
          shared_at: string | null
          shared_by: string
          shared_to: string
        }
        Insert: {
          expires_at: string
          id?: string
          location_data: Json
          purpose?: string | null
          request_id?: string | null
          share_mode: string
          shared_at?: string | null
          shared_by: string
          shared_to: string
        }
        Update: {
          expires_at?: string
          id?: string
          location_data?: Json
          purpose?: string | null
          request_id?: string | null
          share_mode?: string
          shared_at?: string | null
          shared_by?: string
          shared_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_share_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "location_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          format: string | null
          height: number | null
          id: string
          is_cover: boolean | null
          owner_id: string | null
          size_bytes: number | null
          storage_path: string
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          format?: string | null
          height?: number | null
          id?: string
          is_cover?: boolean | null
          owner_id?: string | null
          size_bytes?: number | null
          storage_path: string
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          format?: string | null
          height?: number | null
          id?: string
          is_cover?: boolean | null
          owner_id?: string | null
          size_bytes?: number | null
          storage_path?: string
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      message_actions: {
        Row: {
          action_type: string | null
          created_at: string | null
          id: string
          message_id: string | null
          payload: Json | null
          status: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          payload?: Json | null
          status?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          payload?: Json | null
          status?: string | null
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
          business_id: string | null
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          business_id?: string | null
          category: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          business_id?: string | null
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
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
          attachment_url: string | null
          content: string | null
          content_json: Json | null
          conversation_id: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          message_type: string | null
          reactions: Json | null
          reply_to_message_id: string | null
          sender_id: string | null
          status: string | null
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          content_json?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          reactions?: Json | null
          reply_to_message_id?: string | null
          sender_id?: string | null
          status?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          content_json?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          reactions?: Json | null
          reply_to_message_id?: string | null
          sender_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
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
          buyer_id: string | null
          created_at: string | null
          currency: string | null
          escrow_id: string | null
          id: string
          items: Json
          seller_id: string | null
          status: string | null
          total_cents: number | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          escrow_id?: string | null
          id?: string
          items: Json
          seller_id?: string | null
          status?: string | null
          total_cents?: number | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          escrow_id?: string | null
          id?: string
          items?: Json
          seller_id?: string | null
          status?: string | null
          total_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          last_read: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          last_read?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          last_read?: string | null
          role?: string | null
          user_id?: string | null
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
          amount_cents: number | null
          created_at: string | null
          id: string
          method: string | null
          order_id: string | null
          receipt_qr: string | null
          status: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          id?: string
          method?: string | null
          order_id?: string | null
          receipt_qr?: string | null
          status?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          id?: string
          method?: string | null
          order_id?: string | null
          receipt_qr?: string | null
          status?: string | null
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
          business_id: string | null
          catalog_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          price_cents: number | null
          stock: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          catalog_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          price_cents?: number | null
          stock?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          catalog_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          price_cents?: number | null
          stock?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          catalog_id: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_on_sale: boolean | null
          name: string
          price: number
          sale_price: number | null
          sku: string | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          business_id: string
          catalog_id: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_on_sale?: boolean | null
          name: string
          price: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          catalog_id?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_on_sale?: boolean | null
          name?: string
          price?: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string
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
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          cover_image_url: string | null
          created_at: string
          display_name: string | null
          email_verified: boolean | null
          first_name: string | null
          home_location: Json | null
          id: string
          last_name: string | null
          phone: string | null
          pin_attempts_count: number | null
          pin_blocked_until: string | null
          pin_enabled: boolean | null
          pin_hash: string | null
          pin_last_attempt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          home_location?: Json | null
          id?: string
          last_name?: string | null
          phone?: string | null
          pin_attempts_count?: number | null
          pin_blocked_until?: string | null
          pin_enabled?: boolean | null
          pin_hash?: string | null
          pin_last_attempt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          home_location?: Json | null
          id?: string
          last_name?: string | null
          phone?: string | null
          pin_attempts_count?: number | null
          pin_blocked_until?: string | null
          pin_enabled?: boolean | null
          pin_hash?: string | null
          pin_last_attempt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accepted_at: string | null
          business_id: string | null
          conversation_id: string | null
          created_at: string
          currency: string | null
          customer_id: string
          discount_amount: number | null
          discount_percentage: number | null
          expired_at: string | null
          id: string
          items: Json
          notes: string | null
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"] | null
          subtotal: number
          tax_amount: number | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          business_id?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string | null
          customer_id: string
          discount_amount?: number | null
          discount_percentage?: number | null
          expired_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          subtotal?: number
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          business_id?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          expired_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          subtotal?: number
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
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
          business_id: string | null
          business_notes: string | null
          cancelled_at: string | null
          catalog_id: string | null
          confirmation_sent: boolean | null
          confirmed_at: string | null
          conversation_id: string | null
          created_at: string
          customer_id: string
          customer_notes: string | null
          deposit_amount: number | null
          duration_minutes: number | null
          end_datetime: string
          guest_count: number | null
          id: string
          reminder_sent: boolean | null
          reservation_number: string
          service_name: string
          special_requests: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["reservation_status"] | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          business_notes?: string | null
          cancelled_at?: string | null
          catalog_id?: string | null
          confirmation_sent?: boolean | null
          confirmed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          deposit_amount?: number | null
          duration_minutes?: number | null
          end_datetime: string
          guest_count?: number | null
          id?: string
          reminder_sent?: boolean | null
          reservation_number: string
          service_name: string
          special_requests?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          business_notes?: string | null
          cancelled_at?: string | null
          catalog_id?: string | null
          confirmation_sent?: boolean | null
          confirmed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          deposit_amount?: number | null
          duration_minutes?: number | null
          end_datetime?: string
          guest_count?: number | null
          id?: string
          reminder_sent?: boolean | null
          reservation_number?: string
          service_name?: string
          special_requests?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          reply_text: string
          review_id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          reply_text: string
          review_id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          reply_text?: string
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
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
          customer_id: string
          id: string
          is_verified: boolean | null
          product_id: string | null
          rating: number
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_verified?: boolean | null
          product_id?: string | null
          rating: number
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_verified?: boolean | null
          product_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_agent_id: string | null
          business_id: string | null
          category: string
          closed_at: string | null
          conversation_id: string | null
          created_at: string
          customer_id: string
          description: string | null
          first_response_time_minutes: number | null
          id: string
          priority: Database["public"]["Enums"]["support_priority"] | null
          resolution: string | null
          resolution_time_minutes: number | null
          resolved_at: string | null
          satisfaction_feedback: string | null
          satisfaction_score: number | null
          status: Database["public"]["Enums"]["support_status"] | null
          subcategory: string | null
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          business_id?: string | null
          category: string
          closed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          first_response_time_minutes?: number | null
          id?: string
          priority?: Database["public"]["Enums"]["support_priority"] | null
          resolution?: string | null
          resolution_time_minutes?: number | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_score?: number | null
          status?: Database["public"]["Enums"]["support_status"] | null
          subcategory?: string | null
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          business_id?: string | null
          category?: string
          closed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          first_response_time_minutes?: number | null
          id?: string
          priority?: Database["public"]["Enums"]["support_priority"] | null
          resolution?: string | null
          resolution_time_minutes?: number | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_score?: number | null
          status?: Database["public"]["Enums"]["support_status"] | null
          subcategory?: string | null
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          conversation_id: string | null
          id: string
          is_typing: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_typing?: boolean | null
          updated_at?: string | null
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
          current_business_id: string | null
          current_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_business_id?: string | null
          current_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_business_id?: string | null
          current_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          active_profile: string | null
          last_switched: string | null
          user_id: string
        }
        Insert: {
          active_profile?: string | null
          last_switched?: string | null
          user_id: string
        }
        Update: {
          active_profile?: string | null
          last_switched?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_active_profile_fkey"
            columns: ["active_profile"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_business_deletion: {
        Args: { business_profile_id: string }
        Returns: undefined
      }
      cleanup_expired_location_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_booking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_reservation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_business_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_name: string
          id: string
          is_owner: boolean
          is_primary: boolean
          logo_url: string
          role: string
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          action_description_param: string
          action_type_param: string
          business_id_param?: string
          metadata_param?: Json
        }
        Returns: undefined
      }
      notify_business_subscribers: {
        Args: {
          business_id_param: string
          data_param?: Json
          message_param: string
          notification_type_param: string
          title_param: string
        }
        Returns: undefined
      }
      schedule_business_deletion: {
        Args: { business_profile_id: string }
        Returns: undefined
      }
      switch_user_mode: {
        Args: { business_id_param?: string; new_mode: string }
        Returns: undefined
      }
      switch_user_profile: {
        Args: { profile_id?: string }
        Returns: Json
      }
      toggle_business_sleep_mode: {
        Args: { business_profile_id: string; sleep_mode: boolean }
        Returns: undefined
      }
      user_can_view_business_contacts: {
        Args: { business_id_param: string }
        Returns: boolean
      }
      user_is_conversation_member: {
        Args: { conversation_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "individual" | "business"
      app_role: "admin" | "moderator" | "business_owner" | "user"
      business_category:
        | "restaurant"
        | "retail"
        | "services"
        | "technology"
        | "healthcare"
        | "education"
        | "finance"
        | "real_estate"
        | "automotive"
        | "beauty"
        | "fitness"
        | "entertainment"
        | "agriculture"
        | "manufacturing"
        | "other"
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
      [_ in never]: never
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
        "restaurant",
        "retail",
        "services",
        "technology",
        "healthcare",
        "education",
        "finance",
        "real_estate",
        "automotive",
        "beauty",
        "fitness",
        "entertainment",
        "agriculture",
        "manufacturing",
        "other",
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
