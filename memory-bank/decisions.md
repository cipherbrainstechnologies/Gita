# Decision evolution log

### Decision #001 – Gita is the product monorepo; kit is not Railway root

- Date: 2026-11-15
- Author: Love Chauhan (CTO direction via Agent)
- Summary: Treat `Gita` as the only company workspace. Promote `VERSE_MODE_Cursor_Kit` → `apps/web` as the deployable commerce app. Keep Cursor kit semantics under `kits/verse-mode-cursor` as non-deploy reference. Place `diffusers` and `fashn-vton-1.5` under `vendor/` as pinned upstream submodules for the GPU service.
- Reason: Flat three-repo dump mixes blueprint, product, and GPU libraries; Railway and agents need a single clear deploy root and naming boundary.
- Affected Modules: Repository layout, Railway `rootDirectory`, GPU integration path, Cursor memory-bank
- Reversal Conditions: Only if product splits into multiple git remotes with separate ownership; then convert `apps/web` and `services/gpu-inference` to publishable packages, keep vendors as submodules.
- Status: Active

### Decision #002 – Modular monolith on Railway; GPU out-of-process

- Date: 2026-11-15
- Author: Architecture (kit ARCHITECTURE.md + CTO)
- Summary: First production iteration remains Next.js + Prisma + Redis worker modular monolith. GPU inference is a separate service wrapping vendor models.
- Reason: Launch complexity and cost; Railway web is not a GPU host.
- Affected Modules: `apps/web`, `services/gpu-inference`, `vendor/*`
- Reversal Conditions: Sustained need for independently scaled domain services (orders, studio, franchise) with separate teams.
- Status: Active

### Decision #003 – ScriptAssist Agent-007 stack does not apply to VERSE//MODE

- Date: 2026-11-15
- Author: Agent-007 mode with product override
- Summary: Do not impose Bun/Mantine/React Router v7/Orval on this repo. Stack remains Next.js App Router as locked in kit.
- Reason: Different product; kit already scaffolds Next.js commerce.
- Affected Modules: Frontend architecture guidance
- Reversal Conditions: Explicit migration PR approved by product owner.
- Status: Active

### Decision #004 – Railway web+worker share image; route via RAILWAY_SERVICE_NAME

- Date: 2026-11-15
- Author: SRE / Agent
- Summary: Both Railway services deploy from `apps/web` with start `node scripts/railway-entry.mjs`. Entry detects `worker` in `RAILWAY_SERVICE_NAME` and runs BullMQ; otherwise migrate + Next start.
- Reason: Nixpacks/Procfile + shared CaC otherwise launched Next on the worker.
- Affected Modules: `apps/web/scripts/railway-entry.mjs`, `railway.toml`, Dockerfile, Procfile
- Reversal Conditions: Separate Docker images per process with independent start commands.
- Status: Active

### Decision #005 – Vendor GPU repos are adapters, not Railway services

- Date: 2026-11-15
- Author: Architecture
- Summary: `vendor/diffusers` and `vendor/fashn-vton-1.5` are consumed only by `services/gpu-inference` HTTP adapters. Commerce worker calls them over HTTPS when configured; otherwise labelled sandbox simulations.
- Reason: GPU cost/licensing; Railway CPU containers must not pretend to render production art.
- Affected Modules: providers, gpu-inference, worker
- Reversal Conditions: Managed GPU product on Railway with verified CUDA capacity.
- Status: Active

### Decision #006 � Customer account UX, DB cart and demo flags

