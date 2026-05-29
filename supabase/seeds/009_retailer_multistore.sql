-- 009_retailer_multistore.sql
-- Adds two more store TYPES to the demo retailer so the dashboards/filters show a
-- richer multi-format operator. Data is cloned from the strong STN-001/STR-001
-- store and scaled, preserving every invariant (May actual + single June forecast,
-- segment latest-month, revenue ≈ orders×basket×30, net = rev−rent−util):
--   STN-002 / STR-002 — Lumina Fresh Market (Premium)   ×1.20
--   STN-003 / STR-003 — Lumina Wellness   (Pharmacy)    ×0.65 (smaller basket ×0.78)
-- Idempotent. Additive — does NOT touch STN-001/STN-018 or the landlord demo apps.

DELETE FROM store_monthly_pnl         WHERE store_display_id IN ('STN-002','STN-003');
DELETE FROM store_monthly_performance WHERE store_display_id IN ('STN-002','STN-003');
DELETE FROM store_monthly_retention   WHERE store_display_id IN ('STN-002','STN-003');
DELETE FROM store_customer_segments   WHERE store_display_id IN ('STN-002','STN-003');
DELETE FROM store_hourly_traffic      WHERE store_display_id IN ('STN-002','STN-003');
DELETE FROM ml_sales_forecasts        WHERE store_id IN ('STR-002','STR-003');
DELETE FROM ml_churn_segments         WHERE store_id IN ('STR-002','STR-003');
DELETE FROM ml_anomaly_alerts         WHERE store_id IN ('STR-002','STR-003');
DELETE FROM ml_customer_origins       WHERE store_id IN ('STR-002','STR-003');
DELETE FROM ml_store_catchment        WHERE store_id IN ('STR-002','STR-003');

-- For each new store, clone-and-scale from STN-001 / STR-001.
-- (factor f applied to magnitudes; ratios — conversion, basket, revisit — preserved;
--  Wellness additionally scales basket ×0.78 for a lower-ticket pharmacy.)
DO $$
DECLARE
  s RECORD;
BEGIN
  FOR s IN
    SELECT 'STN-002'::text stn, 'STR-002'::text str, 1.20::numeric f, 1.00::numeric bf
    UNION ALL
    SELECT 'STN-003', 'STR-003', 0.65, 0.78
  LOOP
    INSERT INTO store_monthly_pnl (store_display_id, year_month, revenue_thb, rent_thb, utilities_thb, net_thb)
    SELECT s.stn, year_month, round(revenue_thb*s.f), round(rent_thb*s.f), round(utilities_thb*s.f),
           round(revenue_thb*s.f)-round(rent_thb*s.f)-round(utilities_thb*s.f)
    FROM store_monthly_pnl WHERE store_display_id='STN-001';

    INSERT INTO store_monthly_performance (store_display_id, year_month, orders, traffic, conversion_pct, avg_basket_thb, sales_per_sqm_thb, revisit_rate_pct, patron_score)
    SELECT s.stn, year_month, round(orders*s.f), round(traffic*s.f), conversion_pct, round(avg_basket_thb*s.bf), round(sales_per_sqm_thb*s.f), revisit_rate_pct, patron_score
    FROM store_monthly_performance WHERE store_display_id='STN-001';

    INSERT INTO store_monthly_retention (store_display_id, year_month, new_customers, returning_customers, lapsed_customers, new_mom_pct, returning_mom_pct, lapsed_mom_pct)
    SELECT s.stn, year_month, round(new_customers*s.f), round(returning_customers*s.f), round(lapsed_customers*s.f), new_mom_pct, returning_mom_pct, lapsed_mom_pct
    FROM store_monthly_retention WHERE store_display_id='STN-001';

    INSERT INTO store_customer_segments (store_display_id, year_month, segment_type, segment_label, segment_order, share_pct, avg_basket_thb, growth_pct)
    SELECT s.stn, year_month, segment_type, segment_label, segment_order, share_pct, round(avg_basket_thb*s.bf), growth_pct
    FROM store_customer_segments WHERE store_display_id='STN-001';

    INSERT INTO store_hourly_traffic (store_display_id, year_month, day_of_week, hour, intensity, visitors)
    SELECT s.stn, year_month, day_of_week, hour, intensity, round(visitors*s.f)
    FROM store_hourly_traffic WHERE store_display_id='STN-001';

    INSERT INTO ml_sales_forecasts (store_id, retailer_id, station_id, forecast_period, predicted_revenue_thb, forecast_lower_thb, forecast_upper_thb, pct_change_vs_last, predicted_quarterly_thb, quarterly_lower_thb, quarterly_upper_thb, predicted_avg_spend_thb, pct_change_spend_vs_last, confidence_pct, is_cold_start, model_version, trained_on_period)
    SELECT s.str, 'RET-001', s.stn, forecast_period, round(predicted_revenue_thb*s.f), round(forecast_lower_thb*s.f), round(forecast_upper_thb*s.f), pct_change_vs_last, round(predicted_quarterly_thb*s.f), round(quarterly_lower_thb*s.f), round(quarterly_upper_thb*s.f), round(predicted_avg_spend_thb*s.bf), pct_change_spend_vs_last, confidence_pct, is_cold_start, model_version, trained_on_period
    FROM ml_sales_forecasts WHERE store_id='STR-001';

    INSERT INTO ml_churn_segments (store_id, age_group, spend_range, n_monthly_customers, avg_risk_prob_pct, revenue_at_risk_annual, risk_level, recommended_action, model_version)
    SELECT s.str, age_group, spend_range, round(n_monthly_customers*s.f), avg_risk_prob_pct, round(revenue_at_risk_annual*s.f), risk_level, recommended_action, model_version
    FROM ml_churn_segments WHERE store_id='STR-001';

    INSERT INTO ml_anomaly_alerts (store_id, period, is_anomaly, anomaly_score, anomaly_dimension, pct_deviation, direction, severity, suggested_action, model_version)
    SELECT s.str, period, is_anomaly, anomaly_score, anomaly_dimension, pct_deviation, direction, severity, suggested_action, model_version
    FROM ml_anomaly_alerts WHERE store_id='STR-001';

    INSERT INTO ml_customer_origins (store_id, distance_band, customer_pct, model_version)
    SELECT s.str, distance_band, customer_pct, model_version FROM ml_customer_origins WHERE store_id='STR-001';

    INSERT INTO ml_store_catchment (store_id, station_display_id, reach_5km_k, model_version)
    SELECT s.str, s.stn, round(reach_5km_k*s.f), model_version FROM ml_store_catchment WHERE store_id='STR-001';
  END LOOP;
END $$;
