# GITA / VERSE//MODE — SURGICAL, IDEMPOTENT, PRODUCTION-GRADE APPAREL IMAGE RESCUE

Act as Principal CTO, Senior Full Stack Engineer, Fashion Technical Designer, Fashion Photography Engineer, Creative Director, E-commerce UX Director, Computer Vision Engineer, Senior QA and Railway DevOps Engineer.

## Mission

Repair the EXISTING Gita repo and Railway storefront so every one of its 1,000+ apparel concepts is represented by the correct garment, an appealing and varied colourway and silhouette, accurate printable artwork, and a believable editorial gallery. Do not invent or clone a new app. **Production-grade visual quality is an acceptance gate, not a label you can put on the code.**

Source repository (resolve GitHub redirect to actual canonical repository): https://github.com/thenovaworkforce-droid/Gita
Live shop: https://web-production-b2b81db7.up.railway.app/shop
Base branch: inspect current `main`; merge commit at last review `98aa0f932c8b4b94e062280482ff2de3e55b83ef`. Do not blindly reset to that commit; audit HEAD.

Read and incorporate the prior `GITA_PRODUCTION_GRADE_FASHION_PDP_SURGICAL_FIX.md` if present. This document is its **superseding acceptance addendum** when there is any conflict. Read `memory-bank/architecture.md`, `apps/web/START_HERE_CURSOR.md`, Prisma schema, deployment docs and existing Cursor rules before modifications.

## Supplied visual evidence — reproduce and fix

The customer's screenshot shows two different **AMBITION / Track Pant** SKUs advertised at ₹1,399, yet both tiles use essentially the same black **T-shirt** photograph on the same model. Huge purple/blue rectangles cover the chest and coloured polygons cover the neck/skin/background. There is no view of the actual track pants. Different words in product titles do not make these different merchandise photos.

Earlier mobile screenshot also showed square prints, repeated faces, cluttered technical disclaimers, cramped image thumbnails, poor mobile navigation and a huge DEMO MODE banner. Fix these issues at their SOURCE, not only by changing CSS, renaming URLs, changing JPEG/WebP metadata, or reporting distinct SHA256 values.

## Phase 0 — Baseline and diagnostics (mandatory before edits)

1. Inspect latest commit and inventory of files. Existing likely fault paths:
   - `apps/web/src/lib/fashion/artwork-raster.ts` — current rendered PNG includes an opaque background rectangle.
   - `apps/web/src/lib/fashion/garment-placements.ts` — broad hard-coded polygon masks cover non-garment areas.
   - `apps/web/src/lib/fashion/fabric-recolor.ts` — recolours pixels wherever broad mask permits.
   - `apps/web/src/lib/fashion/render-on-model-raster.ts` — selects a model's T-shirt photo even for `PANTS`; uses generic product art and model reference lists.
   - `apps/web/src/lib/fashion/model-identities.ts` — 24 names mapped to a few actual source images; do not count names as unique real models.
   - `apps/web/src/lib/fashion/on-model-media.ts`, `apps/web/src/lib/catalog-media.ts`, `apps/web/src/components/ProductCard.tsx`, `apps/web/src/components/OnModelProductGallery.tsx`.
   - `apps/web/scripts/batch-on-model-render.ts`, `/api/catalog/on-model/[slug]/[view]`, generated asset API, `Product.images`, `ProductMediaV2` and `ProductVariant`.
   - `apps/web/src/app/shop/[slug]/page.tsx`, `apps/web/src/app/shop/page.tsx`, mobile CSS, `DemoBanner.tsx`, `lib/demo.ts`.
2. Audit **20 real database SKUs** including `PANTS` and `TEES` on first shop page. For each collect category, variant colour, Design DNA, model source paths, returned image hash, garment visually present, print, whether media points to T-shirt for pants, and publication status. Capture before screenshots at 390px and 1440px. Compare actual returned image pixels, not just URLs or hashes.
3. Produce a concise `docs/qa/APPAREL_VISUAL_FAILURE_BASELINE.md` with failing products and reproductions. Then implement without stopping at the report.

## Phase 1 — HARD garment type contract

Create `GarmentFamily`-aware image reference registry and validator that acts before render, media publish and product-card display.

