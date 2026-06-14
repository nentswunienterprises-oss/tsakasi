import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "");
}

if (!rawSupabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(
  normalizeSupabaseUrl(rawSupabaseUrl),
  supabaseAnonKey,
);

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

type BusinessPilotSubmissionRow = {
  id: string;
  created_at: string;
  business_name: string;
  contact_person: string;
  business_type: string;
  town: string;
  currently_offer_delivery: string;
  current_delivery_method: string;
  average_deliveries_per_week: string;
  main_delivery_pain: string;
  local_delivery_partner_interest: string;
  short_interview_interest: string;
  whatsapp_number: string;
  email: string;
  source: string;
};

// Type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      business_pilot_submissions: {
        Row: BusinessPilotSubmissionRow;
        Insert: Omit<BusinessPilotSubmissionRow, "id" | "created_at">;
        Update: Partial<Omit<BusinessPilotSubmissionRow, "id" | "created_at">>;
      };
    };
    Enums: Record<string, never>;
  };
}
