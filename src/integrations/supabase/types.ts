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
      animal_analyses: {
        Row: {
          analysis_date: string
          animal_id: string
          animal_type: Database["public"]["Enums"]["animal_type"] | null
          body_length: number | null
          confidence_score: number | null
          created_at: string
          height_at_withers: number | null
          id: string
          image_path: string | null
          image_url: string | null
          keypoints: Json | null
          notes: string | null
          overall_score: number | null
          processing_time_ms: number | null
          rump_angle: number | null
          status: Database["public"]["Enums"]["analysis_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_date?: string
          animal_id: string
          animal_type?: Database["public"]["Enums"]["animal_type"] | null
          body_length?: number | null
          confidence_score?: number | null
          created_at?: string
          height_at_withers?: number | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          keypoints?: Json | null
          notes?: string | null
          overall_score?: number | null
          processing_time_ms?: number | null
          rump_angle?: number | null
          status?: Database["public"]["Enums"]["analysis_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_date?: string
          animal_id?: string
          animal_type?: Database["public"]["Enums"]["animal_type"] | null
          body_length?: number | null
          confidence_score?: number | null
          created_at?: string
          height_at_withers?: number | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          keypoints?: Json | null
          notes?: string | null
          overall_score?: number | null
          processing_time_ms?: number | null
          rump_angle?: number | null
          status?: Database["public"]["Enums"]["analysis_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      livestock_listings: {
        Row: {
          age_months: number | null
          age_years: number | null
          animal_id: string
          breed: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          health_status: string | null
          id: string
          image_url: string | null
          is_sold: boolean | null
          location: string
          price: number
          seller_id: string
          updated_at: string | null
          vaccination_status: string | null
          weight_kg: number | null
        }
        Insert: {
          age_months?: number | null
          age_years?: number | null
          animal_id: string
          breed: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          is_sold?: boolean | null
          location: string
          price: number
          seller_id: string
          updated_at?: string | null
          vaccination_status?: string | null
          weight_kg?: number | null
        }
        Update: {
          age_months?: number | null
          age_years?: number | null
          animal_id?: string
          breed?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          is_sold?: boolean | null
          location?: string
          price?: number
          seller_id?: string
          updated_at?: string | null
          vaccination_status?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      medicines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          name: string
          prescription_required: boolean | null
          price: number
          stock_quantity: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name: string
          prescription_required?: boolean | null
          price: number
          stock_quantity?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name?: string
          prescription_required?: boolean | null
          price?: number
          stock_quantity?: number | null
          type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          contact_phone: string | null
          created_at: string | null
          delivery_address: string | null
          id: string
          item_id: string
          item_name: string
          order_type: string
          quantity: number | null
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          contact_phone?: string | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          item_id: string
          item_name: string
          order_type: string
          quantity?: number | null
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          contact_phone?: string | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          item_id?: string
          item_name?: string
          order_type?: string
          quantity?: number | null
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veterinarians: {
        Row: {
          available: boolean | null
          clinic_address: string | null
          clinic_name: string | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          id: string
          image_url: string | null
          name: string
          phone: string
          rating: number | null
          specialization: string
          user_id: string | null
        }
        Insert: {
          available?: boolean | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          name: string
          phone: string
          rating?: number | null
          specialization: string
          user_id?: string | null
        }
        Update: {
          available?: boolean | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string
          rating?: number | null
          specialization?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      analysis_status: "pending" | "completed" | "failed"
      animal_type:
        | "cattle"
        | "buffalo"
        | "goat"
        | "sheep"
        | "horse"
        | "pig"
        | "other"
      app_role: "farmer" | "veterinarian" | "admin" | "government_inspector"
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
      analysis_status: ["pending", "completed", "failed"],
      animal_type: [
        "cattle",
        "buffalo",
        "goat",
        "sheep",
        "horse",
        "pig",
        "other",
      ],
      app_role: ["farmer", "veterinarian", "admin", "government_inspector"],
    },
  },
} as const
