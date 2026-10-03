export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Table<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      platform_members: Table<
        { id: string; role: string; active: boolean; created_at: string; updated_at: string },
        { id: string; role: string; active?: boolean; created_at?: string; updated_at?: string },
        { id?: string; role?: string; active?: boolean; created_at?: string; updated_at?: string }
      >
      invitation_projects: Table<
        {
          id: string
          public_code: string
          internal_name: string
          event_type: string
          plan_code: string
          plan_version: number
          status: string
          created_by: string
          created_at: string
          updated_at: string
        },
        {
          id?: string
          public_code: string
          internal_name: string
          event_type: string
          plan_code: string
          plan_version?: number
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        },
        {
          public_code?: string
          internal_name?: string
          event_type?: string
          plan_code?: string
          plan_version?: number
          status?: string
          updated_at?: string
        }
      >
      invitation_drafts: Table<
        {
          id: string
          project_id: string
          schema_version: number
          revision: number
          document: Json
          updated_by: string
          updated_at: string
        },
        {
          id?: string
          project_id: string
          schema_version?: number
          revision?: number
          document: Json
          updated_by: string
          updated_at?: string
        },
        {
          schema_version?: number
          revision?: number
          document?: Json
          updated_by?: string
          updated_at?: string
        }
      >
      project_access: Table<
        { project_id: string; user_id: string; role: string; created_at: string },
        { project_id: string; user_id: string; role: string; created_at?: string },
        { project_id?: string; user_id?: string; role?: string; created_at?: string }
      >
      invitation_publications: Table<
        {
          id: string
          project_id: string
          public_code: string
          schema_version: number
          revision: number
          draft_revision: number
          document: Json
          status: string
          published_by: string
          published_at: string
        },
        {
          id?: string
          project_id: string
          public_code: string
          schema_version: number
          revision: number
          draft_revision: number
          document: Json
          status?: string
          published_by: string
          published_at?: string
        },
        { status?: string }
      >
      project_media_assets: Table<
        {
          id: string
          project_id: string
          storage_key: string
          kind: string
          status: string
          mime_type: string
          size_bytes: number
          original_filename: string
          created_by: string
          created_at: string
        },
        {
          id?: string
          project_id: string
          storage_key: string
          kind: string
          status?: string
          mime_type: string
          size_bytes: number
          original_filename: string
          created_by: string
          created_at?: string
        },
        { status?: string }
      >
    }
    Views: Record<never, never>
    Functions: {
      publish_invitation_draft: {
        Args: { p_project_id: string; p_expected_draft_revision: number }
        Returns: Json
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
