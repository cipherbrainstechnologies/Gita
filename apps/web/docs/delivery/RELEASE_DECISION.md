# Release decision

**Date:** 2026-11-14  
**Production web deploy:** CLI `railway up` (catalog branch)  
**Checkout:** `ENABLE_CHECKOUT` false; `DepositPolicy.enabled` false  

## GO

- Public catalog browsing with 1,000+ concept URLs  
- Generated on-model preview imagery (template-based attach; per-SKU GPU pipeline optional)  
- Admin command center metrics from live Postgres  

## NO-GO

- **Live customer deposits or full payments** — Razorpay merchant, GST/legal seller, supplier-confirmed capacity, counsel-approved policies, and per-SKU manufacturing proof not verified  
- Claiming 2,000 unique photographed samples — current attach uses approved template previews until GPU batch completes  

Operator: merge PR, deploy, run `npm run db:attach:concept-gallery` on production via SSH, re-run `npm run audit:1000-catalog`.