export type MlSalesForecast = {
  store_id: string;
  retailer_id: string;
  station_id: string;
  forecast_period: string;
  predicted_revenue_thb: number;
  forecast_lower_thb: number;
  forecast_upper_thb: number;
  pct_change_vs_last: number;
  predicted_quarterly_thb: number;
  quarterly_lower_thb: number;
  quarterly_upper_thb: number;
  predicted_avg_spend_thb: number;
  pct_change_spend_vs_last: number;
  confidence_pct: number;
  is_cold_start: boolean;
  model_version: string;
  trained_on_period: string;
};

export type MlChurnSegment = {
  store_id: string;
  age_group: string;
  spend_range: string;
  n_monthly_customers: number;
  avg_risk_prob_pct: number;
  revenue_at_risk_annual: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  recommended_action: string;
  model_version: string;
};

export type MlMatchingScore = {
  retailer_id: string;
  station_id: string;
  station_name: string;
  traffic_level: string;
  location_text: string;
  match_score: number;
  match_pct: number;
  match_label: string;
  estimated_earn_low_thb: number;
  estimated_earn_high_thb: number;
  is_cold_start: boolean;
  model_version: string;
};

export type MlAnomalyAlert = {
  store_id: string;
  period: string;
  is_anomaly: boolean;
  anomaly_score: number;
  anomaly_dimension: string;
  pct_deviation: number;
  direction: "above" | "below";
  severity: "good_news" | "watch" | "critical";
  suggested_action: string;
  model_version: string;
};

export type MlCustomerOrigin = {
  store_id: string;
  distance_band: string;
  customer_pct: number;
};

export type MlStoreCatchment = {
  store_id: string;
  station_display_id: string;
  reach_5km_k: number;
  lat: number;
  lng: number;
  station_name: string;
};

export type MlStoreEvent = {
  store_display_id: string | null;
  year_month: string;
  event_name: string;
  event_type: string;
  description: string | null;
  est_traffic_lift_pct: number | null;
  est_sales_lift_pct: number | null;
};

export type MlApiResponse = {
  forecasts: MlSalesForecast[];
  churnSegments: MlChurnSegment[];
  matchingScores: MlMatchingScore[];
  anomalyAlerts: MlAnomalyAlert[];
  customerOrigins: MlCustomerOrigin[];
  storeCatchment: MlStoreCatchment[];
  events: MlStoreEvent[];
};
