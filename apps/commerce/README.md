# Gita Medusa commerce (`apps/commerce`)

Medusa v2 headless backend for VERSE//MODE. The public storefront remains `apps/web`; this service owns canonical commerce after strangler cutover.

## Local

```bash
cd apps/commerce
cp .env.example .env
# Set DATABASE_URL to an isolated database (never the Prisma `verse_mode` schema)
npm ci
npm run db:generate
npm run db:migrate
npm run seed:india
npm run dev
```

## Railway

- Create two services with **Root Directory** `apps/commerce`: `medusa-api` and `medusa-worker`.
- `medusa-api`: `MEDUSA_WORKER_MODE=server`, public domain, health `/health`.
- `medusa-worker`: `MEDUSA_WORKER_MODE=worker`, `DISABLE_MEDUSA_ADMIN=true`, no public domain.
- Link dedicated Postgres + shared Redis (separate logical DB + key namespace).

## Custom modules

- `gita-bridge`: `ExternalResourceMap`, `CreativePublicationGate` for Gita ↔ Medusa ID mapping and publication gates.