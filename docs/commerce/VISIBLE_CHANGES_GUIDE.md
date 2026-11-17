# What you can see after Medusa strangler deploy

**Railway project:** [verse-mode](https://railway.com/project/911b8d56-a3cd-49af-b0e3-7283d61b4bd8?environmentId=e6273fd9-17e0-4679-8d9c-ad4ebe0bec36)  
**Storefront:** https://web-production-b2b81db7.up.railway.app  
**Medusa API:** https://medusa-api-production-4a0e47aa.up.railway.app  

---

## A. Visible in the browser (customer-facing)

| What | URL / how to check | Notes |
|------|-------------------|--------|
| **Dynamic sitemap** | https://web-production-b2b81db7.up.railway.app/sitemap.xml | Lists `/`, `/shop`, product PDPs (capped), policies |
| **robots.txt** | https://web-production-b2b81db7.up.railway.app/robots.txt | Blocks `/admin`, `/api`, `/checkout`, `/cart` from crawl when not in preview noindex mode |
| **PDP SEO** | Any `/shop/[slug]` → View Page Source | Unique `<title>`, `canonical`, Open Graph; **Product JSON-LD** when eligible |
| **Shop UX** | `/shop`, PDP | **Unchanged shopping data** while `MEDUSA_CATALOG_READ=false` — still Prisma/catalog as before |

Checkout, cart, admin, AI studio: **same behavior** until Medusa cart cutover.

---

## B. Visible in Railway dashboard

| Service | Root directory | Role |
|---------|----------------|------|
| **web** | `apps/web` | Next.js storefront (branch `cursor/medusa-commerce-strangler-v1-295b`) |
| **worker** | `apps/web` | BullMQ creative worker |
| **medusa-api** | `apps/commerce` | Medusa HTTP + Admin |
| **medusa-worker** | `apps/commerce` | Medusa jobs (`MEDUSA_WORKER_MODE=worker`) |
| **Postgres** | — | Gita Prisma DB |
| **Postgres-Medusa** | — | Isolated Medusa DB |
| **Redis** | — | Shared queues |

**Web env (new):** `MEDUSA_BACKEND_URL`, `MEDUSA_CATALOG_READ=false`, `COMMERCE_BACKEND=legacy`, `APP_BASE_URL`

**Medusa health:** https://medusa-api-production-4a0e47aa.up.railway.app/health → `OK`  
**Gita probe:** https://medusa-api-production-4a0e47aa.up.railway.app/gita/health → JSON

---

## C. Visible in the repo (not all user-visible until flags flip)

### New top-level app

```
apps/commerce/          # Medusa v2 backend
  src/modules/gita-bridge/
  src/api/gita/health/
  medusa-config.ts + medusa-config.js
  Dockerfile, scripts/railway-entry.mjs
```

### Storefront integration (`apps/web`)

```
src/lib/commerce/       # flags, Medusa client, catalog adapter, gateway
src/lib/seo/product-jsonld.ts
src/app/sitemap.ts
src/app/robots.ts
src/app/shop/[slug]/page.tsx   # generateMetadata + JSON-LD
scripts/medusa-shadow-catalog-export.ts
.env.example                   # MEDUSA_* vars
```

### Docs / memory

```
docs/commerce/MEDUSA_GAP_MATRIX.md
docs/commerce/RAILWAY_DEPLOY_EVIDENCE.md
docs/commerce/VISIBLE_CHANGES_GUIDE.md  (this file)
memory-bank/decisions.md               # Decision #010
memory-bank/architecture.md              # Medusa row
infra/railway/README.md                  # medusa-* services
```

---

## D. What changes when you flip flags (staging only)

| Variable | Effect when `true` |
|----------|-------------------|
| `MEDUSA_CATALOG_READ` | PLP/PDP read Medusa Store API first (fallback legacy) |
| `MEDUSA_SHADOW_COMPARE` | Server logs legacy vs Medusa count diff (not shown to users) |
| `COMMERCE_BACKEND=medusa` | Full backend mode (later cutover; not for production yet) |

**Store API** needs `MEDUSA_PUBLISHABLE_KEY` on **web** (from Medusa Admin → Settings → API keys) before catalog read works.

---

## E. Medusa Admin (operators)

After bootstrap, open: https://medusa-api-production-4a0e47aa.up.railway.app/app  
Create staff user on first visit; manage products, keys, regions (India seed on deploy).

PR: https://github.com/cipherbrainstechnologies/Gita/pull/6