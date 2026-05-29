# Restore the demo state

The demo's **applications + tenant_leases** get wiped by the periodic reset
(the truncate of apps/leases/notifications). The retailer↔landlord tenant
linkage and the decision demo depend on them. After any reset, re-run these
seeds **in order** to restore the full demo:

1. `012_event_knowledge_v2.sql` — store-type event knowledge (Apr/May).
2. `013_demo_applications_full.sql` — applications + leases + unit availability
   (decision demo 9001–9003, Lumina's 4 storefronts, other tenants). **This is
   the one that restores the landlord tenants + storefronts.**
3. `015_more_tenants.sql` — 9 extra tenant businesses + units + leases so each
   landlord station shows ~3 tenants (run after 013).
4. `014_store_differentiation.sql` — makes each store genuinely different by type
   (segments, origins, churn, anomalies, hourly, conversion/basket). **Re-run
   this AFTER any ML cron run**, which overwrites churn/anomaly/forecast with the
   model's uniform output.

Also ensure the demo retailer profile name is set (the reset can revert it):
```sql
UPDATE retailer_profiles SET business_name='Lumina Retail Group',
  category='Multi-format F&B & Retail', num_stores='4'
WHERE id='55555555-0000-0000-0000-000000000001';
```
