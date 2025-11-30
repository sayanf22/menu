export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
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
        Relationships: []
      }
      approval_tokens: {
        Row: {
          action: string
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
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
      signup_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          id: string
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          id?: string
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          id?: string
          max_uses?: number | null
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
        Relationships: []
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
      admin_create_signup_code: {
        Args: { code_value: string; max_uses_value?: number }
        Returns: Json
      }
      admin_delete_signup_code: { Args: { code_id: string }; Returns: Json }
      admin_get_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          approval_status: string
          created_at: string
          disabled_at: string
          email: string
          id: string
          is_disabled: boolean
          restaurant_description: string
          restaurant_name: string
        }[]
      }
      admin_get_signup_codes: {
        Args: Record<PropertyKey, never>
        Returns: {
          code: string
          created_at: string
          current_uses: number
          id: string
          max_uses: number
        }[]
      }
      admin_update_profile_status: {
        Args: {
          disabled_by_email?: string
          is_disabled_value: boolean
          profile_id: string
        }
        Returns: Json
      }
      check_bell_rate_limit: {
        Args: { p_device_fingerprint: string; p_restaurant_id: string }
        Returns: boolean
      }
      create_user_profile: {
        Args: {
          restaurant_description?: string
          restaurant_name: string
          user_id: string
        }
        Returns: Json
      }
      ensure_profile_exists: { Args: { user_id: string }; Returns: boolean }
      use_signup_code: { Args: { code_value: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}