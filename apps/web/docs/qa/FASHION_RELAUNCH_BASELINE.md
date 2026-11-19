# Fashion relaunch baseline

- **Git HEAD:** `60c07f506a7eadb630492a151a68ffc507778188`
- **Generated:** 2026-11-19T21:40:06.456Z
- **Production URL (expected):** https://web-production-b2b81db7.up.railway.app/shop

## Catalog counts (Prisma)

| Metric | Value |
|--------|------:|
| Active products | 0 |
| displaySaleReady | 0 |
| Approved storefront media rows | 0 |
| Tees | 0 |
| Pants | 0 |
| PREORDER status | 0 |

## P0 gaps tracked

1. Licensed on-model pants photography (waist-to-ankle) — flat-lay / composite until commissioned.
2. Medusa catalog read requires `gita_*` metadata + Prisma enrichment (adapter shipped in fashion relaunch branch).
3. Payment/checkout remains `ENABLE_CHECKOUT=false` until business gates — interest-only path on PDP.
4. Demo credentials must stay off in production (`DEMO_AUTH` unset).

## Verification commands

```bash
cd apps/web && npm run typecheck && npm run test && npm run build
```
