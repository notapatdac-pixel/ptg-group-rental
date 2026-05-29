import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

export type UserRole = "retailer" | "landlord";

export interface DbUser {
  id:           string;
  email:        string;
  name:         string;
  role:         UserRole;
  avatar_color: string;
  initials:     string;
}

export type AppStatus = "pending_review" | "approved" | "not_approved";

export interface DbApplication {
  id:                   string;
  retailer_display_id:  string;
  landlord_display_id:  string;
  retailer_profile_id:  string;
  station_unit_id:      string;
  status:               AppStatus;
  ai_score:             string;
  ai_text:              string;
  ai_text_th:           string;
  est_revenue_thb:      string;
  panel_color:          string;
  applied_date:         string;
  specialist_name:      string;
  specialist_initials:  string;
  retailer_profiles?: {
    business_name: string;
    applicant_name?: string;
    category:      string;
    experience:    string;
    num_stores:    string;
    max_budget:    string;
    concept:       string;
    user_id:       string;
  };
  station_units?: {
    unit_code:  string;
    unit_label: string;
    area_sqm:   number;
    price_thb:  number;
    lease_type: string;
    stations?: {
      filter_key: string;
      name:       string;
      location_text: string;
    };
  };
}
