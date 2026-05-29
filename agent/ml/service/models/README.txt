This folder holds the joblib model files. The ML service loads them at
startup via inference/load_models.py.

REQUIRED ACTION before first run:

    Copy-Item -Path "C:\Users\notap\Downloads\ptg_ml\models\*.joblib" `
              -Destination ".\models\" -Force

(Run that from the agent/ml/service/ directory in PowerShell.)

Expected files (14 total):

    sales_revenue_xgb.joblib
    sales_spend_xgb.joblib
    sales_spend_scaler.joblib
    le_store_type.joblib
    le_zone.joblib
    churn_segment_rf.joblib
    churn_scaler.joblib
    churn_encoders.joblib
    matching_lr.joblib
    matching_scaler.joblib
    matching_segment_medians.joblib
    matching_encoders.joblib
    anomaly_isoforest.joblib
    anomaly_scaler.joblib

The service will start without them (so /ml/health is still reachable
for diagnosing setup problems), but every POST endpoint will return
rows_written: 0 with a note explaining which file is missing.
