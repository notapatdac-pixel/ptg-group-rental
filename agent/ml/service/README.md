# PTG ML Inference Service

A small FastAPI service that loads the pre-trained joblib models from
`models/`, reads feature data from Supabase, runs predictions, and
upserts results into the `ml_*` tables.

The Next.js app already reads the `ml_*` tables via
`pages/api/retailer/ml.ts` — this service is what *populates* them with
real model output instead of the static seed values.

---

## Step 1 — copy the joblib models (REQUIRED, do this first)

The 14 joblib files live in the source ML package, not in this repo.
Copy them in once:

```powershell
Copy-Item -Path "C:\Users\notap\Downloads\ptg_ml\models\*.joblib" `
          -Destination ".\models\" -Force
```

Run from inside `agent/ml/service/`. Without these files the service still
starts (so `/ml/health` works), but every prediction endpoint returns
`rows_written: 0` with a note about the missing file.

---

## Models

| File                              | Used by              |
|-----------------------------------|----------------------|
| `sales_revenue_xgb.joblib`        | sales_forecast       |
| `sales_spend_xgb.joblib`          | sales_forecast       |
| `sales_spend_scaler.joblib`       | sales_forecast       |
| `le_store_type.joblib`            | sales_forecast       |
| `le_zone.joblib`                  | sales_forecast       |
| `churn_segment_rf.joblib`         | churn_segment        |
| `churn_scaler.joblib`             | churn_segment        |
| `churn_encoders.joblib`           | churn_segment        |
| `matching_lr.joblib`              | matching_score       |
| `matching_scaler.joblib`          | matching_score       |
| `matching_segment_medians.joblib` | matching_score       |
| `matching_encoders.joblib`        | matching_score       |
| `anomaly_isoforest.joblib`        | anomaly_detection    |
| `anomaly_scaler.joblib`           | anomaly_detection    |

Copy them once from the source package:

```powershell
Copy-Item -Path "C:\Users\notap\Downloads\ptg_ml\models\*.joblib" `
          -Destination "C:\Users\notap\OneDrive\Desktop\ptg-group-rental\agent\ml\service\models\"
```

---

## Setup

```bash
cd agent/ml/service
python -m venv .venv
.\.venv\Scripts\activate          # PowerShell
# source .venv/bin/activate       # bash
pip install -r requirements.txt
cp .env.example .env
# edit .env with SUPABASE_URL + SUPABASE_SERVICE_KEY
```

`SUPABASE_SERVICE_KEY` must be the **service role key**, not the anon
key — `ml_*` tables have deny-all RLS policies, only the service role
can write to them.

---

## Run

```bash
uvicorn main:app --reload --port 8000
```

Health probe:

```bash
curl http://localhost:8000/ml/health
```

Run all four models, write results, return a summary:

```bash
curl -X POST http://localhost:8000/ml/run-all
```

Run a single model:

```bash
curl -X POST http://localhost:8000/ml/forecast
curl -X POST http://localhost:8000/ml/churn
curl -X POST http://localhost:8000/ml/matching
curl -X POST http://localhost:8000/ml/anomaly
```

All POST endpoints return:

```json
{
  "model_version": "xgb_sales_v2.0",
  "rows_written": 4,
  "rows_skipped": 0,
  "generated_at": "2026-05-28T14:32:11Z",
  "notes": ["..."]
}
```

---

## How features are mapped from Supabase

The training data used synthetic column names — we map them onto the
real schema once in `inference/supabase_io.py`:

| Model expects        | Supabase source                                |
|----------------------|------------------------------------------------|
| `revenue`            | `store_monthly_pnl.revenue_thb`                |
| `rent`               | `store_monthly_pnl.rent_thb`                   |
| `visitors`           | `store_monthly_performance.traffic`            |
| `conv_rate`          | `store_monthly_performance.conversion_pct`     |
| `avg_spend`          | `store_monthly_performance.avg_basket_thb`     |
| `Store ID`           | `store_monthly_pnl.store_display_id`           |
| `Store Type`         | `retailer_profiles.category` (joined via app)  |
| `Zone`               | `stations.province`                            |
| `Station ID`         | `stations.display_id`                          |
| `est_rev`            | `station_monthly_metrics.est_revenue_k_thb*1k` |
| `base_rent`          | latest `station_units.price_thb` per station   |
| `total_area`         | sum of `station_units.area_sqm` per station    |
| `foot_traffic`       | `stations.traffic_level`                       |
| `Retailer ID`        | `retailer_profiles.id`                         |

Stations without a `zone` source use `province` as the proxy.

---

## Caveats

- **Anomaly z-score:** the training script's per-dimension `mu/std`
  weren't saved in the joblib bundle. We recompute them on the current
  inference batch — adequate signal, but not identical to training
  behaviour. Acceptable until a v3 retrain serialises those stats.
- **Matching:** trained on only 94 positive cases (AUC 1.0 is
  unreliable). Use scores as a ranking signal, not a probability.
- **`stn_type_enc` (station type) is approximated** from
  `stations.traffic_level` ("low"/"medium"/"high") because we have no
  source for the model's original station-type labels ("Highway",
  "City Center", etc). All values currently hit the safe-encode
  fallback (`0`), so station-type contributes ~no signal — match
  scores within a retailer's cohort vary mostly on zone / area / rent
  / est_rev. The cold-start median fill softens this, but a future
  schema field would tighten the model.
- **Cold start:** stores with < 2 months of history get
  `is_cold_start=True` and are filled with station-level averages
  (sales/anomaly) or `matching_segment_medians.joblib` (matching).
- **Unknown labels:** any `LabelEncoder` value not seen during training
  is mapped to class index `0`. We log a warning per occurrence.
- **Sales forecast skips orphan stores:** if a `store_monthly_pnl`
  row has no application linking it to a `retailer_profile`, the
  forecast row is skipped (counted in `rows_skipped`) because the
  `retailer_id` column has no plausible value.

---

## Verifying it works

1. Health:
   ```bash
   curl http://localhost:8000/ml/health
   ```
   Should report `supabase_ok: true` and `models_loaded: 14`.

2. Smoke test a single model first so you don't write garbage to all
   four tables:
   ```bash
   curl -X POST http://localhost:8000/ml/forecast
   ```
   Then check Supabase Studio → `ml_sales_forecasts` for a row whose
   `created_at` is recent.

3. After all four endpoints return `rows_written > 0`, hit
   `/api/retailer/ml` from the Next.js app and confirm the dashboard
   shows the new numbers.
