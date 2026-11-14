# Folder structure & naming conventions

## Canonical tree

```text
Gita/                              # monorepo root (git remote: Gita)
├── apps/
│   └── web/                       # deployable commerce app (was VERSE_MODE_Cursor_Kit)
├── services/
│   └── gpu-inference/             # GPU HTTP APIs (product-owned; wraps vendor models)
│       ├── app/                   # gateway scaffold
│       └── adapters/
│           ├── fashn/             # try-on HTTP (port 8100)
│           └── diffusers/         # motif / flat-mockup HTTP (port 8200)
├── vendor/
│   ├── diffusers/                 # upstream HF Diffusers submodule
│   └── fashn-vton-1.5/            # upstream FASHN VTON submodule
├── kits/
│   └── verse-mode-cursor/         # non-deploy Cursor kit pointer / archive notes
├── infra/
│   └── railway/                   # Railway wiring docs (rootDirectory = apps/web)
├── memory-bank/                   # living project intelligence
├── .cursorrules
├── .gitignore
├── .gitmodules
└── README.md
```

## Naming rules

| Rule | Convention | Example |
|------|------------|---------|
| Product apps | `apps/<role>` kebab-case | `apps/web` |
| Internal services | `services/<purpose>` | `services/gpu-inference` |
| Third-party clones | `vendor/<upstream-name>` keep upstream name | `vendor/fashn-vton-1.5` |
| Kits / blueprints | `kits/<name>` never deployable | `kits/verse-mode-cursor` |
| Docs intelligence | `memory-bank/*.md` | `architecture.md` |
| Infra | `infra/<provider>` | `infra/railway` |
| React components | PascalCase | `ProductCard.tsx` |
| Lib modules | kebab or camel per existing kit | `src/lib/checkout.ts` |
| Env files | `.env.example` committed; `.env` never | — |
| Assets (frontend-dev) | `public/assets/{images,videos,audio}/` | `hero-landing-*.webp` |

## What each of the original three folders became

| Before (flat under Gita) | After | Why |
|--------------------------|-------|-----|
| `VERSE_MODE_Cursor_Kit/` | `apps/web/` | This is the commerce codebase that Railway deploys |
| `diffusers/` | `vendor/diffusers/` | Upstream library; not a product surface |
| `fashn-vton-1.5/` | `vendor/fashn-vton-1.5/` | Upstream try-on; consumed only by GPU service |

## Anti-patterns (do not)

- Do not put Railway `Dockerfile` / `railway.toml` under `kits/` or `vendor/`.
- Do not import `vendor/*` from `apps/web` Node process — call `services/gpu-inference` over HTTP.
- Do not commit `node_modules/`, `.next/`, model weights, or secrets.
- Do not nest a second product app at repo root next to `apps/`.
- Do not rename vendor package folders away from upstream names (breaks docs/clone scripts).
