# VERSE//MODE / Gita — Product Implementation Status

**For handoff to GPT or another agent.**  
**Updated:** 2026-11-15  
**Repo:** `Gita` monorepo · Deployable app: `apps/web`  
**Live URL:** https://web-production-b2b81db7.up.railway.app/  
**Branch for this V2 storefront work:** `feat/v2-storefront-content`  
**Parallel work:** Another agent owns Admin/Staff CRUD, demo auth, cart demo — do not overwrite `src/modules/admin/**`, `DemoCredential`, demo migrations, or admin API trees without coordinating.

---

## 1. What the product is

India-first **preorder** streetwear commerce under working brand **VERSE//MODE**.  
Zero bulk inventory. Concepts → sample/supplier gates → PREORDER only.  
Never fabricate scripture; never claim AI mockups are physical samples; never copy The Souled Store IP.

---

## 2. Monorepo layout

| Path | Role |
|------|------|
| `apps/web` | Next.js 15 commerce + API + BullMQ worker (Railway Root Directory) |
| `services/gpu-inference` | FastAPI adapters for Diffusers + FASHN VTON (external GPU) |
| `vendor/diffusers`, `vendor/fashn-vton-1.5` | Upstream submodules |
| `kits/verse-mode-cursor` | Non-deploy kit pointer |
| `memory-bank/` | Architecture decisions |
| `apps/web/docs/Version 2/` | V2 ZIP archive (reference); **merged into live app**, not the deploy root |

---

## 3. Implemented (customer)

| Area | Status | Notes |
|------|--------|-------|
| Home / shop grid | Working | USP chips DESIGNER TEE / DESIGNER TRACK; hover back view |
| PDP `/shop/[slug]` | Upgraded | Gallery + honest empty state; waitlist vs preorder |
| **USP designer garments** | **Live on Railway** | Unique flat-lay per SKU (`cpu-designer-flatlay-v5`); mindset print on designer tee + track pant; no shared KARMA plate |
| Quiet Power media | Done (simulated) | `/images/quiet-power-editorial-*.webp` |
| Karma Action media | Done (simulated) | V2 karma editorial webps (editorial only; shop cards use per-SKU flat-lay) |
| `/inspiration` verse library | Done (draft) | 5 cited Gita passages + original slogans |
| Cart / account / orders / size-chart / contact | Present (other agent) | DB-backed where configured |
| Checkout | Waitlist + gated paid path | Paid only if PREORDER + `ENABLE_CHECKOUT` + capacity + vault |
| Auth | Auth.js Google + optional DEMO_AUTH | Demo is not production identity |

---

## 4. Implemented (admin / ops) — respect parallel agent

| Area | Status | Owner note |
|------|--------|------------|
| Command center dashboard | Working | Other agent modules |
| Catalog CRUD / status gates | Working | Other agent |
| Studio jobs + approvals | Working | Other agent + worker |
| Integrations vault + test | Working | Other agent |
| Marketing / franchise pilot | Scaffold | Other agent |
| **Content library `/admin/content`** | **Added this session** | Additive |
| **Collections `/admin/collections`** | **Added this session** | Additive |

---

## 5. Data & migrations

- `20251115000000_init` — core commerce schema  
- `20251115010000_cart_demo` — cart / outbox (other agent)  
- `20251115020000_demo_credentials` — demo login (other agent)  
- **`20251115030000_v2_content_library`** — ContentSource, ContentPassage, ContentLocalization, ApparelTechPack, ProductMediaV2, ContentApprovalAudit  

Seed: `npm run db:seed:v2-content` (from `apps/web`).

---

## 6. AI / GPU

- Worker: draft assembly + optional Diffusers enrich (sandbox or remote GPU URL).  
- Pipeline stage list: `src/lib/studio-pipeline.ts` (full V2 chain documented; not every stage persisted yet).  
- FASHN / Diffusers HTTP adapters: `services/gpu-inference/adapters/*`.  
- Railway web container must **not** run Torch.

---

## 7. Explicitly NOT done / NO-GO for real payments

- Physical sample + supplier tech pack sign-off  
- Native linguistic/cultural approval of HI/GU (and other) drafts  
- Counsel-approved policies + legal entity / GSTIN  
- Razorpay live KYC + webhook production proof  
- Shiprocket / SMS / WhatsApp live templates  
- Photographed physical product replacing AI simulations  
- Franchise full POS  

**Final decision: NO-GO for accepting real customer payments.**

---

## 8. How to run locally

```bash
cd apps/web
npm install
cp .env.example .env
npx prisma migrate deploy   # needs Postgres
npm run db:seed:v2-content
npm run dev
# optional worker: REDIS_URL=... npm run worker
```

Key routes: `/`, `/shop`, `/shop/quiet-is-a-power-move`, `/shop/karma-action-oversized-tee`, `/inspiration`, `/admin`, `/admin/content`.

---

## 9. Railway

- Root Directory: **`apps/web`**  
- Services: `web` + `worker` + Postgres + Redis  
- After deploy: `prisma migrate deploy`, then seed V2 content  
- Health: `/api/health`  

---

## 10. Files touched in V2 storefront pass (high signal)

- `apps/web/src/lib/catalog.ts`, `catalog.test.ts`, `collections.ts`, `studio-pipeline.ts`, `verse-library.ts`  
- `apps/web/src/app/shop/[slug]/page.tsx`, `inspiration/page.tsx`  
- `apps/web/src/components/EditorialGallery.tsx`, `ProductCard.tsx`, `Header.tsx`, `Footer.tsx`  
- `apps/web/src/app/admin/content/page.tsx`, `collections/page.tsx` (+ links on admin home)  
- `apps/web/public/images/*`  
- `apps/web/data/v2/*`, `docs/v2/*`, QA/roadmap docs  
- `apps/web/prisma/schema.prisma` + migration `20251115030000_v2_content_library`  
- `apps/web/scripts/seed-v2-content.ts`  

---

## 11. USP visual ops (2026-11-15)

- Branch merged to `main`: `feat/usp-designer-mindset-garments`  
- Renderer: `cpu-designer-flatlay-v5` — always FLATLAY (no shared on-model plate)  
- Re-register on Railway: `npm run visuals:designer` / `npx tsx scripts/reregister-designer-visuals.ts --limit=120 --force`  
- Last run: **120 registered, 0 failed**, `usp: DESIGNER_GARMENT_WITH_MINDSET_PRINT`  
- Live smoke: `/shop` shows DESIGNER TEE/TRACK + Wear the mindset; `/api/catalog/on-model/...` returns unique webp flat-lays  

## 12. Next recommended sprint

1. Persist studio pipeline stages on `JobRun`.  
2. Upload ProductMediaV2 to object storage with approval flags.  
3. Language reviewer workflow for ContentLocalization.  
4. Keep Admin/Staff agent changes; merge carefully.  
5. Payments remain **NO-GO** until sample + counsel + Razorpay live gates.
