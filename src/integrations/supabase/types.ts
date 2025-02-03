export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      allowed_ips: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
          file_path: string
          file_type: string
          id: string
          last_modified: string
          size: number
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by: string
          file_path: string
          file_type: string
          id?: string
          last_modified?: string
          size: number
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string
          file_path?: string
          file_type?: string
          id?: string
          last_modified?: string
          size?: number
          title?: string
        }
        Relationships: []
      }
      documents_tasks: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tasks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance: {
        Row: {
          employee_id: string | null
          id: string
          metric_name: string
          metric_value: number
          notes: string | null
          recorded_at: string | null
        }
        Insert: {
          employee_id?: string | null
          id?: string
          metric_name: string
          metric_value: number
          notes?: string | null
          recorded_at?: string | null
        }
        Update: {
          employee_id?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          notes?: string | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          task_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          task_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          task_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          contact_number: string | null
          created_at: string
          email: string
          encrypted_data: string
          full_name: string
          id: string
          location: string | null
          role: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          contact_number?: string | null
          created_at?: string
          email: string
          encrypted_data: string
          full_name: string
          id: string
          location?: string | null
          role?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string
          encrypted_data?: string
          full_name?: string
          id?: string
          location?: string | null
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      security_audits: {
        Row: {
          audit_type: string
          created_at: string
          findings: Json | null
          id: string
          resolved_at: string | null
          severity: string
        }
        Insert: {
          audit_type: string
          created_at?: string
          findings?: Json | null
          id?: string
          resolved_at?: string | null
          severity: string
        }
        Update: {
          audit_type?: string
          created_at?: string
          findings?: Json | null
          id?: string
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      security_headers: {
        Row: {
          created_at: string
          enabled: boolean | null
          header_name: string
          header_value: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          header_name: string
          header_value: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          header_name?: string
          header_value?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          created_at: string
          created_by: string
          deadline: string
          id: string
          priority: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          created_by: string
          deadline: string
          id?: string
          priority: string
          status: string
          title: string
          user_id: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          created_by?: string
          deadline?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_sensitive_data: {
        Args: {
          encrypted_data: string
          key: string
        }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: {
          data: string
          key: string
        }
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
