# Gita — VERSE//MODE monorepo

India-first preorder apparel commerce platform. This repository is the **company codebase**. Cursor and Railway both operate from this root.

## Quick map

| Path | What it is | Deploy? |
|------|------------|---------|
| [`apps/web`](apps/web) | Next.js storefront, admin, APIs, BullMQ worker | **Railway** (`web` + `worker`) |
| [`services/gpu-inference`](services/gpu-inference) | Thin GPU API over try-on / design models | Separate GPU host |
| [`vendor/diffusers`](vendor/diffusers) | Hugging Face Diffusers (upstream) | No |
| [`vendor/fashn-vton-1.5`](vendor/fashn-vton-1.5) | FASHN virtual try-on (upstream) | No |
| [`kits/verse-mode-cursor`](kits/verse-mode-cursor) | Original Cursor kit pointer (not deployable) | No |
| [`memory-bank/`](memory-bank) | Architecture & conventions | Docs |

## Local commerce app

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

Master agent brief (inside the app): [`apps/web/START_HERE_CURSOR.md`](apps/web/START_HERE_CURSOR.md)

## Submodules

```bash
git submodule update --init --recursive
```

## Railway

Set service **Root Directory** to `apps/web`. See [`infra/railway/README.md`](infra/railway/README.md).

## Conventions

Canonical tree and naming: [`memory-bank/folder-structure.md`](memory-bank/folder-structure.md).
