# Medusa v2 gap matrix — 2026-11-16

Baseline Git: `main` @ `f23a5e9` · Branch: `cursor/medusa-commerce-strangler-v1-295b`

| Domain | Status | Evidence | Priority |
|---|---|---|---|
| Medusa foundation (`apps/commerce`) | **MIGRATED (skeleton)** | `apps/commerce/medusa-config.ts`, custom `gita-bridge` module, Railway entry | P0 |
| Storefront adapter | **PARTIAL** | `apps/web/src/lib/commerce/*`, flags default `legacy` | P0 |
| Catalog shadow import | **PARTIAL** | `medusa-shadow-catalog-export.ts`, `gita-catalog-import.ts` dry-run | P0 |
| Cart/checkout cutover | **NOT_IMPLEMENTED** | Legacy Prisma cart remains canonical | P0 |
| Payments (Razorpay) | **PARTIAL** | Existing web webhooks; Medusa provider not wired | P0 |
| CRM 360 | **PARTIAL** | Prisma customer + gates in `gita-bridge`; no journeys | P1 |
| SEO | **PARTIAL** | `sitemap.ts`, `robots.ts`, PDP metadata + Product JSON-LD | P0 |
| Railway staging | **IN_PROGRESS** | `medusa-api` / `medusa-worker` services (this PR) | P0 |

Legend: **WORKING** | **PARTIAL** | **NOT_IMPLEMENTED** | **BLOCKED** | **MIGRATED** | **RETIRED**