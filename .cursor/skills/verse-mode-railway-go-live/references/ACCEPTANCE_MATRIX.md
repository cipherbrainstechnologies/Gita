# Acceptance matrix (A–K)

Statuses: `MISSING` | `SCAFFOLD` | `IMPLEMENTED_UNTESTED` | `TEST_FAILED` | `VERIFIED_STAGING` | `VERIFIED_PRODUCTION` | `BLOCKED_EXTERNAL`

| ID | Pass when |
|----|-----------|
| A Studio | Durable queue + provenance + human approve; GPU remote or labelled sandbox; no auto-publish |
| B Gita/Quotes | Cited Sanskrit + source URL; interpretations labelled; quarantine unverified quotes; admin content list |
| C Storefront | Responsive shop/home/cart/waitlist; honest concept vs preorder; live HTTP verified |
| D PDP | Promoted SKUs: ≥6 labelled media views OR explicit missing-view checklist; fabric/GSM/fit disclosed as confirmed vs proposed; AI sims watermarked |
| E Accounts | Session account/orders; Google OAuth when keys present; DEMO_AUTH isolated |
| F Admin | RBAC every write; catalog/orders/studio/marketing/integrations usable by staff |
| G Razorpay | Adapter + HMAC webhook; never mark paid without verified event; sandbox E2E or BLOCKED_EXTERNAL |
| H Shipping/Billing | Adapter interface + fail-closed; outbox notifications; invoices only after fiscal readiness |
| I Franchise/POS | Company pilot only until legal; no false multi-vendor stock |
| J Railway | web+worker+Postgres+Redis; migrate; health; domain; SHA evidence |
| K QA | Unit/integration + live HTTP; evidence docs; GO_LIVE_GATES honest |

**Market checkout** remains NO-GO until GO_LIVE_GATES external rows clear.
