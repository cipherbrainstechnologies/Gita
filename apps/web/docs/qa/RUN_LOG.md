# Actual test run evidence — start here

2026-11-14: Kit authored offline. Node dependency installation unavailable in this packaging sandbox because the npm registry could not be resolved (`EAI_AGAIN`); therefore **no claim** that initial Next.js/Prisma app has compiled or integration tests passed. Static code and CSV uniqueness checks are documented at ZIP creation. Cursor must install, compile, run real tests and update this file with commands, outcomes and logs.

Static verification on 2026-11-14: `python3 scripts/verify_seed.py` PASS (exactly 1,000 verse drafts and 1,000 design briefs, unique fingerprints). `package.json` and `tsconfig.json` JSON parsed; Next page and API entrypoints present. `node --check eslint.config.mjs` and Python compilation pass. `tsc --noEmit` cannot meaningfully check the application before dependencies are installed; missing Next/React/@types/node types are expected. `npm install` attempted but blocked by npm registry DNS `EAI_AGAIN`. Cursor must rerun all tests with network and a real Postgres service.

## 2026-11-15 - commerce foundation (Windows, Node v26.5.0, Prisma 6.19.3; no PostgreSQL, no Docker daemon)

Commands actually run and results:
- `npx prisma validate` (dummy `DATABASE_URL`): PASS after adding `WaitlistLead`, `Product.collection/tagline/palette`, `Product.variants`/`ProductVariant.product` relation.
- `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script --output prisma/migrations/20251115000000_init/migration.sql`: PASS (regenerated after the relation was added; UTF-8 without BOM). `migration_lock.toml` written by hand (provider postgresql).
- Migration SQL executed in PGlite (real PostgreSQL WASM engine) in a temp dir outside the repo: 36 public tables, 1 FK, `WaitlistLead(email,productSlug)` unique and `ProductVariant.productId` FK enforced, inserts succeed. **`prisma migrate deploy` itself was NOT run** (no server DB).
- `npx prisma generate`: PASS.
- `npm run typecheck`: PASS (after deleting stale `tsconfig.tsbuildinfo` and raising `target` ES2017 -> ES2020, which pre-existing `bigint` literals require).
- `npm run test`: PASS, 7 files / 55 tests (new `src/lib/catalog.test.ts`: orderable gating, enabled-size listing, fallback without DB, stage flags, waitlist/order input schemas).
- `npm run build`: PASS (`next/font/google` fetched fonts online; lint errors in `Header.tsx`/`page.tsx` fixed).
- Smoke test via `next start` with no `DATABASE_URL` and an unreachable `REDIS_URL`: `GET /api/health` 200 `status:degraded, dbOk:false, redisOk:false, stage:preview`; `GET /api/products` 200 `source:sample, orderable:false`; `POST /api/checkout` waitlist 503 `WAITLIST_UNAVAILABLE` (nothing saved), unknown product 404, bad email 422; pages `/`, `/shop`, `/shop/less-proving`, `/checkout` 200, unknown slug 404.

NOT run (local): `npm run db:seed:catalog` against a DB, waitlist 202 against a DB, the `ENABLE_CHECKOUT=true` order path, Razorpay sandbox, Docker build, browser/accessibility checks.

## 2026-11-15 - Railway production smoke (project `verse-mode`)

Project: https://railway.com/project/911b8d56-a3cd-49af-b0e3-7283d61b4bd8  
Public: https://web-production-b2b81db7.up.railway.app

Evidence:
- Services SUCCESS: `web`, `worker`, `Postgres`, `Redis`.
- `npx prisma migrate deploy` applied `20251115000000_init` on Railway Postgres (web start logs).
- Worker logs: `[railway-entry] service=worker mode=worker` then `Verse Mode draft-assembly worker ready`.
- `GET /api/health` → `status:ok, dbOk:true, redisOk:true, checkoutEnabled:false, stage:preview`.
- `GET /`, `/shop` → 200.
- `railway ssh --service web -- npm run db:seed:catalog` → 6 CONCEPT products upserted (variants disabled).
- `GET /api/products` → `source:db, orderable:false`.
- `POST /api/checkout` waitlist → **202** WAITLISTED (no payment).

Still BLOCKED for revenue: Google OAuth credentials, Razorpay merchant + webhook secret, legal seller/GSTIN, approved policy versions, supplier sign-off, GPU host URLs for diffusers/FASHN.
