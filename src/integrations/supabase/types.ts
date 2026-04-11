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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cleanliness_scores: {
        Row: {
          id: string
          score: number
          tier: string
          total_donations: number | null
          total_events: number | null
          total_reports: number | null
          total_scrap_sold: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          score?: number
          tier?: string
          total_donations?: number | null
          total_events?: number | null
          total_reports?: number | null
          total_scrap_sold?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          score?: number
          tier?: string
          total_donations?: number | null
          total_events?: number | null
          total_reports?: number | null
          total_scrap_sold?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          event_type: string | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          max_participants: number | null
          organizer_id: string | null
          reward_points: number | null
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_participants?: number | null
          organizer_id?: string | null
          reward_points?: number | null
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_participants?: number | null
          organizer_id?: string | null
          reward_points?: number | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["donation_category"]
          citizen_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          ngo_id: string | null
          proof_image_url: string | null
          reward_points: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["pickup_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["donation_category"]
          citizen_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          ngo_id?: string | null
          proof_image_url?: string | null
          reward_points?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["pickup_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["donation_category"]
          citizen_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          ngo_id?: string | null
          proof_image_url?: string | null
          reward_points?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["pickup_status"]
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      government_benefits: {
        Row: {
          approved_by: string | null
          benefit_type: Database["public"]["Enums"]["benefit_type"]
          created_at: string
          discount_percent: number
          id: string
          provider: string | null
          status: string
          updated_at: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          approved_by?: string | null
          benefit_type: Database["public"]["Enums"]["benefit_type"]
          created_at?: string
          discount_percent: number
          id?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          approved_by?: string | null
          benefit_type?: Database["public"]["Enums"]["benefit_type"]
          created_at?: string
          discount_percent?: number
          id?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          ward: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          ward?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          ward?: string | null
        }
        Relationships: []
      }
      redeem_items: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          image_emoji: string | null
          points_cost: number
          stock: number | null
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_emoji?: string | null
          points_cost: number
          stock?: number | null
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_emoji?: string | null
          points_cost?: number
          stock?: number | null
          title?: string
        }
        Relationships: []
      }
      scrap_listing_items: {
        Row: {
          category: Database["public"]["Enums"]["scrap_category"]
          id: string
          item_name: string
          listing_id: string
          price_per_kg: number
          total_price: number | null
          weight_kg: number
        }
        Insert: {
          category: Database["public"]["Enums"]["scrap_category"]
          id?: string
          item_name: string
          listing_id: string
          price_per_kg: number
          total_price?: number | null
          weight_kg?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["scrap_category"]
          id?: string
          item_name?: string
          listing_id?: string
          price_per_kg?: number
          total_price?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "scrap_listing_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "scrap_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      scrap_listings: {
        Row: {
          address: string | null
          citizen_id: string
          completed_at: string | null
          created_at: string
          dealer_id: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          status: Database["public"]["Enums"]["pickup_status"]
          total_estimate: number | null
          total_weight: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          citizen_id: string
          completed_at?: string | null
          created_at?: string
          dealer_id?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: Database["public"]["Enums"]["pickup_status"]
          total_estimate?: number | null
          total_weight?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          citizen_id?: string
          completed_at?: string | null
          created_at?: string
          dealer_id?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: Database["public"]["Enums"]["pickup_status"]
          total_estimate?: number | null
          total_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      scrap_prices: {
        Row: {
          category: Database["public"]["Enums"]["scrap_category"]
          dealer_id: string | null
          id: string
          item_name: string
          price_per_kg: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["scrap_category"]
          dealer_id?: string | null
          id?: string
          item_name: string
          price_per_kg: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["scrap_category"]
          dealer_id?: string | null
          id?: string
          item_name?: string
          price_per_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          icon: string | null
          id: string
          lesson_count: number | null
          requires_previous: boolean | null
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          lesson_count?: number | null
          requires_previous?: boolean | null
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          lesson_count?: number | null
          requires_previous?: boolean | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          module_id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          module_id: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          module_id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          action: string
          created_at: string
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      waste_reports: {
        Row: {
          address: string | null
          assigned_worker_id: string | null
          citizen_id: string
          completed_at: string | null
          completion_image_url: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          priority: string | null
          reward_points: number | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
          waste_type: Database["public"]["Enums"]["waste_type"]
        }
        Insert: {
          address?: string | null
          assigned_worker_id?: string | null
          citizen_id: string
          completed_at?: string | null
          completion_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: string | null
          reward_points?: number | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          waste_type?: Database["public"]["Enums"]["waste_type"]
        }
        Update: {
          address?: string | null
          assigned_worker_id?: string | null
          citizen_id?: string
          completed_at?: string | null
          completion_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: string | null
          reward_points?: number | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          waste_type?: Database["public"]["Enums"]["waste_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_points: {
        Args: {
          _action: string
          _points: number
          _ref_id?: string
          _ref_type?: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "citizen" | "worker" | "ngo" | "scrap_dealer" | "admin"
      benefit_type: "light_bill" | "water_tax" | "property_tax"
      donation_category: "clothing" | "books" | "toys" | "furniture" | "other"
      pickup_status:
        | "pending"
        | "accepted"
        | "on_the_way"
        | "completed"
        | "cancelled"
      report_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "rejected"
      scrap_category: "paper" | "plastic" | "metal" | "ewaste"
      transaction_type: "earned" | "spent" | "redeemed"
      waste_type: "dry" | "wet" | "hazardous" | "mixed"
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
      app_role: ["citizen", "worker", "ngo", "scrap_dealer", "admin"],
      benefit_type: ["light_bill", "water_tax", "property_tax"],
      donation_category: ["clothing", "books", "toys", "furniture", "other"],
      pickup_status: [
        "pending",
        "accepted",
        "on_the_way",
        "completed",
        "cancelled",
      ],
      report_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "rejected",
      ],
      scrap_category: ["paper", "plastic", "metal", "ewaste"],
      transaction_type: ["earned", "spent", "redeemed"],
      waste_type: ["dry", "wet", "hazardous", "mixed"],
    },
  },
} as const
