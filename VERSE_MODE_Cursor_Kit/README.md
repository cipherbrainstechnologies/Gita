# VERSE//MODE — AI-First Preorder Streetwear Commerce (Cursor Execution Kit)

**Working name only; trademark/domain clearance required.** India-first, inclusive streetwear and activewear for 15–35 audiences, with college students the principal adult buyer persona. Original modern aphorisms, verified/properly licensed historical quotations, and culturally reviewed Indian-language designs. Inspiration: the shopping usability of The Souled Store, **not** its protected assets, site implementation, branding, or policy text.

## What is actually in this ZIP

1. **Next.js storefront + operational admin scaffold (not yet dependency-installed or compilation-verified)** (no live charges, fabricated stock, or completed integrations). Customer-facing sample products are explicitly marked CONCEPT / NOT FOR SALE until manufacturer readiness is approved.
2. PostgreSQL/Prisma reference data model, Auth.js Google OAuth integration scaffold, encrypted admin-config design, payments/shipping/webhook interfaces, dedicated Redis worker direction.
3. **1,000 draft English micro-verse records** (original synthetic candidates, not authenticated quotations) + **1,000 unique design briefs** in CSV. These are ideation backlog, not 1,000 ready-to-print apparel styles or inventoriable SKUs. The AI worker pipeline must review, refine, render, validate print specs, and obtain approval before publication.
4. Detailed product/business/technical/admin/franchise/quality/compliance specs, original **legal-policy drafting templates** requiring review, rollout plan, security checklist, acceptance tests, and the single master Cursor instruction `START_HERE_CURSOR.md`.

## Fastest start

- Extract the ZIP; open **the folder** in Cursor.
- Ask Cursor Agent to execute the entire `START_HERE_CURSOR.md`, or paste that file as your first prompt. Authorize iterative implementation and testing; do not silently skip security or provider-account gates.
- Local preview (Node 22+): `npm install` (generates Prisma client), `cp .env.example .env`, `npm run dev`. The initial preview runs without Postgres using explicit sample view data. Admin write APIs are locked unless authenticated and configured.
- Production: provision Railway Postgres, Redis, storage bucket, web and worker; supply third-party provider credentials **in admin encrypted settings backed by a server-only master key**. Core secrets (database/Redis/OAuth master key) must remain Railway variables; never store encryption master key in DB.

## Deployability and readiness

| Feature | Included in this ZIP | Needed before revenue |
|---|---|---|
| Storefront/mobile-first catalog | Preview scaffold + seed sample data | Live DB catalog, size charts, filter/search, imagery approvals |
| AI quotation & garment studio | 1k+1k candidate datasets + job specs | Genuine provider adapter, human approval, tech packs & proofs |
| Google login | Auth.js code scaffold | Google console configuration, cookie/redirect testing |
| Admin panel / roles | Dashboard preview and route guards in spec | Complete RBAC, CRUD, audit logs and UI workflows |
| Payments | Razorpay webhook verification and manual capture principles documented | Credential provisioning, tested provider order creation, webhooks/refunds, live approval |
| Shipping & notifications | Provider integration contracts | Live Shiprocket, email, SMS DLT/WhatsApp templates |
| Retail POS / franchise | Detailed ledger and POS specs | Store pilot, GST/invoice flows, returns, commission settlement |
| Law and tax | Checklist + original policy draft | Indian counsel/CA checks, company identity, GST, disclosure signoff |

**Important**: A ZIP + one Cursor instruction can direct an autonomous build; it cannot legitimately manufacture provider accounts, merchant approvals, bank/KYC details, sampled garments, signed contracts, or production-ready legal advice. Fail closed and surface blockers.

## Source links and licensing

- Souled Store UX reference: https://www.thesouledstore.com/men
- AI generation/print art: https://github.com/huggingface/diffusers (Apache-2.0 code, **model license separately reviewed**); https://github.com/Comfy-Org/ComfyUI (GPL-3.0 engine; isolate as external service, respect license)
- Photoreal garment try-on: https://github.com/fashn-AI/fashn-vton-1.5 (Apache-2.0; third-party weights/components check); **not itself an apparel print designer**. Avoid CatVTON for commercial use absent a license (BY-NC-SA).
- Railway architecture: https://railway.com/guides/fullstack-nextjs and https://docs.railway.com/deployments/monorepo
- Current Indian 2026 E-commerce rules update (effective 2027-01-01): https://www.pib.gov.in/PressReleasePage.aspx?PRID=2308759
- See `docs/engineering/RESEARCH_AND_SOURCE_REGISTER.md` for verification and caveats.

**Project stage**: Engineering blueprint + preview scaffold. Not a certified production commerce platform.
