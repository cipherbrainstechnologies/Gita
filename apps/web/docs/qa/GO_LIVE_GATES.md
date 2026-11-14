# Non-negotiable launch gates

- [ ] Legal entity identity and GST/CA counsel review; policy pages specific to this entity are signed off, displayed and versioned at order acceptance.
- [ ] Original IP rights and supplier samples approved for every sellable print; no 1,000 synthetic ideations auto-published.
- [ ] Real garment measurements, manufacturer COGS and realistic preorder ship windows confirmed; no fake stock or estimated delivery claims.
- [ ] All public products have distinct images, composition, fabric, fit, model size, origin, return/cancellation explanation; mockups labelled.
- [ ] Real Google login and robust admin role restriction; pen-test critical paths and rate limits; secrets only DB encrypted or Railway env.
- [ ] Razorpay sandbox completed for paid, failed, duplicate webhook, out-of-order, pending, partial/full refund and reconciliation; live after KYC.
- [ ] Shiprocket real AWB & tracking, pincode and exception handling; notifications delivered in test and opt-out respected.
- [ ] Accurate GST rates, price histories, issued invoice numbering and credit note treatment verified with accountant.
- [ ] API + DB transaction race tests (coupon, preorder capacity, idempotency, concurrent payments); no negative capacity or duplicate charge.
- [ ] Under-18 audience handling audited, particularly personalised marketing/behavioural profiling and consent.
- [ ] UI WCAG AA baseline, mobile 360/390/430/768/1024/1440; Lighthouse budgets, images and LCP, real E2E purchases.
- [ ] Logs/alerts/backup restore exercise, incident rollback, support/grievance workflows operational.
- [ ] New e-commerce 2026 amendment effective **2027-01-01** addressed ahead of go-live.

Do not treat a green `npm run build` as commercial readiness.

## V2 media gate note (2026-11-15)

- [x] Quiet Power has **6** labelled AI-simulated views (front/back/side/detail/on-model/print-proof) + PDP checklist.
- [x] Karma has multi-view simulated photography with disclosure watermark (not physical sample proof).
- [ ] Simulated images replaced by photographed physical samples for every sellable SKU.
- [ ] Tech pack + sample sign-off recorded before PREORDER.

## Staging vs production checkout

- Staging/demo browsing: **allowed** with `checkoutEnabled:false` and DEMO_AUTH.
- Real-money checkout: **NO-GO** until every unchecked gate above is closed.
