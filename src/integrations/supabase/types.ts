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
      business_image_likes: {
        Row: {
          business_id: string
          created_at: string
          id: string
          image_type: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          image_type: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          image_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_image_likes_business_id_fkey"
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
          location: unknown | null
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
          location?: unknown | null
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
          location?: unknown | null
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
      profile_image_likes: {
        Row: {
          created_at: string
          id: string
          image_type: string
          profile_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_type: string
          profile_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string
          profile_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_updated_at: string | null
          avatar_url: string | null
          cover_image_url: string | null
          cover_updated_at: string | null
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
          avatar_updated_at?: string | null
          avatar_url?: string | null
          cover_image_url?: string | null
          cover_updated_at?: string | null
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
          avatar_updated_at?: string | null
          avatar_url?: string | null
          cover_image_url?: string | null
          cover_updated_at?: string | null
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
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
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
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
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
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
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
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
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      cancel_business_deletion: {
        Args: { business_profile_id: string }
        Returns: undefined
      }
      check_unique_business_conversation: {
        Args: { p_business_id: string; p_user_id: string }
        Returns: string
      }
      cleanup_expired_location_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
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
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
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
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
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
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
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
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
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
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_businesses_in_bbox: {
        Args: {
          limit_count?: number
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
        }
        Returns: {
          address: string
          business_category: string
          business_name: string
          city: string
          description: string
          email: string
          id: string
          is_active: boolean
          is_verified: boolean
          latitude: number
          logo_url: string
          longitude: number
          phone: string
        }[]
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
      get_nearest_businesses: {
        Args: {
          limit_count?: number
          radius_meters?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          address: string
          business_category: string
          business_name: string
          city: string
          description: string
          distance_meters: number
          email: string
          id: string
          is_active: boolean
          is_verified: boolean
          latitude: number
          logo_url: string
          longitude: number
          phone: string
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_user_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
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
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
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
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
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
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      schedule_business_deletion: {
        Args: { business_profile_id: string }
        Returns: undefined
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
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
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
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
      st_3dperimeter: {
        Args: { "": unknown }
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
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
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
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
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
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
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
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
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
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
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
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
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
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
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
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
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
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
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
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
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
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
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
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
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
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
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
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      switch_user_mode: {
        Args: { business_id_param?: string; new_mode: string }
        Returns: undefined
      }
      switch_user_profile: {
        Args: { profile_id?: string }
        Returns: Json
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      toggle_business_sleep_mode: {
        Args: { business_profile_id: string; sleep_mode: boolean }
        Returns: undefined
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
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
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
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
