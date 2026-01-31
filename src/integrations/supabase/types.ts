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
      admin_audit_log: {
        Row: {
          action_type: string
          admin_email: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string
        }
        Insert: {
          action_type: string
          admin_email: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id: string
        }
        Update: {
          action_type?: string
          admin_email?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      admin_credentials: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          session_token: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          session_token: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      bell_notifications: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          device_fingerprint: string | null
          id: string
          restaurant_id: string
          status: string | null
          table_number: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          restaurant_id: string
          status?: string | null
          table_number: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          restaurant_id?: string
          status?: string | null
          table_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "bell_notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempt_type: string
          attempted_at: string | null
          blocked_until: string | null
          id: string
          identifier: string
        }
        Insert: {
          attempt_type?: string
          attempted_at?: string | null
          blocked_until?: string | null
          id?: string
          identifier: string
        }
        Update: {
          attempt_type?: string
          attempted_at?: string | null
          blocked_until?: string | null
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_ip: string | null
          customer_name: string | null
          device_fingerprint: string | null
          id: string
          rating: number
          restaurant_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_ip?: string | null
          customer_name?: string | null
          device_fingerprint?: string | null
          id?: string
          rating: number
          restaurant_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_ip?: string | null
          customer_name?: string | null
          device_fingerprint?: string | null
          id?: string
          rating?: number
          restaurant_id?: string
        }
        Relationships: []
      }
      menu_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          dominant_color: string | null
          id: string
          image_url: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          dominant_color?: string | null
          id?: string
          image_url: string
          restaurant_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          dominant_color?: string | null
          id?: string
          image_url?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          restaurant_id: string
          session_token: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          restaurant_id: string
          session_token: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          restaurant_id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_sessions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_code: string | null
          error_description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_code?: string | null
          error_description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_code?: string | null
          error_description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_registrations: {
        Row: {
          billing_cycle: string
          completed_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          password_hash: string
          plan_id: string
          razorpay_subscription_id: string | null
          restaurant_description: string | null
          restaurant_name: string
          status: string
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string
          completed_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          password_hash: string
          plan_id: string
          razorpay_subscription_id?: string | null
          restaurant_description?: string | null
          restaurant_name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string
          completed_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          password_hash?: string
          plan_id?: string
          razorpay_subscription_id?: string | null
          restaurant_description?: string | null
          restaurant_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bell_service_enabled: boolean | null
          business_type: string | null
          call_phone_number: string | null
          call_service_enabled: boolean | null
          created_at: string | null
          disabled_at: string | null
          disabled_by: string | null
          id: string
          is_disabled: boolean | null
          logo_url: string | null
          restaurant_description: string | null
          restaurant_name: string
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bell_service_enabled?: boolean | null
          business_type?: string | null
          call_phone_number?: string | null
          call_service_enabled?: boolean | null
          created_at?: string | null
          disabled_at?: string | null
          disabled_by?: string | null
          id: string
          is_disabled?: boolean | null
          logo_url?: string | null
          restaurant_description?: string | null
          restaurant_name: string
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bell_service_enabled?: boolean | null
          business_type?: string | null
          call_phone_number?: string | null
          call_service_enabled?: boolean | null
          created_at?: string | null
          disabled_at?: string | null
          disabled_by?: string | null
          id?: string
          is_disabled?: boolean | null
          logo_url?: string | null
          restaurant_description?: string | null
          restaurant_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      razorpay_webhook_events: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          facebook: string | null
          id: string
          instagram: string | null
          restaurant_id: string
          twitter: string | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          created_at?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          restaurant_id: string
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          created_at?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          restaurant_id?: string
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_links_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          bell_feature_enabled: boolean | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_images: number | null
          name: string
          plan_tier: number | null
          price_monthly: number
          price_yearly: number | null
          razorpay_plan_id_monthly: string | null
          razorpay_plan_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          bell_feature_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_images?: number | null
          name: string
          plan_tier?: number | null
          price_monthly: number
          price_yearly?: number | null
          razorpay_plan_id_monthly?: string | null
          razorpay_plan_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          bell_feature_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_images?: number | null
          name?: string
          plan_tier?: number | null
          price_monthly?: number
          price_yearly?: number | null
          razorpay_plan_id_monthly?: string | null
          razorpay_plan_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          pending_billing_cycle: string | null
          pending_plan_id: string | null
          pending_razorpay_subscription_id: string | null
          plan_id: string | null
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: string
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          pending_billing_cycle?: string | null
          pending_plan_id?: string | null
          pending_razorpay_subscription_id?: string | null
          plan_id?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          pending_billing_cycle?: string | null
          pending_plan_id?: string | null
          pending_razorpay_subscription_id?: string | null
          plan_id?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_pending_plan_id_fkey"
            columns: ["pending_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      view_logs: {
        Row: {
          id: string
          restaurant_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
