# Prisma schema and migration policy

`prisma/schema.prisma` is a reference relational schema; it has intentionally not been migrated or verified against a live database during ZIP packaging. Cursor should run `npx prisma validate`, review each relation/key, create the first migration using a throwaway local PostgreSQL (`npx prisma migrate dev --name init`), commit `prisma/migrations` to repo, then use `npx prisma migrate deploy` on Railway.

Seed `data/verses_1000_drafts.csv` and `data/design_briefs_1000.csv` only into non-public creative datasets. Do not auto-publish, create sellable variants or use seed preview prices as live offers. For launch, only approved designs enter Product with manufacturer proof and valid preorder capacity. On migrations use expand-and-contract for risky schema changes. Ensure monetary fields stay bigint paise and all API views convert to JSON safe strings or decimal INR.

A database unique fingerprint prevents *exact* duplicate concepts. Near-duplicate and visual similarity require separate calibrated checks; do not present unique hashes as 100% originality guarantees.

## Status (2026-11-15)
Initial migration `20251115000000_init` is committed (generated with `prisma migrate diff`; verified on a PostgreSQL-compatible engine, not yet via `migrate deploy` on a server). Deploy with `npx prisma migrate deploy` (the Railway start command does this). Seed demo concepts with `npm run db:seed:catalog` (CONCEPT, `enabled=false`, idempotent, never overwrites status/price/enabled on re-run). Future schema changes: `npx prisma migrate dev --name <change>` against a local Postgres.
