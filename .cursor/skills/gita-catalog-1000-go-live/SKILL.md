---
name: gita-catalog-1000-go-live
description: Execute 1,000 concept catalog import, paginated shop, on-model media gates, and ₹99 deposit preorder staging for Gita / VERSE//MODE.
---

# Gita 1,000 catalog go-live

1. Read `apps/web/START_HERE_CURSOR.md` and `apps/web/docs/qa/GO_LIVE_GATES.md`.
2. Apply migrations → `npm run db:seed:ideas` → `npm run db:seed:1000-concepts` → `npm run audit:1000-catalog -- --catalog-only`.
3. Never enable paid checkout without external gates in `docs/qa/REVENUE_GO_LIVE_GATES.md`.
4. Record proof in `docs/qa/IMPLEMENTATION_EVIDENCE.md` and counts in `docs/roadmap/CATALOG_1000_PROGRESS.md`.