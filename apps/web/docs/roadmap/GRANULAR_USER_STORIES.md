# Detailed user stories and acceptance checks (M0–M4)

Each user story must have a DB contract, permission table, API handlers, UI states, telemetry events, tests, migration and evidence. Track subtasks in ClickUp/GitHub if connected; this file is the source-of-truth handoff.

## 01 — Identity / access (M0)
- US-101 Google login via OAuth; valid callback, refresh/revoke, logout, OAuth denial; rate-limited and secure cookie flags.
- US-102 Customer profile: voluntary phone, shipping addresses, opt-in consent event trail, account export/delete. Under-18 customer account disabled pending legal review.
- US-103 Admin invitation: superadmin explicitly provisions verified Google email; roles per capability; all privileged APIs check role at request time, not merely at UI.
- US-104 Signed-out visitors browse concept catalog; blocked from viewing any real customer records.

## 02 — Catalog / content (M0)
- US-201 Garment bases, fabric compositions, colorways, sizes and grades from actual supplier; snapshots for historic orders.
- US-202 Product lifecycle: CONCEPT → SAMPLE_PENDING → SAMPLE_APPROVED → PREORDER; approved-by, print asset, valid price/tax/size/supplier and capacity required to activate.
- US-203 Category pages men/women/unisex, tees/pants/gym; search, filter, sort, pagination, absent inventory badges, clear variant selectors; no inaccessible categories.
- US-204 Product pages factual art/fit details, origin, wash care, dispatch ETA, seller/contact/return info and truthful discounts.
- US-205 Admin revision history of art and product copy; old orders remain unchanged after price or artwork revision.

## 03 — Design studio (M1)
- US-301 Ingest 1,000 seed English phrase *drafts*; statuses separate from historic verified quotes; never public auto-publish.
- US-302 Batch generate 1–100 ideation jobs; queue idempotency, progress, retry/backoff, cancel and cost cap; exact/near-duplicate prevention.
- US-303 Provider selection API (diffusers/ComfyUI hosted or commercial image API), license registry and allowlisted remote hosts; image generation disabled if no credentials/rights.
- US-304 Studio visual review: artboard editable text layers, garment drape simulation, mockup zoom and placement dimensions; print file and supplier tech pack export.
- US-305 Editorial: translation source/quality/cultural sensitivity/legibility/trademark check; human reject/approve with reason.
- US-306 Final approval makes style available only after supplier proof sample, grade, costing, fulfilment window and legal policy.
- US-307 Artwork novelty guard with hash + semantic and perceptual duplicate review, model seed/prompt provenance, approved fonts and licensed visuals.

## 04 — Shopping & payments (M1)
- US-401 Persist cart, items, prices and discounts against stable variants; server recomputes amount incl. HSN, tax, shipping and discount cap.
- US-402 Preorder checkout has explicit checkbox, exact ship-window and terms snapshot, 18+ restriction/parent-approved flow, pincode serviceability, true seller.
- US-403 Secure payment gateway order and signed raw webhook receipt; replay-safe processing, reconciliation when redirect and webhook disagree, no purchase on unverified success.
- US-404 Pending/failed/cancelled/refunded payment handling; reconciliation daily; escalation of orphaned payments and chargebacks.
- US-405 Invoice/credit note with series/HSN, interstate IGST vs intrastate GST determined from legally configured addresses, correct fiscal triggers and immutable reprints.
- US-406 Partial cancellations/size exchanges, policy and consumer law gates, payment-provider refund reconciliation, no duplicate refunds.

## 05 — Production/fulfilment (M1)
- US-501 Supplier onboarding: validated bank/business and sample QC; production capacity mapped per SKU (separate from real stock).
- US-502 Paid order reserves capacity transactionally; batch by fabric/print method/size and supplier, with production order export/acknowledgement.
- US-503 Production status timeline and ETA change event with notification; block stale or fabricated shipping estimates.
- US-504 Print approval: immutable design revision, QC tests, rejected/defect units and remedial print route.
- US-505 Carrier serviceability, label/AWB, tracking webhooks and courier exception; return pickup and RTO.
- US-506 Customer support ticket, complaint SLA and internal escalation.

## 06 — Promotions and communications (M2)
- US-601 Seasonal/category/launch/partner/birthday promo engine, effective IST windows, unique redemption and per-customer controls, no stack-by-default and margin floors.
- US-602 Truthful crossed-out prior prices and 30-day lowest comparison logic ready for 2027 effective rules; exact compliance with counsel.
- US-603 Transactional messages for paid, production, delay, dispatch, delivery, refund, survey; opt-in templates and consent evidence for separate marketing. WhatsApp order updates need provider-approved templates.
- US-604 Product and creator affiliate link attribution, UTM conversion and approved, disclosed influencer economics; manual reversal for returned orders.
- US-605 Email deliverability and SMS DLT/WhatsApp unsubscribe, bounce/retry and idempotency, no promotions targeted to minors.

## 07 — Admin/security/metrics (M1–M2)
- US-701 Admin dashboard with real orders, GMV, return/refund backlog, margin, batch aging, gateway and messaging health; date filtering and timezone.
- US-702 Encrypted provider config, secret rotation, masked read, allowlisted provider form, test connection, audit actor/time; master Railway env never public.
- US-703 Product and collection management with revision diff/approval, role restrictions and bulk import/export.
- US-704 Payment-to-order-to-shipment and bank payouts reconciliation, weekly CSV exports for accounting.
- US-705 Fraud/anomaly protections, rate limits, backup/restore, alerts, support redaction and privacy retention.

## 08 — Retail/franchise (M3–M4)
- US-801 Company store pilot: register operators, POS login, physical stock ledger, receipt number, GST and payment tender, returns ledger, stock reconciliation.
- US-802 Transfer order from warehouse to store: two-sided in-transit/received signatures, discrepancies.
- US-803 Ship-to-store preorder and web-origin attribution vs retail-sale revenue with accurate merchant-of-record.
- US-804 Franchise partner contracts, regional territory, ownership of goods, royalty/commission settlement, statutory/tax handling and role segregations; activate after professional legal approval.
- US-805 Operational console franchise performance, returns, store stock variance, cash close and audit.

## 09 — QA/nonfunctional (all milestones)
- US-901 Order/payment exact-once replay, concurrent coupon, idempotent job and PO processing.
- US-902 Test 360/390/430/768/1024/1440 breakpoints, accessible focus/tabs/screen reader, image alt, reduced motion.
- US-903 CI lint, typecheck, unit/integration E2E, provider sandbox tests; track evidence by release.
- US-904 Load budgets and asset storage expiry; jobs cannot block storefront page render.
- US-905 Logging redaction, refund/payout anomaly monitors, backup drill and rollback.

## Exit criteria per release
M0: concept/waitlist only, no payments. M1: vendor-validated paid preorder D2C. M2: stable operation and truthful promotions/communications. M3: company retail POS. M4: franchise rollout only after agreements, accounting and pilot evidence.
