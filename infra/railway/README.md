# Railway wiring (Gita monorepo)

## Root Directory

| Service | Root Directory | Start |
|---------|----------------|-------|
| `web` | `apps/web` | `npx prisma migrate deploy && npm run start` (see `apps/web/railway.toml`) |
| `worker` | `apps/web` | `npm run worker` (no public domain; no healthcheck URL required) |

Do **not** set Root Directory to `kits/`, `vendor/`, or repo root unless you intentionally add a root orchestrator later.

## Linked resources

- PostgreSQL → `DATABASE_URL`
- Redis → `REDIS_URL`
- Object storage bucket → provider-specific env
- `INTEGRATION_MASTER_KEY` → Railway-only secret (never in DB or git)

## GPU

Railway `web` / `worker` call `GPU_INFERENCE_URL` (or equivalent) pointing at `services/gpu-inference` hosted on a GPU machine or managed inference API. Do not install CUDA/torch into the Next.js image.
