/**
 * ==============================================================================
 * DATABASE SCHEMA TYPE DEFINITIONS (SUPABASE POSTGRESQL)
 * ==============================================================================
 * NOTE: Hand-written and unverified against running engine
 * (Docker/Podman container runtime was not available in this environment to execute
 * `supabase gen types typescript --local`).
 * Matches migrations 20261022180000 through 20261022180008.
 * Conforms strictly to @supabase/supabase-js v2 GenericSchema.
 * ==============================================================================
 */

export type Json =
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type StaffRole = "admin" | "dietitian" | "staff";

export type MessageStatus =
  "queued" | "sending" | "sent" | "delivered" | "read" | "failed";

export type AuditAction =
  "insert" | "update" | "delete" | "status_change" | "export" | "login";

export type ClientGender =
  "female" | "male" | "non_binary" | "prefer_not_to_say" | "other";

export type ClientSource = "manual" | "google_form" | "referral" | "portal";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: StaffRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          client_code: string;
          full_name: string;
          phone_e164: string;
          email: string | null;
          date_of_birth: string | null;
          gender: ClientGender | null;
          dietary_preferences: Record<string, unknown>;
          goals: Record<string, unknown>;
          intake_responses: Record<string, unknown>;
          whatsapp_consent: boolean;
          whatsapp_consent_at: string | null;
          source: ClientSource;
          external_ref: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_code?: string;
          full_name: string;
          phone_e164: string;
          email?: string | null;
          date_of_birth?: string | null;
          gender?: ClientGender | null;
          dietary_preferences?: Record<string, unknown>;
          goals?: Record<string, unknown>;
          intake_responses?: Record<string, unknown>;
          whatsapp_consent?: boolean;
          whatsapp_consent_at?: string | null;
          source?: ClientSource;
          external_ref?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_code?: string;
          full_name?: string;
          phone_e164?: string;
          email?: string | null;
          date_of_birth?: string | null;
          gender?: ClientGender | null;
          dietary_preferences?: Record<string, unknown>;
          goals?: Record<string, unknown>;
          intake_responses?: Record<string, unknown>;
          whatsapp_consent?: boolean;
          whatsapp_consent_at?: string | null;
          source?: ClientSource;
          external_ref?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      diet_plans: {
        Row: {
          id: string;
          client_id: string;
          storage_path: string;
          original_filename: string;
          mime_type: "application/pdf";
          file_size_bytes: number;
          version: number;
          title: string;
          calorie_target: number | null;
          macro_ratio: Record<string, unknown>;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          storage_path: string;
          original_filename: string;
          mime_type?: "application/pdf";
          file_size_bytes: number;
          version: number;
          title?: string;
          calorie_target?: number | null;
          macro_ratio?: Record<string, unknown>;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          storage_path?: string;
          original_filename?: string;
          mime_type?: "application/pdf";
          file_size_bytes?: number;
          version?: number;
          title?: string;
          calorie_target?: number | null;
          macro_ratio?: Record<string, unknown>;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diet_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diet_plans_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      whatsapp_messages: {
        Row: {
          id: string;
          client_id: string;
          diet_plan_id: string | null;
          destination_e164: string;
          idempotency_key: string;
          provider_message_id: string | null;
          status: MessageStatus;
          attempt_count: number;
          retry_of: string | null;
          error_code: string | null;
          error_message: string | null;
          queued_at: string;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          failed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          diet_plan_id?: string | null;
          destination_e164: string;
          idempotency_key: string;
          provider_message_id?: string | null;
          status?: MessageStatus;
          attempt_count?: number;
          retry_of?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          queued_at?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          failed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          diet_plan_id?: string | null;
          destination_e164?: string;
          idempotency_key?: string;
          provider_message_id?: string | null;
          status?: MessageStatus;
          attempt_count?: number;
          retry_of?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          queued_at?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          failed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_messages_diet_plan_id_fkey";
            columns: ["diet_plan_id"];
            isOneToOne: false;
            referencedRelation: "diet_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_messages_retry_of_fkey";
            columns: ["retry_of"];
            isOneToOne: false;
            referencedRelation: "whatsapp_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_table: string;
          target_id: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_table: string;
          target_id: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_table?: string;
          target_id?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_active_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_role: {
        Args: { required_role: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_next_diet_plan_version: {
        Args: { p_client_id: string };
        Returns: number;
      };
      find_potential_duplicate_clients: {
        Args: {
          p_phone_e164: string;
          p_email: string | null;
          p_exclude_id: string | null;
        };
        Returns: {
          client_id: string;
          client_code: string;
          full_name: string;
          phone_e164: string;
          email: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: {
      staff_role: StaffRole;
      message_status: MessageStatus;
      audit_action: AuditAction;
    };
    CompositeTypes: Record<string, never>;
  };
}
