# Delivery backlog (owner, dependencies, measurable done criteria)

**Statuses:** PLANNED, IMPLEMENTING, QA, DONE, BLOCKED. Founder approves revenue launch. Engineering must update actual status/evidence when built.

| ID | Epic | Ownership | Priority | Definition of done | Initial status |
|---|---|---|---|---|---|
| E01 | Project foundation / CI / schema / migration | CTO | P0 | build/typecheck/test, Postgres migration verified | PLANNED |
| E02 | UX storefront/catalog/search/fit/product page | UX/FE | P0 | responsive, accessible, full real data & preorder labels | PLANNED |
| E03 | Google OAuth / auth sessions / admin invitation & roles | Full stack | P0 | admin route guard tests, role revoke, login | PLANNED |
| E04 | Quote source registry + 1k drafts import | Apparel/AI | P0 | attribution source, clear draft status, dedupe | PLANNED |
| E05 | AI design studio jobs + one-click worker | AI/BE | P0 | Redis queues, progress, retry, preview, cancel | PLANNED |
| E06 | Print quality tech packs, art layering, garment grading | Apparel/QA | P0 | vendor-signed artwork proof for each published style | BLOCKED: supplier |
| E07 | Approved product catalog + price/HSN | Ops/BE | P0 | CRUD, approval, tax/margin gate, immutable snapshots | PLANNED |
| E08 | Preorder cart/quote/checkout/discounts | BE | P0 | server-calculated totals, idempotent capacity | PLANNED |
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
