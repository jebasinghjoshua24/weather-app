/**
 * Supabase generated types — Mumbai ap-south-1
 * WHY: type-safe RLS. If we mistype a column or table name we fail at
 * compile time, not when a user hits "Save".
 * Regenerate after `supabase/migrations/0001_init.sql` changes:
 *   supabase gen types typescript --local > lib/supabase/database.types.ts
 * Until the Mumbai project is provisioned, this is a faithful stub.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          unit: "celsius" | "fahrenheit";
          theme: "light" | "dark" | "system";
          consent_granted: boolean;
          consent_timestamp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          unit?: "celsius" | "fahrenheit";
          theme?: "light" | "dark" | "system";
          consent_granted?: boolean;
          consent_timestamp?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      saved_locations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lat: number;
          lon: number;
          country: string | null;
          is_favorite: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          lat: number;
          lon: number;
          country?: string | null;
          is_favorite?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["saved_locations"]["Insert"]>;
      };
      weather_history: {
        Row: {
          id: string;
          user_id: string;
          location: Json;
          snapshot: Json;
          mood: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          location: Json;
          snapshot: Json;
          mood?: string | null;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["weather_history"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_id: { Args: Record<string, never>; Returns: string };
      purge_old_weather_history: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
  };
}
