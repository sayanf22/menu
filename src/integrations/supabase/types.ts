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
      admin_create_user_account: {
        Args: {
          p_admin_session_token?: string
          p_email: string
          p_password: string
          p_restaurant_description?: string
          p_restaurant_name: string
        }
        Returns: Json
      }
      admin_delete_user_account: {
        Args: { p_admin_session_token: string; p_user_id: string }
        Returns: Json
      }
      admin_get_profiles: {
        Args: never
        Returns: {
          approval_status: string
          billing_cycle: string
          created_at: string
          disabled_at: string
          email: string
          id: string
          is_disabled: boolean
          restaurant_description: string
          restaurant_name: string
          subscription_end: string
          subscription_plan: string
          subscription_status: string
        }[]
      }
      admin_get_subscription_plans: {
        Args: never
        Returns: {
          bell_feature_enabled: boolean
          id: string
          max_images: number
          name: string
          price_monthly: number
        }[]
      }
      admin_grant_subscription: {
        Args: {
          p_admin_email: string
          p_months: number
          p_plan_id: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_revoke_subscription: {
        Args: { p_admin_email: string; p_user_id: string }
        Returns: Json
      }
      admin_update_profile_status: {
        Args: {
          disabled_by_email?: string
          is_disabled_value: boolean
          profile_id: string
        }
        Returns: Json
      }
      check_bell_feature_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_bell_rate_limit: {
        Args: { p_device_fingerprint: string; p_restaurant_id: string }
        Returns: boolean
      }
      check_image_upload_limit: { Args: { p_user_id: string }; Returns: Json }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_restaurant_subscription: {
        Args: { restaurant_uuid: string }
        Returns: Json
      }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_stale_pending_upgrades: { Args: never; Returns: undefined }
      clear_failed_logins: {
        Args: { p_identifier: string }
        Returns: undefined
      }
      create_menu_session: {
        Args: {
          p_device_fingerprint?: string
          p_restaurant_id: string
          p_session_duration_minutes?: number
        }
        Returns: Json
      }
      create_user_profile: {
        Args: {
          restaurant_description?: string
          restaurant_name: string
          user_id: string
        }
        Returns: Json
      }
      disable_expired_subscriptions: { Args: never; Returns: number }
      ensure_profile_exists: { Args: { user_id: string }; Returns: boolean }
      get_public_social_links: {
        Args: { rest_id: string }
        Returns: {
          facebook: string
          instagram: string
          twitter: string
          website: string
          whatsapp: string
          youtube: string
        }[]
      }
      get_user_plan_details: { Args: { p_user_id: string }; Returns: Json }
      get_user_subscription_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      has_active_subscription: { Args: { user_uuid: string }; Returns: boolean }
      is_login_blocked: { Args: { p_identifier: string }; Returns: boolean }
      is_subscription_active: { Args: { p_user_id: string }; Returns: boolean }
      is_user_approved: { Args: { user_uuid: string }; Returns: boolean }
      is_valid_email: { Args: { email_text: string }; Returns: boolean }
      is_valid_url: { Args: { url_text: string }; Returns: boolean }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: string
          p_success?: boolean
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      reactivate_subscription: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      record_failed_login: {
        Args: { p_identifier: string; p_type?: string }
        Returns: undefined
      }
      sanitize_text: { Args: { input_text: string }; Returns: string }
      update_admin_password: {
        Args: {
          p_email: string
          p_new_password: string
          p_old_password: string
        }
        Returns: Json
      }
      validate_menu_session: {
        Args: { p_idle_timeout_minutes?: number; p_session_token: string }
        Returns: Json
      }
      verify_admin_login: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
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
