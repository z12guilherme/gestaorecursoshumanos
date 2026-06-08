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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          id: string
          priority: string | null
          title: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          id?: string
          priority?: string | null
          title: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          id?: string
          priority?: string | null
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      automation_scripts: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          is_custom: boolean | null
          language: string | null
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          language?: string | null
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          language?: string | null
          title?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          applied_at: string | null
          email: string | null
          id: string
          job_id: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          rating: number | null
          resume_url: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          email?: string | null
          id?: string
          job_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          resume_url?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          email?: string | null
          id?: string
          job_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          rating?: number | null
          resume_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          name: string
          url: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          name: string
          url: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          name?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          admission_date: string | null
          avatar_url: string | null
          base_salary: number | null
          birth_date: string | null
          contract_type: string | null
          contracted_hours: number | null
          created_at: string
          custom_fields: Json | null
          department: string | null
          email: string | null
          family_salary_amount: number | null
          fixed_discounts: number | null
          has_insalubrity: boolean | null
          has_night_shift: boolean | null
          id: string
          insalubrity_amount: number | null
          inss_value: number | null
          manager: string | null
          name: string
          night_shift_amount: number | null
          overtime_amount: number | null
          password: string | null
          phone: string | null
          pis_pasep: string | null
          pix_key: string | null
          role: string | null
          salary: number | null
          status: string | null
          termination_date: string | null
          unit: string | null
          vacation_amount: number | null
          vacation_due_date: string | null
          vacation_limit_date: string | null
          vacation_third_amount: number | null
          variable_additions: Json | null
          variable_discounts: Json | null
          work_schedule: string | null
        }
        Insert: {
          admission_date?: string | null
          avatar_url?: string | null
          base_salary?: number | null
          birth_date?: string | null
          contract_type?: string | null
          contracted_hours?: number | null
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          family_salary_amount?: number | null
          fixed_discounts?: number | null
          has_insalubrity?: boolean | null
          has_night_shift?: boolean | null
          id?: string
          insalubrity_amount?: number | null
          inss_value?: number | null
          manager?: string | null
          name: string
          night_shift_amount?: number | null
          overtime_amount?: number | null
          password?: string | null
          phone?: string | null
          pis_pasep?: string | null
          pix_key?: string | null
          role?: string | null
          salary?: number | null
          status?: string | null
          termination_date?: string | null
          unit?: string | null
          vacation_amount?: number | null
          vacation_due_date?: string | null
          vacation_limit_date?: string | null
          vacation_third_amount?: number | null
          variable_additions?: Json | null
          variable_discounts?: Json | null
          work_schedule?: string | null
        }
        Update: {
          admission_date?: string | null
          avatar_url?: string | null
          base_salary?: number | null
          birth_date?: string | null
          contract_type?: string | null
          contracted_hours?: number | null
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          family_salary_amount?: number | null
          fixed_discounts?: number | null
          has_insalubrity?: boolean | null
          has_night_shift?: boolean | null
          id?: string
          insalubrity_amount?: number | null
          inss_value?: number | null
          manager?: string | null
          name?: string
          night_shift_amount?: number | null
          overtime_amount?: number | null
          password?: string | null
          phone?: string | null
          pis_pasep?: string | null
          pix_key?: string | null
          role?: string | null
          salary?: number | null
          status?: string | null
          termination_date?: string | null
          unit?: string | null
          vacation_amount?: number | null
          vacation_due_date?: string | null
          vacation_limit_date?: string | null
          vacation_third_amount?: number | null
          variable_additions?: Json | null
          variable_discounts?: Json | null
          work_schedule?: string | null
        }
        Relationships: []
      }
      evaluation_tokens: {
        Row: {
          created_at: string | null
          employee_id: string
          employee_name: string
          expires_at: string
          id: string
          reviewer_id: string
          reviewer_name: string
          status: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          employee_name: string
          expires_at: string
          id?: string
          reviewer_id: string
          reviewer_name: string
          status?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          expires_at?: string
          id?: string
          reviewer_id?: string
          reviewer_name?: string
          status?: string | null
          token?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          location: string | null
          requirements: string[] | null
          status: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string[] | null
          status?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string[] | null
          status?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      payroll_configurations: {
        Row: {
          created_at: string | null
          id: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      payslip_acknowledgments: {
        Row: {
          employee_id: string
          id: string
          ip_address: string | null
          reference_date: string
          signature_image: string | null
          signed_at: string | null
          user_agent: string | null
        }
        Insert: {
          employee_id: string
          id?: string
          ip_address?: string | null
          reference_date: string
          signature_image?: string | null
          signed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          employee_id?: string
          id?: string
          ip_address?: string | null
          reference_date?: string
          signature_image?: string | null
          signed_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslip_acknowledgments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslip_acknowledgments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          competencies: Json | null
          created_at: string | null
          employee_id: string | null
          feedback: string | null
          goals: Json | null
          id: string
          overall_score: number | null
          period: string | null
          reviewer_id: string | null
        }
        Insert: {
          competencies?: Json | null
          created_at?: string | null
          employee_id?: string | null
          feedback?: string | null
          goals?: Json | null
          id?: string
          overall_score?: number | null
          period?: string | null
          reviewer_id?: string | null
        }
        Update: {
          competencies?: Json | null
          created_at?: string | null
          employee_id?: string | null
          feedback?: string | null
          goals?: Json | null
          id?: string
          overall_score?: number | null
          period?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_role: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_role?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_role?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          subscription_details: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subscription_details: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subscription_details?: Json
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string | null
          avatar_url: string | null
          career_page_banner: string | null
          career_page_description: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string
          developer_name: string | null
          email: string | null
          employee_custom_fields_config: Json | null
          id: string
          login_background_url: string | null
          login_subtitle: string | null
          login_title: string | null
          notifications_enabled: boolean | null
          phone: string | null
          social_links: Json | null
          state: string | null
          theme: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          career_page_banner?: string | null
          career_page_description?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          developer_name?: string | null
          email?: string | null
          employee_custom_fields_config?: Json | null
          id?: string
          login_background_url?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          social_links?: Json | null
          state?: string | null
          theme?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          career_page_banner?: string | null
          career_page_description?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          developer_name?: string | null
          email?: string | null
          employee_custom_fields_config?: Json | null
          id?: string
          login_background_url?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          social_links?: Json | null
          state?: string | null
          theme?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          contact_info: string | null
          content: string
          created_at: string | null
          customer_name: string | null
          id: string
          status: string | null
        }
        Insert: {
          contact_info?: string | null
          content: string
          created_at?: string | null
          customer_name?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          contact_info?: string | null
          content?: string
          created_at?: string | null
          customer_name?: string | null
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string | null
          description: string
          employee_name: string
          hr_notes: string | null
          id: string
          priority: string
          status: string
          ticket_num: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          employee_name: string
          hr_notes?: string | null
          id?: string
          priority?: string
          status?: string
          ticket_num: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          employee_name?: string
          hr_notes?: string | null
          id?: string
          priority?: string
          status?: string
          ticket_num?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          employee_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          timestamp: string | null
          type: string | null
        }
        Insert: {
          employee_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Update: {
          employee_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_requests: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          employee_id: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string | null
          type: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string | null
          type: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employees_public: {
        Row: {
          admission_date: string | null
          avatar_url: string | null
          birth_date: string | null
          contract_type: string | null
          contracted_hours: number | null
          created_at: string | null
          department: string | null
          email: string | null
          has_insalubrity: boolean | null
          has_night_shift: boolean | null
          id: string | null
          manager: string | null
          name: string | null
          phone: string | null
          pis_pasep: string | null
          pix_key: string | null
          role: string | null
          status: string | null
          unit: string | null
          vacation_due_date: string | null
          vacation_limit_date: string | null
          work_schedule: string | null
        }
        Insert: {
          admission_date?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          contract_type?: string | null
          contracted_hours?: number | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          has_insalubrity?: boolean | null
          has_night_shift?: boolean | null
          id?: string | null
          manager?: string | null
          name?: string | null
          phone?: string | null
          pis_pasep?: string | null
          pix_key?: string | null
          role?: string | null
          status?: string | null
          unit?: string | null
          vacation_due_date?: string | null
          vacation_limit_date?: string | null
          work_schedule?: string | null
        }
        Update: {
          admission_date?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          contract_type?: string | null
          contracted_hours?: number | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          has_insalubrity?: boolean | null
          has_night_shift?: boolean | null
          id?: string | null
          manager?: string | null
          name?: string | null
          phone?: string | null
          pis_pasep?: string | null
          pix_key?: string | null
          role?: string | null
          status?: string | null
          unit?: string | null
          vacation_due_date?: string | null
          vacation_limit_date?: string | null
          work_schedule?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_employee_by_pin: {
        Args: { pin_input: string }
        Returns: {
          admission_date: string | null
          avatar_url: string | null
          base_salary: number | null
          birth_date: string | null
          contract_type: string | null
          contracted_hours: number | null
          created_at: string
          custom_fields: Json | null
          department: string | null
          email: string | null
          family_salary_amount: number | null
          fixed_discounts: number | null
          has_insalubrity: boolean | null
          has_night_shift: boolean | null
          id: string
          insalubrity_amount: number | null
          inss_value: number | null
          manager: string | null
          name: string
          night_shift_amount: number | null
          overtime_amount: number | null
          password: string | null
          phone: string | null
          pis_pasep: string | null
          pix_key: string | null
          role: string | null
          salary: number | null
          status: string | null
          termination_date: string | null
          unit: string | null
          vacation_amount: number | null
          vacation_due_date: string | null
          vacation_limit_date: string | null
          vacation_third_amount: number | null
          variable_additions: Json | null
          variable_discounts: Json | null
          work_schedule: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "employees"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_active_sessions: {
        Args: never
        Returns: {
          created_at: string
          ip_address: unknown
          last_sign_in_at: string
          session_id: string
          user_agent: string
        }[]
      }
      submit_public_evaluation: {
        Args: {
          competencies_data: Json
          feedback_text: string
          overall_score: number
          token_input: string
        }
        Returns: undefined
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