- `TEES` must have an actual adult model wearing the intended class of T-shirt; vary crewneck, oversized, relaxed, boxy, athletic, raglan, etc only where a matching licensed source photo or successful VTON result exists.
- `PANTS` must have an actual adult model wearing visible joggers, track pants, straight-leg, wide-leg or tapered bottoms as described. **Require waist-to-ankle framing** for the principal product image; T-shirt-only crops are categorically invalid. Correct thigh/calf/hip artwork placement. A black T-shirt photo with text is never acceptable media for PANTS.
- Reject mixed-front/back photographs whose identity, garment colour or garment silhouette contradict each other. No accidental source image with a different model on the reverse side.
- `ProductVariant` colour or colourway changes must select correctly matched media. The swatch must update front/back image, SKU and displayed specs; never just tint the same preview without verification.
- Make category, garment silhouette, colour, placement, source-license rights and image-view coverage typed metadata. Add a minimal additive migration only if existing fields are insufficient.
- Never promote one `ON_MODEL_CPU_COMPOSITE` API response merely because it returns 200. Check actual content and source compatibility.

## Phase 2 — Transparent typography and correct garment-only compositing

Fix `renderArtworkPng` to export **transparent RGBA** by default; render only actual ink/motif pixels with measured alpha. If a solid rectangle is truly part of a deliberate graphic design, treat it as an explicit art layer with an approved print file, not a ubiquitous accidental background.

Replace hard-coded broad geometric masks with per-reference, per-view garment masks aligned to that exact photograph. Support author-uploaded masks from an admin reference studio; use segmentation model where free hardware permits, but **never default to a crude polygon with skin/background spill**. If no accurate mask exists, fail media generation and mark `NEEDS_REFERENCE_MASK` without publishing.

Preserve seam, grain, folds, highlights, garment edges and shadows with a luminance-aware fabric-colour transform that touches garment pixels only. For black garment to saturated colour, avoid unconvincing uniform tint; require colour-matched blank/source asset when software recolour quality cannot pass. Use print placement transforms and perspective/warp tailored to garment geometry, with alpha transparency and optional low-opacity texture displacement. Do not place 800×800 logo squares across a chest. Hindi/Gujarati/Sanskrit must use licensed locally available fonts with correct shaping and verified strings; use deterministic typesetting rather than relying on diffusion to spell words.

## Phase 3 — Real diversity, not fake metadata diversity

Audit `MODEL_IDENTITIES`: report distinct actual human source photographs by perceptual hash and source asset, not identity aliases. Report the count honestly. Build a rights-reviewed source-reference library with each photo tagged by `modelId`, age-adult confirmation, consent/license record, garment family, silhouette, front/back view, true garment colour, image dimensions, reference mask, background and publication permission.

The user's goal is visual variety across 1,000+ SKUs. Create seeded, deterministic assignment (stable per SKU + colour variant; not `Math.random()` on each request), with balanced categories, identities, cuts, background styles, poses and real fabric colourways. **Never allocate a model/photo to a SKU it cannot visually represent.** Avoid identical portraits across adjacent grid cards where sufficient assets exist; use collection diversity ranking server-side, but do not falsify styles/colours.

No paid image API. Options in preference order:
A. Correctly licensed original model + blank garment reference photographs and precise CPU compositor.
B. Optional free, local/self-hosted VTON or offline Colab/Kaggle GPU **only when GPU actually available and model weights/licences verified**, with reproducible scripts. Never depend on a temporary notebook for a production page.
C. If true model-worn imagery cannot be made faithfully, use a high-quality, garment-accurate flat-lay/ghost-mannequin preview and label it accurately; do NOT pass a T-shirt on a model as a track-pant product.

Do not download or use random internet model photos without commercial licensing and model releases. No arbitrary copyrighted anime/cartoon characters or unlicensed film stills.

## Phase 4 — Product image truth and publication rules

Maintain `ProductMediaV2` provenance and add/derive:
- exact `productId`, `variantId`/colourway, `garmentFamily`, view (front/back/detail/lifestyle), reference IDs, renderer version, content hash, perceptual hash, visual QA score, model asset licence, source garment licence, human approver and review timestamp;
- statuses `PENDING`, `NEEDS_ASSET`, `REJECTED`, `APPROVED` and `SUPERSEDED`; distinguish editorial display approval from physical sample or preorder readiness;
- immutable versioned asset keys, backed by Railway-connected persistent storage/object storage, no runtime regeneration for every page load;
- prior approved assets preserved through migration. De-duplicate by **decoded pixel/perceptual similarity** and asset lineage, not URL hash alone.

Write idempotent remediation command with `--dry-run`, `--limit`, `--offset`, `--batch-size`, `--resume`, `--force-version` and per-SKU result logs. Never alter payments/orders, sample approval status or product selling eligibility. Disable old image scripts that silently republish bad photos; make repeat runs yield no extra writes and never downgrade approved media.

For a missing reference or unpassed visual check: do not publish wrong imagery. Provide a truthful `NEW PHOTOS COMING` fallback or precise flat product view with correct garment class. Count missing-photo items in admin dashboard.

## Phase 5 — E-commerce-grade customer presentation