- Date: 2026-11-15
- Author: Agent (customer UX task)
- Summary: Added `/account`, `/orders` (real data), `/account/waitlist`, `/cart`, `/size-chart`, `/contact`, `/api/cart`, session-scoped `GET /api/orders`. New layered modules under `apps/web/src/modules/{orders,cart,notifications,account}` (route/page = controller, `*.service.ts`, `*.repository.ts`). Schema: new `CartItem` (intent only: customerId, productSlug, size, quantity; unique per customer+slug+size; no price, no reservation) and additive nullable `NotificationOutbox.destination/payload` (migration `20251115010000_cart_demo`; `migrate deploy` required). Demo surfaces are controlled by `DEMO_AUTH` (server) and `NEXT_PUBLIC_DEMO_MODE` (public); they only affect UI hints/banners and the no-op outbox sender (`SENT_DEMO`). Authorisation stays server-side (`auth()` on every page/API).
- Reason: Customers need to view orders/waitlist and preorder end-to-end; cart is deliberately price-free so checkout (server) remains the sole source of totals and capacity.
- Affected Modules: `prisma/schema.prisma`, `/api/checkout` (enqueues outbox only), `/api/orders`, `/api/cart`, login, PDP, policies
- Reversal Conditions: Replace `CartItem` with multi-line order drafts if multi-item checkout is built; drop demo flags once real auth/email are live.
- Status: Active

### Decision #007 - Staff/admin surfaces: one gate, layered modules, fail-closed demo switches

- Date: 2026-11-15
- Author: Agent (staff/admin task)
- Summary: Admin write APIs live under `apps/web/src/modules/admin/<area>/` as `*.schema.ts` (zod) -> `*.rules.ts` (pure, client-safe, unit-tested) -> `*.service.ts` (orchestration + audit) -> `*.repository.ts` (Prisma, accepts a transaction client). Route handlers under `src/app/api/admin/**` are thin controllers wrapped by `staffRoute` (`modules/admin/shared/http.ts`): the staff gate (`requireAdmin(roles)` in `src/lib/admin.ts`, DB-backed on every request) runs before body parsing; non-staff 403; unverifiable authorisation 503; JSON content-type required (CSRF hardening); domain errors map to `{error:{code,message}}`. Role matrix is centralised in `modules/admin/shared/permissions.ts`. Pages use `gateAdmin` (ok/forbidden/unavailable). `DEMO_AUTH==='true'` is the only demo switch and unlocks exactly three things, each audited: PREORDER without confirmed capacity (checkout still refuses orders without real capacity), approving simulation-only designs, creating a COMPANY pilot store. Refunds only create `Refund(PENDING_APPROVAL)` + order `REFUND_PENDING`; no provider call. Promotions are stored but NOT yet applied at checkout.
- Reason: Admin was read-only scaffold; money, stock and publication decisions need server-enforced gates, audit trails and no fake success.
- Affected Modules: `src/lib/admin.ts`, `src/modules/admin/**`, `src/app/api/admin/**`, `src/app/admin/**`, `src/components/admin/**`, `Header` (Staff link), `IntegrationControls`, `vitest.config.ts` (adds `@/` alias)
- Reversal Conditions: Replace role matrix with an invitation/RBAC admin UI (E03); replace demo switches once real supplier capacity and POS flows exist.
- Status: Active

### Decision #008 — 1,000 concept SKUs vs paid preorder gates

- Date: 2026-11-15
- Author: Cloud agent (CURSOR_EXECUTE_1000_PRODUCTS)
- Summary: Import 1,000 `DesignBrief` rows into `Product` as `CONCEPT` with six disabled variants via idempotent seed; paginate `/shop` (30/page); stage ₹99 deposit via `DepositPolicy` and `PaymentIntentType.DEPOSIT` with default fail-closed (`enabled=false`, `ENABLE_DEPOSIT_CHECKOUT` off). No SKU becomes payment-eligible without PREORDER + enabled variant + external revenue gates.
- Reason: Honest browse-scale catalog without pretending imagery, supplier proof or live charges are ready.
- Affected Modules: `apps/web/prisma`, `scripts/seed-1000-product-concepts.ts`, `src/lib/catalog.ts`, `src/lib/checkout.ts`, deposit webhook
- Reversal Conditions: Only after GPU media QA, supplier approvals, and legal/Razorpay sign-off documented in `docs/qa/REVENUE_GO_LIVE_GATES.md`.
- Status: Active
