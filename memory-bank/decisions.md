# Decision evolution log

### Decision #001 – Gita is the product monorepo; kit is not Railway root

- Date: 2026-11-15
- Author: Love Chauhan (CTO direction via Agent)
- Summary: Treat `Gita` as the only company workspace. Promote `VERSE_MODE_Cursor_Kit` → `apps/web` as the deployable commerce app. Keep Cursor kit semantics under `kits/verse-mode-cursor` as non-deploy reference. Place `diffusers` and `fashn-vton-1.5` under `vendor/` as pinned upstream submodules for the GPU service.
- Reason: Flat three-repo dump mixes blueprint, product, and GPU libraries; Railway and agents need a single clear deploy root and naming boundary.
- Affected Modules: Repository layout, Railway `rootDirectory`, GPU integration path, Cursor memory-bank
- Reversal Conditions: Only if product splits into multiple git remotes with separate ownership; then convert `apps/web` and `services/gpu-inference` to publishable packages, keep vendors as submodules.
- Status: Active

### Decision #002 – Modular monolith on Railway; GPU out-of-process

- Date: 2026-11-15
- Author: Architecture (kit ARCHITECTURE.md + CTO)
- Summary: First production iteration remains Next.js + Prisma + Redis worker modular monolith. GPU inference is a separate service wrapping vendor models.
- Reason: Launch complexity and cost; Railway web is not a GPU host.
- Affected Modules: `apps/web`, `services/gpu-inference`, `vendor/*`
- Reversal Conditions: Sustained need for independently scaled domain services (orders, studio, franchise) with separate teams.
- Status: Active

### Decision #003 – ScriptAssist Agent-007 stack does not apply to VERSE//MODE

- Date: 2026-11-15
- Author: Agent-007 mode with product override
- Summary: Do not impose Bun/Mantine/React Router v7/Orval on this repo. Stack remains Next.js App Router as locked in kit.
- Reason: Different product; kit already scaffolds Next.js commerce.
- Affected Modules: Frontend architecture guidance
- Reversal Conditions: Explicit migration PR approved by product owner.
- Status: Active
