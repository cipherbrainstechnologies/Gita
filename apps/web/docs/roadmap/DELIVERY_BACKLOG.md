# Delivery backlog (owner, dependencies, measurable done criteria)

**Statuses:** PLANNED, IMPLEMENTING, QA, DONE, BLOCKED. Founder approves revenue launch. Engineering must update actual status/evidence when built.

| ID | Epic | Ownership | Priority | Definition of done | Initial status |
|---|---|---|---|---|---|
| E01 | Project foundation / CI / schema / migration | CTO | P0 | build/typecheck/test, Postgres migration verified | IMPLEMENTING (see evidence) |
| E02 | UX storefront/catalog/search/fit/product page | UX/FE | P0 | responsive, accessible, full real data & preorder labels | IMPLEMENTING (see evidence) |
| E03 | Google OAuth / auth sessions / admin invitation & roles | Full stack | P0 | admin route guard tests, role revoke, login | PLANNED |
| E04 | Quote source registry + 1k drafts import | Apparel/AI | P0 | attribution source, clear draft status, dedupe | PLANNED |
| E05 | AI design studio jobs + one-click worker | AI/BE | P0 | Redis queues, progress, retry, preview, cancel | PLANNED |
| E06 | Print quality tech packs, art layering, garment grading | Apparel/QA | P0 | vendor-signed artwork proof for each published style | BLOCKED: supplier |
| E07 | Approved product catalog + price/HSN | Ops/BE | P0 | CRUD, approval, tax/margin gate, immutable snapshots | PLANNED |
| E08 | Preorder cart/quote/checkout/discounts | BE | P0 | server-calculated totals, idempotent capacity | IMPLEMENTING (waitlist live-ready; paid flow BLOCKED on E09 webhook) |
| E09 | Razorpay adapter & webhooks/refunds | BE/Sec | P0 | sandbox replay and payment reconciliation tests | BLOCKED: account |
| E10 | Transactional email/invoice/credit note | Finance/BE | P0 | accountant-reviewed docs and delivery | BLOCKED: entity |
| E11 | Production batches and manufacturer SLAs | Ops | P0 | vendor confirmations, delay escalation, customer timeline | BLOCKED: supplier |
| E12 | Shipping/returns via Shiprocket | Ops/BE | P0 | actual AWB/tracking and returns events | BLOCKED: account |
| E13 | Admin design reviews & controls | UX/FE | P0 | gated approval/version history and rollback | PLANNED |
| E14 | Admin integration encrypted vault/health tests | Sec/BE | P0 | masked view, encrypt/rotate, audit, no logs | PLANNED |
| E15 | Consent/DPDP and privacy account | Legal/BE | P0 | signed off child flow, export/erasure, no child ads | BLOCKED: legal |
| E16 | Promo management + 30-day price snapshots | Growth/BE | P1 | categories, seasonal, partner, birthday eligible adult; no fake savings | PLANNED |
| E17 | WhatsApp + DLT SMS notifications | Ops/BE | P1 | verified templates and consent revocations | BLOCKED: provider |
| E18 | Customer support/grievance workflows | Ops | P0 | defined SLA, traceability, contact details | BLOCKED: entity |
| E19 | Reporting/contribution margin/reconciliation | Finance/BE | P1 | per-drop/size gross margin & refund metrics | PLANNED |
| E20 | POS proof of concept | Retail/BE | P2 | company-store receipts, state and stock transfers | PLANNED |
| E21 | Franchise contracts/commissions/settlements | Legal/BE | P3 | legally signed contracts & store separation | BLOCKED: legal |
| E22 | Brand trademark/domain/art rights | CEO/Legal | P0 | name cleared, source and provider licenses logged | BLOCKED: founder |
| E23 | Security/accessibility/perf disaster recovery | QA/Sec | P0 | all go-live gate evidence | PLANNED |
| E24 | Railway production deployment/observability | SRE | P0 | real deploy smoke and restore test | BLOCKED: Railway access |

**Release train:** Milestone 0 prototype/waitlist -> 1 vendor-verified preorder beta -> 2 full D2C -> 3 production optimisation -> 4 POS pilot -> 5 franchise beta. Do **not** bundle P3 franchise with P0 revenue gate just because vision includes it.

## Evidence notes (2026-11-15)

**E01 - IMPLEMENTING.** Done: prisma/migrations/20251115000000_init/migration.sql generated with `prisma migrate diff --from-empty --to-schema-datamodel` (36 tables incl. new `WaitlistLead`; `ProductVariant -> Product` FK; `migration_lock.toml`). SQL executed cleanly on a real PostgreSQL engine (PGlite/WASM): 36 tables, unique + FK constraints enforced. `npm run typecheck`, `npm run test` (55 tests), `npm run build` pass (see `docs/qa/RUN_LOG.md`). Railway artifacts: `railway.toml` (Nixpacks, healthcheck `/api/health`), multi-stage Node 22 `Dockerfile`, `Procfile` (web + worker). **Not done / DoD gap:** `prisma migrate deploy` has NOT been run against a live PostgreSQL server (no Postgres/Docker daemon available); CI still uses `npm install` and does not run a Postgres migration job.

**E02 - IMPLEMENTING.** Done: home/shop/PDP/checkout read `getCatalogProducts()`/`getProductBySlug()` (Prisma first, non-orderable sample fallback). `orderable` is true only for `status===PREORDER` with an enabled variant; PDP shows `PREORDER` vs `JOIN THE WAITLIST` accordingly; artwork text derives from the product record. Admin catalog lists DB products with status chips (read-only). Typography: Space Grotesk + DM Sans via `next/font`; brand ink/bone/lime unchanged. **Gaps:** no search, fit finder or size chart; no real product photography; no browser/accessibility audit run; admin catalog has no write path; catalog seed produces 5 concepts (`sampleConcepts` contains 5, not 6).

**E08 - IMPLEMENTING.** Done: `POST /api/checkout` stores an idempotent `WaitlistLead` (unique email+productSlug) and returns 202 when `ENABLE_CHECKOUT!=true` or the product is not orderable. With `ENABLE_CHECKOUT=true` for an orderable product: authenticated, `Idempotency-Key` required, atomic conditional capacity reservation, server-calculated paise totals, Razorpay order creation, order left `PAYMENT_PENDING` and **never** marked paid. Fails closed (503) without vault credentials, approved policy version, legal seller env or confirmed capacity. **Gaps:** this paid path has NOT been exercised against a database or Razorpay sandbox (only input schemas/mapping unit-tested); webhook (E09) is still 503 so no order can reach PAID; no reservation-expiry job; no carts/discounts; shipping is flat `SHIPPING_FLAT_PAISE` (default 0) pending a business decision; tax is extracted from tax-inclusive price and needs accountant sign-off; no rate limiting on the public waitlist endpoint.
