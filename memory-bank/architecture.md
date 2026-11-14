# Gita / VERSE//MODE — Architecture

**Product**: India-first preorder apparel commerce (working brand `VERSE//MODE`).  
**Workspace root**: `e:\Projects\Gita` — this is the product monorepo and the only folder Cursor/Railway should treat as the company codebase.

## System map

| Layer | Path | Role | Deploys? |
|-------|------|------|----------|
| Commerce web + API + worker | `apps/web` | Next.js App Router, Prisma, Auth.js, BullMQ worker | **Yes — Railway** (`web` + `worker`) |
| GPU inference gateway | `services/gpu-inference` | Thin FastAPI (or equivalent) over try-on / design pipelines | **Yes — separate GPU host**, never Railway web container |
| Upstream Diffusers | `vendor/diffusers` | Hugging Face Diffusers (Apache-2.0 code; model licenses separate) | No — library dependency for GPU service |
| Upstream FASHN VTON | `vendor/fashn-vton-1.5` | Maskless virtual try-on inference | No — library dependency for GPU service |
| Cursor execution kit | `kits/verse-mode-cursor` | Blueprint / prompts / original kit archive pointer | **No — not a Railway root** |
| Project intelligence | `memory-bank/` | Architecture, decisions, patterns, challenges | Docs only |
| Infra notes | `infra/railway/` | RootDirectory, services, env contract | Config docs |

## Runtime topology (production)

```
Browser → Railway web (apps/web)
              ├─ Postgres (Prisma, authoritative state)
              ├─ Redis (BullMQ)
              ├─ Object storage (assets / proofs)
              └─ worker process (same image, `npm run worker`)
                    └─ HTTPS → GPU inference service (services/gpu-inference)
                                    ├─ vendor/diffusers
                                    └─ vendor/fashn-vton-1.5
```

**Hard rule**: Heavy GPU image inference does **not** run inside the Railway Next.js container. Railway calls an authorized external GPU API/service.

## Stack lock (this product — not ScriptAssist)

Agent-007 ScriptAssist lock (Bun/Mantine/RR7/Orval) does **not** apply here.

| Concern | Choice |
|---------|--------|
| App | Next.js 15 App Router + React 19 + TypeScript |
| Data | PostgreSQL + Prisma |
| Auth | Auth.js (Google OIDC) |
| Jobs | BullMQ + Redis |
| Validation | Zod |
| Payments | Razorpay (server order + webhook HMAC) |
| Shipping | Shiprocket adapter |
| UI motion/assets | Frontend-dev skill patterns when building marketing/storefront polish |
| Package manager | npm (kit engines Node ≥ 22) |

## Source of deployable truth

- **Deploy**: `apps/web` only (plus Railway Postgres/Redis/bucket/worker).
- **Kit**: reference material under `kits/` — never set Railway `rootDirectory` to a kit path.
- **Vendors**: git submodules under `vendor/` — pin commits; do not fork unless required for patches.
