import { CircuitData } from '../types/circuit';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';
export type CircuitVisibility = 'private' | 'public' | 'unlisted';
export type SharePermission = 'read_only' | 'can_edit';
export type ExerciseCategory = 'gates' | 'combinational' | 'sequential' | 'arithmetic' | 'advanced';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      circuits: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          circuit_data: CircuitData;
          visibility: CircuitVisibility;
          category: string | null;
          thumbnail_url: string | null;
          share_token: string | null;
          version_number: number;
          created_at: string;
          updated_at: string;
          last_opened_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          circuit_data: CircuitData;
          visibility?: CircuitVisibility;
          category?: string | null;
          thumbnail_url?: string | null;
          share_token?: string | null;
          version_number?: number;
          created_at?: string;
          updated_at?: string;
          last_opened_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          circuit_data?: CircuitData;
          visibility?: CircuitVisibility;
          category?: string | null;
          thumbnail_url?: string | null;
          share_token?: string | null;
          version_number?: number;
          created_at?: string;
          updated_at?: string;
          last_opened_at?: string;
        };
        Relationships: [];
      };
      circuit_versions: {
        Row: {
          id: string;
          circuit_id: string;
          version_number: number;
          circuit_data: CircuitData;
          change_summary: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          circuit_id: string;
          version_number: number;
          circuit_data: CircuitData;
          change_summary?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          circuit_id?: string;
          version_number?: number;
          circuit_data?: CircuitData;
          change_summary?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      circuit_shares: {
        Row: {
          id: string;
          circuit_id: string;
          owner_id: string;
          share_token: string;
          permission: SharePermission;
          expires_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          circuit_id: string;
          owner_id: string;
          share_token?: string;
          permission?: SharePermission;
          expires_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          circuit_id?: string;
          owner_id?: string;
          share_token?: string;
          permission?: SharePermission;
          expires_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      simulation_runs: {
        Row: {
          id: string;
          circuit_id: string | null;
          user_id: string | null;
          input_values: Json;
          output_values: Json;
          status: 'running' | 'completed' | 'error';
          execution_duration_ms: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          circuit_id?: string | null;
          user_id?: string | null;
          input_values?: Json;
          output_values?: Json;
          status?: 'running' | 'completed' | 'error';
          execution_duration_ms?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          circuit_id?: string | null;
          user_id?: string | null;
          input_values?: Json;
          output_values?: Json;
          status?: 'running' | 'completed' | 'error';
          execution_duration_ms?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_exercises: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: ExerciseCategory;
          difficulty: ExerciseDifficulty;
          exercise_data: CircuitData;
          expected_answer: Json;
          explanation: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: ExerciseCategory;
          difficulty: ExerciseDifficulty;
          exercise_data: CircuitData;
          expected_answer?: Json;
          explanation?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: ExerciseCategory;
          difficulty?: ExerciseDifficulty;
          exercise_data?: CircuitData;
          expected_answer?: Json;
          explanation?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          submitted_answer: Json;
          score: number;
          is_correct: boolean;
          attempt_number: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          submitted_answer?: Json;
          score?: number;
          is_correct?: boolean;
          attempt_number?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          submitted_answer?: Json;
          score?: number;
          is_correct?: boolean;
          attempt_number?: number;
          completed_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          category: 'bug' | 'feature_request' | 'general' | 'improvement';
          subject: string;
          message: string;
          status: 'open' | 'under_review' | 'resolved' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          category?: 'bug' | 'feature_request' | 'general' | 'improvement';
          subject: string;
          message: string;
          status?: 'open' | 'under_review' | 'resolved' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          category?: 'bug' | 'feature_request' | 'general' | 'improvement';
          subject?: string;
          message?: string;
          status?: 'open' | 'under_review' | 'resolved' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      view_published_exercises: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: ExerciseCategory;
          difficulty: ExerciseDifficulty;
          exercise_data: CircuitData;
          explanation: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
      view_user_stats: {
        Row: {
          user_id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          total_circuits: number;
          public_circuits: number;
          total_versions: number;
          total_simulations: number;
          completed_exercises: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      save_circuit_version: {
        Args: {
          p_circuit_id: string;
          p_change_summary?: string;
        };
        Returns: string;
      };
      restore_circuit_version: {
        Args: {
          p_circuit_id: string;
          p_version_number: number;
        };
        Returns: CircuitData;
      };
      get_shared_circuit: {
        Args: {
          p_share_token: string;
        };
        Returns: {
          id: string;
          title: string;
          description: string | null;
          circuit_data: CircuitData;
          category: string | null;
          owner_name: string;
          created_at: string;
          updated_at: string;
          permission: SharePermission;
        };
      };
      submit_exercise_attempt: {
        Args: {
          p_exercise_id: string;
          p_submitted_answer: Json;
        };
        Returns: {
          attempt_id: string;
          is_correct: boolean;
          score: number;
          attempt_number: number;
          explanation: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
