# System architecture & data invariants

## Decisions
Monorepo (first production iteration): Next.js App Router (SSR & API, React/TypeScript); Prisma/PostgreSQL for authoritative business state; Auth.js Google OIDC for customer identity; BullMQ/Redis queue worker process separate from web; S3-compatible Railway storage bucket for product assets; Razorpay payments, Shiprocket shipments, transactional email and Meta WhatsApp/India DLT SMS in separate adapters. Admin forms write encrypted settings to Postgres (AES-256-GCM); master key remains env in Railway. All operations idempotent with provider request IDs, retry strategy and outbox. Prefer a modular monolith over microservices to reduce first-launch complexity.

## Railway services
`web` (public Next) -> `Postgres` (private), `Redis` (private), `Bucket`, `worker` (no public domain), external payment, shipping, email/SMS/WhatsApp and cloud GPU providers. Separate preview and production project/environment; never deploy production secrets to PR previews. `worker` and web built from same repo but different start commands; health `/api/health`; database migration pre-deploy. Weekly backup + restore drill. Slow tasks never run as HTTP response.

## Data model principles
- `designIdea` vs `designVersion` vs `ProductStyle` vs `ProductVariant` vs `PhysicalInventory` vs `PreorderCapacity` distinct. Concept != stock.
- Orders store immutable snapshots of price, discount, tax/HSN, shipping, product description, size, supplier promised window, accepted legal-policy version, legal seller and fulfillment location.
- Money: bigint paise, all totals derived server side, no floats for money, negative values guarded, tax rounding controlled by accountant-reviewed unit tests.
- Every payment event and fulfillment event unique by provider/event ID, raw redacted payload stored with hash; no fulfilment until paid verification.
- Promotion limits transactional DB counters and variant price histories, including lowest historical price in previous 30 days where required.
- Admin Integrations encrypted credentials: `{provider, credential_key, ciphertext, iv, auth_tag, version, key_id, updated_by}`. Encryption key never stored with encrypted credential. Do not return ciphertext, API secrets, request logs or access tokens to client.
- Inventory ledger is append-only stock events with reservations and transfers; store on-hand never inferred from preorder capacity. Separate franchises via store_id and ownership.
- Customer personal data encrypted as appropriate, retention schedules, consent purpose/version/date, delete/export controls and appropriate child restrictions. Log only opaque IDs.
- Observability: structured logs, per-request correlation IDs, payment/webhook metric, audit log, redaction, alarms, job cost meter and retries.

## Checkout state machine
`CART -> PRICE_LOCKED -> PAYMENT_INITIATED -> PAYMENT_PENDING -> PAID -> VENDOR_CONFIRMED -> PRODUCTION -> QC -> READY_TO_SHIP -> SHIPPED -> DELIVERED`. Exceptions `PAYMENT_FAILED`, `CANCEL_REQUESTED`, `CANCELLED`, `REFUND_PENDING`, `REFUNDED`, `LOST`, `RTO`. Explicit allowed transitions, optimistic concurrency `version`, admin override requires reason and 2nd approver for refunds > threshold.

## Critical failure scenarios
Browser says paid but signed webhook absent -> `PENDING`, reconcile via provider API. Duplicate webhook -> replay 200, no duplicate event. Payment accepted after cancelled order -> reconcile/refund path. Supplier not ready -> no charge. Refund requested after printing -> follow disclosed policy and consumer law. Same design generated twice -> DB unique collision. Printer rejects 3pt line -> proof fail; not publish. OTP/messaging unavailable -> order remains valid and notification retries; no secret leak.

## Security
OWASP ASVS baseline; CSRF/session cookie flags, OAuth state/nonce checks delegated to Auth.js, CSP and restrictive asset domains, rate-limit checkout/admin/webhooks, zod validation, max file size and MIME sniffing, private object URLs for print originals, antivirus scanning as provider permits, SSRF-restricted adapters, webhook timestamp/replay prevention, change-control and backups. Admin access is **database role + verified Google email**, not any valid Gmail. Multi-factor for administrators via Google account policy where possible. Do not implement open registration for admin.
