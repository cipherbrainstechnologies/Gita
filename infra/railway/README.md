# Railway wiring (Gita monorepo)

**Live project:** [verse-mode](https://railway.com/project/911b8d56-a3cd-49af-b0e3-7283d61b4bd8)  
**Public web:** https://web-production-b2b81db7.up.railway.app  
**Health:** https://web-production-b2b81db7.up.railway.app/api/health

## Services (production)

| Service | Role | Start |
|---------|------|-------|
| `web` | Next.js storefront + API | `node scripts/railway-entry.mjs` → migrate + `next start` |
| `worker` | BullMQ studio assembler | same entry → `npm run worker` when `RAILWAY_SERVICE_NAME` contains `worker` |
| `medusa-api` | Medusa HTTP + Admin | `apps/commerce` → `node scripts/railway-entry.mjs` (`MEDUSA_WORKER_MODE=server`) |
| `medusa-worker` | Medusa jobs/subscribers | same image, service name contains `worker` |
| `Postgres` | Prisma authority | managed |
| `Redis` | BullMQ | managed |

When deploying from the monorepo root, set **Root Directory** to `apps/web`. Local CLI deploys from `apps/web` with `--path-as-root` / cwd already correct.

Do **not** set Root Directory to `kits/`, `vendor/`, or repo root unless you intentionally add a root orchestrator later.

## Linked resources

- PostgreSQL → `DATABASE_URL`
- Redis → `REDIS_URL`
- Object storage bucket → provider-specific env
- `INTEGRATION_MASTER_KEY` → Railway-only secret (never in DB or git)

## GPU

Railway `web` / `worker` call `GPU_INFERENCE_URL` (or equivalent) pointing at `services/gpu-inference` hosted on a GPU machine or managed inference API. Do not install CUDA/torch into the Next.js image.
