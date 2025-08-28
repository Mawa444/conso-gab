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
          is_sleeping: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          phone: string | null
          province: string | null
          quartier: string | null
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
          is_sleeping?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          province?: string | null
          quartier?: string | null
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
          is_sleeping?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          province?: string | null
          quartier?: string | null
          telegram?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      catalogs: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string
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
          business_id: string
          created_at: string
          customer_id: string
          id: string
          is_active: boolean | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id: string
          id?: string
          is_active?: boolean | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_active?: boolean | null
          subject?: string | null
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
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
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
          customer_id: string
          delivery_address: string | null
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string
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
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_profiles: {
        Row: {
          address: string | null
          arrondissement: string | null
          country: string | null
          created_at: string
          department: string | null
          id: string
          latitude: number | null
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
          id?: string
          latitude?: number | null
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
          id?: string
          latitude?: number | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_business_deletion: {
        Args: { business_profile_id: string }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      schedule_business_deletion: {
        Args: { business_profile_id: string }
        Returns: undefined
      }
      toggle_business_sleep_mode: {
        Args: { business_profile_id: string; sleep_mode: boolean }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "individual" | "business"
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
      message_status: "sent" | "delivered" | "read"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
      message_status: ["sent", "delivered", "read"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
