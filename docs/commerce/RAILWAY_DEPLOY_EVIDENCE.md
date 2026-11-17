# Railway Medusa deploy evidence — 2026-11-16

| Item | Value |
|---|---|
| Git branch | `cursor/medusa-commerce-strangler-v1-295b` |
| Git commit | `a32cb78` (see latest on branch after build fix) |
| Railway project | `verse-mode` (`911b8d56-a3cd-49af-b0e3-7283d61b4bd8`) |
| medusa-api service | `5e1297fc-797a-4ee9-ba0c-b5f45083d75f` |
| medusa-worker service | `93629819-b9e7-4a9e-8a5b-d4ed19f57b15` |
| Postgres-Medusa service | `3863264c-a30e-44b4-ad8a-05f5fe7b4253` |
| Public Medusa URL | https://medusa-api-production-4a0e47aa.up.railway.app |
| Existing storefront | https://web-production-b2b81db7.up.railway.app/api/health → 200 |

## Tests (local, 2026-11-16 UTC)

```text
cd apps/web && npm run typecheck  # pass
cd apps/web && npm run test      # 147 tests pass
cd apps/commerce && npm run build # pass
```

## Smoke (post-deploy)

```text
curl -sS https://medusa-api-production-4a0e47aa.up.railway.app/health
curl -sS https://medusa-api-production-4a0e47aa.up.railway.app/store/gita/health
```

## GO / NO-GO

| Gate | Status |
|---|---|
| GO_CATALOG_ONLY (legacy Prisma storefront) | **GO** — unchanged default flags |
| GO_PAID_PREORDERS | **NO-GO** — Medusa cart/payments not cut over |
| Medusa staging healthy | **GO** — deploy `879980a9` (`d411417`); `/health` → OK; `/gita/health` → JSON |
| Known warnings | `Local Event Bus` until Redis module wiring; `/store/*` needs publishable key |