Create fashion-first but original shop/PDP UX (mobile-first): large, clean consistent 4:5 product visuals; meaningful variety in the first 20 cards; prominent actual garment, colour swatches tied to variant images; product title, original design explanation, accurate price disclosure, fit, sizes, stock/preorder stage. Gallery thumbnails for true front/back/detail and lifestyle, with keyboard and swipe controls, correct object-fit and zoom, responsive at widths 360/390/430/768/1024/1440. On desktop offer wide photo gallery, sticky product information; on mobile use sticky action where appropriate.

Avoid oversized technical notices inside the hero photo. Keep a concise truthful label such as `Digital garment preview` adjacent to images, with complete manufacturing disclosure in expandable product info. NEVER imply a simulated shot is a verified factory sample.

Review `DEMO_AUTH` and `NEXT_PUBLIC_DEMO_MODE`. If production contains demo accounts or bypasses, remove/disable the unsafe demo pathway and verify real authentication/authorization **before** removing customer-facing demo warnings. If genuine real-commerce readiness isn't established, do not deceptively present a working paid-order experience; use truthful `Join waitlist` / `Request this design` instead. Do not enable payment or pretend an interest lead is a paid order.

## Phase 6 — QA automated + visual, strict pass/fail

Create a fixture and E2E gallery for 20 SKUs: 10 tees, 10 pants with at least 8 distinct available base references, 8 discernible garment colours and several cuts/placements, only if actual licensed asset library supports those counts. If not, document the asset deficit without faking diversity.

Required blocking assertions:
1. Pants SKU hero actually depicts **pants**, with waist-to-ankle garment visible.
2. Tee SKU hero depicts a **tee**, not pants unrelated imagery.
3. No broad opaque blocks over body or rectangular artifacts around intended print.
4. No recolouring of face, neck, tattoo, arms, hands or background.
5. Printed words match product's approved source exactly and are legible when present.
6. Front/back/variant images match same garment, exact true colour and intended placement.
7. No single photo reused as a unique product asset across unrelated SKUs without transparency and merchandising approval.
8. Generated WEBP decoded pixels reflect genuinely correct garment appearance, not just different hashes/URLs.
9. Image asset HTTP correct content type, resolution, reasonable performance, cache behavior, and not broken.
10. 20-SKU pilot passes human screenshot inspection (contact sheet and screenshot diffs); then rollout 100; then catalogue. Do not run unsafe blind 1,000 rerender.
11. Repeat whole remediation and audit twice to prove idempotency, no duplicate DB rows and stable URLs.
12. Product count, prices, preorder gates, staff RBAC, auth, admin and order records unchanged. No Prisma destructive resets.

Keep QA docs as evidence: `docs/qa/APPAREL_VISUAL_FAILURE_BASELINE.md`, `docs/qa/APPAREL_VISUAL_RECOVERY.md`, `docs/qa/RUN_LOG.md`. Include accurate screenshots produced by browser automation, not invented descriptions. `npm run typecheck`, `npm run test`, `npm run build`, `npm run audit:on-model-catalog`, targeted Playwright E2E where present. Implement missing tests.

## Phase 7 — Railway deployment and verified completion

Inspect exact production Railway services and linked branch, environment, Postgres, volume or asset store before edits. Create feature branch; stage-only render/QA; promote verified code/approved media with versioned migration, backups, observable rollback and cache invalidation. Avoid enabling checkout, demo admin bypasses or deploying externally unverified model images as if real inventory.

Visit the real deployed `/shop` and at least 10 tee and 10 pant PDPs with browser automation at mobile and desktop sizes. Inspect actual screenshots and emitted image data. Verify the two problem AMBITION track-pant products now show truthful pants imagery (or a proper pants preview if model assets unavailable), **not black T-shirt portraits**. Confirm no purple/blue rectangles or skin/background tint from compositing. If Railway or assets unavailable, report precise blocker; do not claim deployed or passed.

## Engineering rules

Surgical changes in current modules; no wholesale rebuild; minimum justified dependencies; no made-up provider endpoints; no paid-image APIs; no uncontrolled generation. Strict TypeScript types, Zod validation, bounded resource use, safe background worker semantics, atomic DB upserts/transactions, content-addressed media and feature-flagged rollout. Keep monetary and auth systems unaffected.

## Final deliverable — evidence, not promises

Report: commit and Railway deployment IDs, before/after real screenshots, exact category-wise SKU counts, real distinct model-source count (not 24 aliases), genuine tee and pant photo coverage, correct colourway coverage, rejected/pending/approved media counts, missing licensed assets, remaining faulty images, tests/QA evidence and GO/NO-GO for **visual catalogue readiness** separately from GO/NO-GO for **paid preorder readiness**.

**Start source-code implementation. Do not stop after an assessment, another plan or another prompt.**
