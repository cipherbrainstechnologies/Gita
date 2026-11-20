# GITA / VERSE//MODE — COMPLETE APPAREL BRAND, DESIGN FACTORY, STOREFRONT & PREORDER REVAMP

**Single-file Cursor Agent execution contract**  
**Project:** `https://github.com/thenovaworkforce-droid/Gita` (currently redirects to `cipherbrainstechnologies/Gita`)  
**Live storefront:** `https://web-production-b2b81db7.up.railway.app/shop`  
**Repository inspected:** `cipherbrainstechnologies/Gita`, `main` at `60c07f506a7eadb630492a151a68ffc507778188` on 17 November 2026. Cursor MUST re-check HEAD and deployed SHA, because they can change.  
**Stack:** existing Next.js `apps/web` + Prisma creative data + Redis/worker + existing Medusa v2 `apps/commerce` strangler foundation + Railway.  
**Owner objective:** A visually irresistible, commercially credible, mobile-first India-first apparel brand: distinctive T-shirts, track pants and selected additional garments carrying original/verified Sanskrit and multilingual verse-inspired artwork; 1,000+ real, differentiated designs; premium on-model fashion merchandising; make-to-order / preorder operations.  
**Authority:** Implement real source code and migrations; don't stop at analysis or a new plan. No false claims of payment/production readiness.

---

## 0. OPERATING ROLE AND NON-NEGOTIABLE MISSION

You are the project's **Principal Software Architect, Fashion Creative Director, Apparel Product Developer, D2C Founder/Operator, Senior Next.js/Medusa Engineer, Manufacturing Operations Lead, SEO Architect, QA Lead, and Railway SRE**. Treat the screenshots described below as the UX benchmark for *quality and information hierarchy*, NEVER as an asset/code/design library to clone.

**Deliverable:** A truly designed fashion storefront with 1,000+ differentiated, discoverable concepts; a curated shop experience with compelling accurate apparel images; complete customer browsing and preorder-intent workflows; an admin-operable design/merchandising factory; versioned stable data and images; honest production gates; verified Railway staging/production evidence.

**Do not:**
- Rebuild the repo or replace its architecture blindly; do not wipe, truncate, or re-seed customer/order/creative data destructively.
- Claim 1,000 unique images by assigning 1,000 URLs to reused photos, using different hashes on the same pixels, or generating simplistic recoloured polygons.
- Publish print artwork without exact source/right and typography verification, invent Sanskrit/Gita citations, or use unlicensed anime/film/cartoons, logos, character drawings or dialogue.
- Clone The Souled Store's screenshots, brand, styling, logos, photography, patterns, artwork or source. Emulate **functional retail conventions** only.
- Invent authentic inventory, samples, reviews, conversion metrics, model measurements, discounts, supplier capacity, return promises, or confirmed dispatch dates.
- Enable real payment/deposit checkout until legal, supplier, tax, fulfillment, provider, refund and reconciliation requirements are approved. Provide a functional non-payment interest/reservation-request pathway meanwhile, explicitly differentiated from an order.
- Turn off demo authorisation by only hiding a banner. Disable DEMO_AUTH and other demo credentials/behaviour before releasing a real customer-facing environment. If checkout remains disabled, site may still look visually professional with honest concise disclosure.
- Assume that free VTON/AI images are unlimited or that Railway has GPUs. All generation should be offline/worker-side with transparent resource use.

**Implementation discipline:** audit, make narrow changes, add migrations, add automated tests, run local checks, deploy canary/staging, verify real mobile screenshots, and promote only passing changes. Repeat passes must be idempotent. Keep nonfinancial changes independently deployable.

---

## 1. SCREENSHOT BENCHMARK — WHAT TO FIX

The founder supplied seven mobile screenshots. The current Gita screenshot shows a very large lavender track-pant flat drawing (`vmb-0990` detail), little convincing product fashion imagery, a row of small almost-identical thumbnails, an intrusive black **DEMO MODE** block, engineering-language copy ('digital garment preview', 'product photography notes'), and limited immediately useful shopping information.

The other screenshots show **premium apparel shopping conventions**: full-height human-worn garments with unmistakable fit, varied models and colours, a clean two-column portrait-image product grid, useful photo overlays for fit/fabric, simple name/type/INR prices and wishlist hearts, horizontal category chips, a mobile bottom `Menu / Filter / Sort` bar, a category-based filter drawer with size/colour/type/fit, and PDP size choices, delivery pincode, material accordion, related-look cards, and bottom cart actions.

**Reproduce the outcomes, not the exact competitor layouts/assets:**

| Area | Current failure | Gita-specific required outcome |
|---|---|---|
| Hero images | Flat purple trouser silhouette; repeated imagery / no model | Actual coherent adult model wearing exact garment, with accurate cut/colour/print and front/back relationship; licensed photo or honestly labelled AI simulation |
| Apparel family | Both tee/pant derivations; little variety | Proper diverse garment construction and category-specific imaging, not tees pasted on pants |
| Graphic design | Tiny verse placed awkwardly; same typesetting | Fashion-led graphic systems: chest insignia, back hero, leg vertical, embroidery, puff print, minimal tonal marks, illustrated motif, colour-block |
| Shop discovery | Broad archive of similar concepts | Curated brand home + campaigns, trending by genuine demand, collections, category chips, facet filtering, strong sort and accessible 2-column grid |
| PDP | Image dominates with engineering commentary | Full fashion gallery + title, fit, price, colour swatches, size selection, preorder summary, pincode, material/size/care accordion, outfit recommendations, actionable sticky CTA |
| Warnings | Full-height demo banner and internal phrases | Clean consumer-facing copy; small truthful concept/preorder notice near CTA; debug info belongs in protected admin/QA |
| Conversion | Most products non-orderable; no usable path to commitment | Intent/no-payment reserve request works now; real paid preorder only after supplier/payment gates; show order-vs-interest distinction |
| Mobile behavior | Cramped gallery and little navigation hierarchy | Fast thumb gallery, swipe/zoom, accessible sticky actions, mobile drawer filters, no layout shift or horizontal overflow |

**Visual acceptance:** If a human sees the first 12 cards on a 390px screen, they must unmistakably see a **fashion shop**, not a software illustration gallery. Every visible hero must display accurate apparel, not just a coloured technical vector. If licensed/model-worn images are unavailable, do not fake them; hold those cards from hero merchandising and show them in a separate browseable design archive with explicit concept status until ready.

---

## 2. REPOSITORY-AWARE BASELINE AND THINGS ALREADY BUILT

Before editing, inspect `git log`, staged/untracked changes, branch, Railway environment variables **names** (never dump secret values), and current deployment SHA. Read:

- `README.md`, `memory-bank/**`, `.cursor/rules/**`, `apps/web/README.md`, `apps/web/docs/qa/**`, `apps/web/docs/roadmap/**`.
- `apps/web/src/app/{page.tsx,shop/page.tsx,shop/[slug]/page.tsx,globals.css,layout.tsx}` and `apps/web/src/components/{Header,ProductCard,OnModelProductGallery,DemoBanner,AddToCart}*`.
- `apps/web/src/lib/{catalog,catalog-media,checkout,deposit,config,storefront-copy}.ts`, `apps/web/src/lib/fashion/**`, `apps/web/src/modules/**`, `apps/web/prisma/schema.prisma` and migrations.
- `apps/web/data/design_briefs_1000.csv`, `apps/web/data/verses_1000_drafts.csv`, `apps/web/data/v2/**`, `apps/web/scripts/{seed-1000-product-concepts,offline-catalog-render,batch-on-model-render,audit-on-model-catalog,pilot-apparel-visual-20}.ts` and `apps/web/docs/qa/apparel-visual-baseline/**`.
- `apps/commerce/**`, especially `apps/commerce/README.md`, `src/modules/gita-bridge/**`, `src/scripts/gita-catalog-import.ts`, `apps/web/src/lib/commerce/{medusa-client,medusa-catalog-adapter,flags}.ts`.
- `apps/web/railway.toml`, `apps/commerce/railway.toml`, `/docs/deploy/RAILWAY_SERVICE_MAP.md`.

**Latest observed architecture (verify again; do not assume more has shipped):**
- About 1,000 design-brief products and size variants exist or can be seeded. Many are `CONCEPT`, not actual purchasable products.
- `apps/web` runs its storefront against Prisma catalogue; its historical image pipeline generated SVG, then CPU compositing/flat-lays. Current docs explicitly acknowledge **zero approved on-model pants source photos** and only about **six distinct human photo sources**, notwithstanding 24 model IDs.
- Mobile PDP still includes `DemoBanner`, `GarmentArt` fallback, technical 'media checklist', hard-coded garment info and waitlist CTA.
- `apps/commerce` now exists as **Medusa v2** with Medusa Admin + `gita-bridge` and a shadow catalogue export/import. This is **NOT** an automatic complete cutover. `medusa-catalog-adapter.ts` currently falls back to `category:'tees'`, `palette:'charcoal'`, `status:'CONCEPT'`, `orderable:false` when mapping Medusa products, erasing original fashion attributes. Fix bridge mapping before enabling Medusa catalogue reads in public pages.
- Razorpay/deposit workflows exist partly but live transactions are deliberately blocked; preserve those gates.
- Existing docs may be stale or contradictory; trust executed tests, DB evidence, current source and verified live observations over historical checkmarks.

**Create a baseline report** in `apps/web/docs/qa/FASHION_RELAUNCH_BASELINE.md` with commit, deployed SHA, image source inventory, DB product and actual approved image counts, real model reference count (not metadata IDs), family/colour diversity, top 20 screenshots, conversion usability defects, and gaps to be fixed. Do not change production data until baseline backed up.

---

## 3. BUSINESS AND CREATIVE STRATEGY: A BRAND, NOT A GENERATOR

**Positioning:** GITA / VERSE//MODE = original, meaningful wearable statements with contemporary art direction. Customers buy *desirable garments first*, then connect emotionally with the words. Avoid looking like bulk text printed onto generic blanks.

**Target adult launch categories** (subject to ability to manufacture and validate size/fit):

| Family | Seedable subtypes (not identical SKU copies) | Design opportunities |
|---|---|---|
| T-shirts | regular crew, premium oversized, boxy, drop shoulder, heavy garment-dyed, vintage washed, acid-wash, raglan, long sleeve, relaxed, fitted, pocket tee, minimal embroidered, typographic back-print | left chest, center chest, pocket icon, hem, full-back, dual-sided, sleeve, tonal |
| Active / street bottoms | tapered jogger, wide-leg, Korean baggy, straight-leg, open-hem, cuffed fleece, cargo jogger, parachute, relaxed track pant, athletic side-panel, flare/bootcut, brushed fleece | thigh, side seam, pocket, calf vertical, back pocket, side stripe, embroidery |
| Co-ords (phase 2 only if capacity signed) | matching oversized tee + straight track, gym set, contrast set | split message, repeat motif, tone-on-tone |
| Hoodies/sweatshirts (phase 2) | heavyweight hoodie, zip hoodie, crew sweatshirt, half-zip, premium washed | chest crest, sleeve, large back, shoulder |
| Other apparel (phase 3) | polos, tank tops, overshirts, shorts | garment-specific patterns only |

**Collections** (original brand taxonomy, not competitor names): `GITA // ACTION`, `DISCIPLINE CLUB`, `AFTER HOURS`, `INNER FIRE`, `LOW-KEY LOUD`, `THE NEXT ARC`, `CAMPUS STORIES`, `WORLD WORDS`, `RESET MODE`, `MINIMAL SIGNAL`, `MOTION LAB`, `FRIENDSHIP & CHAOS`, `ROOTED`, `URBAN MONK`, `NOISE / SILENCE`, `COLOUR THEORY`.

**Original text directions:** verified public-domain Gita Sanskrit with chapter/verse; native-reviewed Hindi/Gujarati/Bengali/Marathi/Tamil/Telugu translations or **labelled modern interpretations**; original English motivational/discipline/friendship/campus/athletic phrases; original multilingual everyday slogans. Never treat deterministic synthetic English drafts as verified classical text. Ancient Sanskrit ~700 Gita verses is not a source of 1,000 independently authenticated Gita passages; the **1,000 product target is diverse designs across a wider original/sourced language library**, not 1,000 fake scripture quotations.

**Creative rules**:
1. Not every garment must carry a slogan: some premium styles have a single native-script insignia, tasteful pattern, original emblem or small placement.
2. Use text hierarchy and composition like an experienced fashion designer: asymmetrical type, intelligent negative space, deliberate contrasts, front/back storytelling, appropriate printing technique. Avoid repeating one centered text template.
3. Avoid impossible garment specs. `fabric`, `GSM`, fit, printing method, wash care, stitch, pocket layout and dimensions must come from confirmed supplier base-style specs or be explicitly labelled proposed.
4. Do not add arbitrary graphics only for numerical uniqueness; unique design means visibly/semantically different styling choices and artwork.
5. Ensure men/women/unisex representations are based on genuinely fitting patterns and human-sized reference garments; never mislabel one universal fit as tailored fit.
6. Use creative teams and brand campaigns; **do not present random combinatorial noise as curation**.

---

## 4. NEW DATA MODEL: DESIGN SYSTEM AND PRODUCT TRUTH

Use **additive migrations** and existing canonical entities where possible. Do not duplicate Medusa's order or product ownership without a mapping rule. Define/extend conceptual tables (exact names can vary if semantically equivalent models already exist):

```text
CreativeVerse(id, stableKey, language, script, originalText, contentKind,
  sourceType, sourceUrl, chapterVerse, translationAttribution, rightsState,
  nativeReviewStatus, culturalReviewStatus, updatedAt)
GarmentBaseStyle(id, family, subtype, patternVersion, fit, sizeGrade,
  supplierId, fabricId, gsm, cut, waistband, legOpening, sleeveLength,
  status, productionCapabilities, sampleProofIds)
GarmentColourway(id, baseStyleId, code, name, hex, fabricDyeReference,
  paletteFamily, approvalState, supplierColourProofId)
Artwork(id, stableFingerprint, verseId, treatmentId, artLayers, exactText,
  textPlacement, printMethod, printableMm, printFileId, sourceRights,
  editorialReviewState, printProofState, originalAssetSha)
DesignConcept(id, productKey, verseId, garmentBaseStyleId, selectedColourwayId,
  creativeDirectionId, artworkId, story, designDnaJson, seedVersion,
  conceptState, publishState, minCogsPaise, approvedBy)
DesignColourVariant(id, designConceptId, garmentColourwayId, artColourwayId,
  designFingerprint, status, medusaVariantOrOptionMap)
ModelReference(id, licenceStatus, consent/contractReference, modelCategory,
  frontSource, backSource, fullBodySource, baseGarmentFamily,
  cropRegion, photoOrientation, measuredGarmentRegionMaskId)
RenderJob(id, designConceptId, colourVariantId, view, provider,
  renderVersion, renderFingerprint UNIQUE, state, attempt, errorCode,
  costActual, sourceAssetIds, outputAssetId, licenseStatus, qaVersion)
ProductMedia(id, design/colour IDs, mediaRole, imageHash, storageKey,
  garmentTruthScore, visualReviewStatus, reviewerId, approvedAt,
  sourceType [AI_SIMULATION|COMPOSITE|PHYSICAL_SAMPLE], publicationFlag)
ProductPublication(id, conceptId, medusaProductId, version,
  storefrontState, seoState, qaApprovedAt, merchandiserApprovedAt)
SupplierCapacity(id, baseStyleId, colourwayId, sizeId, amount,
  reserved, verifiedAt, shipWindowFrom, shipWindowTo)
PreorderIntent(id, customerOrGuestId, productId, variantId, quantity,
  policyVersion, status, createdAt, expiresAt, metadata)
PreorderCommercialOrder(id, medusaOrderId, intentId, totalPaise,
  depositDuePaise, depositCapturedPaise, balanceOutstandingPaise,
  fulfillmentState, snapshot, idempotencyKey)
```

**Key architectural invariant:** Gita creative tables own source verses, Design DNA, approved artwork and proof; Medusa owns live product variants/pricing/carts/customer orders and payment statuses **after** an audited, reversible cutover. The bridge owns ID maps only. If the app is still in shadow mode, Prisma catalogue remains read authority until feature flagged transition is verified.

**Idempotency and uniqueness**:
- `creativeFingerprint = SHA256(canonicalVerseKey | garmentBaseStyleId | colourwayId | printPlacement | artDirection | artVersion | compositionTemplateVersion)`.
- Variant fingerprints derived from approved garment/colour/source, not just numerical ID.
- Render fingerprint includes source image bytes hash + garment input bytes hash + exact artwork hash + pose + model + view + model/provider version + deterministic seed.
- Unique DB constraint on `(designId, colourwayId, view, renderFingerprint)`, and avoid two published hero images for same colour variant without explicit ranking.
- Upsert by canonical stable key; don't downgrade approved data to concept or overwrite human-reviewed assets.
- Re-run migrations and seed twice in staging; second run should create **zero duplicate designs, variants, images, leads, orders, or jobs**.

---

## 5. CURATED 1,000+ PRODUCT FACTORY: SEED DIFFERENT CLOTHES, VERSES, STYLES, COLOURS

**Current failure:** 1,000 synthetically generated CSV rows or tiny palette randomization do not automatically create 1,000 appealing shop products. Build a full merchandiser-controlled engine.

### 5.1 Inputs and taxonomy

- Use existing `data/design_briefs_1000.csv` and `data/verses_1000_drafts.csv` only as *creative idea seeds*, not automatically approved scripture or sellable stock.
- Ingest original/verified `data/v2` passages and slogans with citations/rights, then support CSV/JSON manual uploads from admin.
- Create a minimum of 12 visually different garment patterns/subtypes where genuine front/back line art or source pattern is possible; do not claim a subtype is manufactured unless actual pattern/tech pack exists.
- Palette library >=24 curated colours grouped by neutral, muted, bright, washed, pastel, seasonal; per base-style family require supplier colour capability verification before orderability.
- Graphic treatments >=16 genuinely different: editorial backprint, woven look, tonal embroidery, minimal crest, vertical leg type, puff contour, reflective-look digital preview, half-tone original motif, abstract linework, stencil, vintage type, hand-lettered original lettering, small sleeve slogan, monogram, two-tone block, asymmetric photo-free composition. Actual printing method is proposed until supplier verified.
- 24 model *slots* may be used for deterministic assignments but report **actual independent licensed reference images/faces**, and keep correct male/female presentation and garment size/fit. Different IDs using same base photo are not counted as different human models.

### 5.2 Fashion curation constraints

- **Quality weighted generation:** choose combinations based on print area, fabric contrast, garment cut, verse script length, target price tier, supplier capability and fashion collection coherence; no uniform random draw across impossible combinations.
- Balance initial catalogue intentionally, not 500 identical tees/500 identical pants: launch curated diversity across at least 2 garment families and many subtypes, with a rolling phase-2 expansion only where source asset coverage/manufacturing allows.
- Variety target across *published hero-ready catalogue*: no more than 2 visually near-identical heroes in a 12-card viewport; <=25% of first 48 cards in one colour family; at least 5 actual garment cuts represented in first 48 where approved assets exist; show tee and pant looks in the first viewport; spread model references and scenes fairly.
- Each product has a short marketable name, type, fit, actual/proposed material, palette, design story, verified text/source, front/back artwork spec, optional alternate colour, price tier and collection. Never call random string a product name.
- Human merchandiser can reject, regenerate, swap model/photo, correct print placement, revise artwork, publish, archive and rollback.

### 5.3 Seed tool

Implement `apps/web/scripts/fashion-seed-1000.ts` (or equivalent) with `--dry-run`, `--limit`, `--offset`, `--batch`, `--resume`, `--report`; operates against creative DB and, if configured, syncs approved items through Medusa bridge **only after explicit publishing**. Store a manifest under `apps/web/data/generated/fashion-collection-manifest.json` or DB artifact storage.

Create stable, idempotent catalogue records for >=1,000 creative concepts without clobbering existing `vmb-*` slugs; for every previously seeded row either enrich its creative treatment using existing fingerprint, or produce an explicit migration mapping from old to new. Generate enough **unique concepts**, not 1,000 repeat size/colour variants; report base-design count, colour variant count, sellable SKU count, fully approved images, image-pending count separately.

**Publication policy:** The consumer-facing shop may show all 1,000 designs **as navigable catalogue concepts** only with accurate editorial representation and clear, unobtrusive concept status. Prefer a curated primary `Shop` where on-model approved designs lead; a clearly labelled `Design Archive` can expose incomplete listings to preserve discoverability. Do not claim all 1,000 visually ready unless they pass evidence-based media QA. Never substitute an SVG/flatlay as 'model-worn'.

### 5.4 Concrete product samples to generate and QA

These are examples of **original design briefs**, not claims of real inventory or approved textiles:

| Collection | Product direction | Colour | Artwork language/placement | Photography direction |
|---|---|---|---|---|
| GITA / ACTION | heavyweight boxy oversized tee | bone + rust | verified Gita 2.47 Sanskrit microtype left chest, original interpretation large back | male adult front + true back, quiet beige studio |
| GITA / ACTION | vintage washed tee | charcoal | 'DO THE WORK. RELEASE THE RESULT.' original back graphic | woman adult three-quarter editorial |
| DISCIPLINE CLUB | straight gym jogger | slate + lime accent | original vertical calf typography | full-body side stance with shoes visible |
| RESET MODE | open-hem wide-leg track pants | chocolate | original small hip insignia, large side-seam motif | standing full-length photo, hem fully visible |
| CAMPUS STORIES | oversized raglan tee | navy/cream | original two-line campus joke on front | lively original campus-inspired scene |
| LOW-KEY LOUD | minimal embroidered crew tee | sage | tiny left chest tonal original icon | premium studio close fit detail |
| INNER FIRE | washed boxy tee | faded orange | original typographic/abstract graphic on back | playful high-key campaign |
| WORLD WORDS | oversized tee | cobalt | native-reviewed Gujarati or Hindi original saying, no fabricated scripture | model front and verified vector proof |
| MINIMAL SIGNAL | cuffed jogger | espresso | small embroidery-look symbol near pocket | full-length side/bottom shot |
| MOTION LAB | athletic track pant | black with orange piping | side panel and original label | movement pose, correct panel geometry |
| URBAN MONK | heavyweight tee | off-white | elegant Devanagari form, verified meaning | warm neutral studio |
| AFTER HOURS | straight-leg trousers | dusty lavender | original understated wordmark on back pocket | night streetwear model, full garment in frame |

For all examples, use author-owned/licensed art, not third-party brand/franchise assets.

---

## 6. IMAGE PRODUCTION PIPELINE — MOST IMPORTANT P0

**Required outcome:** A real photo-quality hero for each promoted apparel product. Consumers must see the actual cut and print placement rather than a trouser polygon with tiny text. The current screenshot's lavender trouser outline cannot be a retail hero.

### 6.1 Separate the artifacts

1. **Print artwork** — transparent-background high-resolution raster or editable vector from exact approved text and layers; bounding-box, print dimension, export proof.
2. **Garment blank image** — accurate shirt/trouser shape and specific approved colourway/fit; front/back as true garment views.
3. **Model/person reference** — properly licensed photographed adult model or authorized synthetic model source, with front/back/body framing matched to garment family.
4. **Composed try-on/on-model** — photoreal where actual verified inference or licensed professional compositing allows it; otherwise not claimed as photoreal.
5. **Flat lay / detail** — accurate product support image; never the *only* hero for a promoted garment unless model assets aren't available, in which case label truthfully.
6. **Tech pack** — separate manufacturer asset; never put manufacturing debug labels on consumer hero images.

### 6.2 Correct known renderer weaknesses

Audit and fix the actual latest versions of:

```text
apps/web/src/lib/fashion/artwork-raster.ts
apps/web/src/lib/fashion/render-on-model-raster.ts
apps/web/src/lib/fashion/garment-placements.ts
apps/web/src/lib/fashion/fabric-recolor.ts
apps/web/src/lib/fashion/tee-flatlay-raster.ts
apps/web/src/lib/fashion/pants-flatlay-raster.ts
apps/web/src/lib/fashion/model-identities.ts
apps/web/src/lib/fashion/visual-quality-gate.ts
apps/web/src/lib/fashion/vton-on-model.ts
apps/web/src/lib/fashion/on-model-media.ts
apps/web/src/lib/catalog-media.ts
apps/web/src/components/ProductCard.tsx
apps/web/src/components/OnModelProductGallery.tsx
```

Do not regress prior fixes: opaque rectangles, wrong family tee-on-pants, skin/background colour mask spill, mirrored text, duplicate source photos, and synthetic IDs misreported as unique people. Build automated regression tests for those failures.

**No fake photoreal via CSS**. Colour grading + overlay on one black tee does not magically create a cobalt oversized tee or actual joggers. If the asset cannot support the chosen cut/colour, do not publish it as accurate. If VTON unavailable, use legally licensed category-specific flat-lay as a temporary secondary visual and keep hero-readiness false.

### 6.3 Provider architecture, without forced paid subscriptions

Implement `FashionRenderProvider` contract with `generateFront`, `generateBack`, `generateLifestyle`, `generateDetails`, `getJob`, `validateProvenance`. Supported modes:

- **PHOTO_UPLOAD**: professionally sourced/licensed actual base garment model photos (preferred if founder obtains photography).
- **CPU_MASK_COMPOSITE**: only where hand/segmentation-verified garment mask and matching base fit/colour/photo exist; no geometric polygons over bodies.
- **LOCAL_VTON**: existing `services/gpu-inference/adapters/fashn/app.py` or another compatible appropriately licensed local model with verified CUDA; do not assume a working GPU or weights.
- **OFFLINE_BATCH_IMPORT**: CLI/notebook exports approved WebP and manifest into object storage; free notebook sessions are intermittent, not reliable production APIs.
- **OPTIONAL_PAID_PROVIDER**: plug-in only, off by default, never require an unapproved paid API or credit purchase. No vendor repo merge that risks license/ops conflicts.

**VTON specifics:** use realistic valid garment input, not a solid colour canvas with centered quote; use actual PNG format if MIME says image/png; supply actual full-body person for joggers, and the right `tops/bottoms` category; require output front/back consistency and actual commercial-use license check of model/code/weights. Place exact lettering **after** VTON by compositing approved print artwork on the resulting garment region with verified perspective warp, texture, occlusion and lighting—not simply over the model's face/body.

### 6.4 Asset storage, caching, costs

- Persist approved image bytes, not just 4,000 dynamic `/api/catalog/on-model` URLs that render Sharp on every visitor request.
- Use existing persistent volume only if it is mounted, readable by both producing and serving service, backed up, and survives redeploy; otherwise implement object storage (e.g. S3-compatible) through adapter. Use SHA-256 addressed content keys. Avoid uploading hundreds of generated images into Git.
- Job queue via BullMQ/Redis or existing worker, bounded concurrency, retries with jitter, cancellation, cost/resource tracking, immutable versions, resumable offset + cursor, GPU-offline import.
- Media files in WebP/AVIF responsive variants, `width/height`, aspect ratio, blur placeholder from actual image, meaningful alt, immutable names + correct cache headers. Revalidate product/collection cache on approved media publish.
- Keep a QA provenance report for each: source photo license, garment family, colour, print text ID, exact artwork hash, renderer version, seed, output hash, reviewer, approval time.

### 6.5 Actual media taxonomy and view consistency

For every approved *base-design + colour variant* minimum:

1. `FRONT_ON_MODEL` — portrait vertical 4:5 showing garment with proper pose and framing.
2. `BACK_ON_MODEL` — same garment/colour/model identity and accurate rear print.
3. `DETAIL_PRINT` — zoom on true artwork placement, no imaginary fabric characteristics.
4. `FLAT_FRONT` — garment shape/print accurate.
5. `LIFESTYLE` — distinct credible fashion scene, only after approval.
6. `FABRIC_DETAIL` — photographed sample only or clearly identified simulation (do not promise verified fabric from AI texture).

For pants: at least one full-body waist-to-ankle image showing fit/leg opening, pockets, rise and original print; no torso-only crop marketed as trousers. For tees: neck, shoulder seam, hem, sleeve proportion and front/back fit should remain consistent. Do not fabricate reverse image by mirroring front.

### 6.6 Model diversity guardrails

- Replace fake model-count KPI: count **distinct licensed human photo source fingerprints**, or genuinely independent AI character output identities after visual uniqueness check.
- Set a *target* of 20+ distinct model looks for marketing, not a claim that these already exist. Include adult male/female/unisex presentations, varied posing, hair/skin appearances, body proportions, garment size and environment. Avoid attributing body measurements to synthetic images.
- Do not use random model assets that happen to have an incorrectly sized garment. Never cross male/female sources into mismatched garment fit just to increase count.
- No face modification of a real commissioned model without authorized contract scope.

### 6.7 Visual QA — prevent showing the purple pants again

Use machine checks plus a **human visual review grid** (at least 48 randomized images across product family, collection, print style, model source and colour). Detect/flag:

- large opaque artwork rectangles / visible recolouring geometry / skin spill;
- text not matching source script, missing Devanagari matras, text placed backwards, clipped, too small to read;
- flat technical trouser/tee drawings promoted as model photography;
- wrong garment type or source mannequin, floating garments, incorrectly shaped pockets/legs/sleeves;
- front/back artwork or colour mismatch; 
- source image shared across dozens of designs without disclosed compositing and accurate garment truth;
- unsafe body proportions, uncanny or impossible anatomical artifacts, false model/fabric/fit claims;
- same print/pose/colour composition repeated across adjacent cards.

**Never automatically mark `approvedForPublication=true` solely because Sharp returned a valid WebP or an image URL returns HTTP 200.** Human approval and garment truth QA are separate states. Regenerate failed outputs, do not silently fall back to an inaccurate fake.

---

## 7. CONSUMER STOREFRONT — COMPLETE MOBILE-FIRST UX

### 7.1 Design language

Build a distinct Gita identity: modern editorial streetwear, attractive colour pops, clean cream/ink surfaces, distinctive typography supporting Indic scripts, controlled vibrancy, premium photography and generous spacing. Avoid both 'dark coding dashboard' visuals and wholesale copying the competitor's red/topbar/teal/details styling.

Create reusable `design-tokens`, typography scales, colour tokens, spacing, radii, shadows, responsive image ratio, action styles and animation budget. Use variables, avoid one-off CSS patches appended forever. Verify Devanagari/other scripts render with bundled/system commercially permitted fonts; don't ship font files here or from unknown licenses.

### 7.2 Homepage `/`

- Hero 1: original seasonal collection campaign with real approved model-worn garments and primary **Shop the Collection** CTA.
- Hero 2: `Choose Your Verse` editorial: Gita, ambition, focus, friendship, gym, multilingual creative themes; links to actual product results, never dead buttons.
- Shop categories: oversized tees, relaxed tees, joggers, wide-leg, track pants, co-ords when genuinely available.
- Trending by actual interest/preorders (not fictional sales counts), New Drops by approved publish date, colour stories, artist/designer spotlight, curated outfits, how preorder works in three honest steps.
- Faithful concise value proposition: designs made after a genuine preorder, with disclosed timeline and cancellation/refund path when charged.
- Mobile: top search/cart/wishlist, accessible menu, quick category rail, skeletons, 2-column grid, sticky controls only as useful.

### 7.3 Collection listing `/shop` / category / collection

Use the user reference screenshots for **functions**, but create Gita-original design:

- Above-fold: back/campaign title, search, wishlist/cart, horizontally scrollable image-backed category chips and actual total results.
- Premium 2-column product cards at 360–430px with edge-to-edge 4:5 hero, image-aware fit tag (only verified), wishlist heart, title (2-line clamp), garment category, variant colour swatches/`+N`, sale price, legal MRP if real, and clear `PREORDER` vs `NEW CONCEPT`.
- On hover/tap-second-image show back; keyboard accessible; avoid auto-playing image changes. On mobile, swiping gallery must not hijack scroll.
- Real sorting: featured (curated ranking), new, price low/high, newest, popular by real intent signals. Cursor pagination with stable tie-breakers; preserve URL state and browser back.
- Mobile bottom `Categories | Filter | Sort` toolbar, filter drawer or sheet with correct item counts and Apply/Clear buttons; facets: apparel family, silhouette, gender/fit, size, price, colour, collection, verse theme, language/script, garment material (verified), print placement and preorder readiness. Each facet must be backed by real data and backend query (not inert UI).
- `0 results` must suggest changes and show popular categories, not blank page. Respect consent for analytics.
- Collection hero and editorial modules come from admin; no static-code edits to swap campaign art.

### 7.4 Product detail page `/shop/[slug]`

**Mobile ordering of elements (not just two-column desktop stacked):**

1. Compact nav with back / breadcrumb, search, wishlist, cart (no clutter).
2. Swipeable gallery full width 4:5 or appropriate tall pants crop, high-resolution photo first; front/back/detail/flat/lifestyle; visible indicators, thumbnail list below or peek, pinch/zoom/lightbox; correct view labels; fast lazy loading for non-first images.
3. Product maker/collection, *short aspirational name*, garment fit/subtype, INR price, real colourway name/swatch, concise `Made after you preorder` or `Design preview` badge.
4. Interactive swatch selection changes **exact product-colour media and variant**, route/query state, price and sizes. Do not recolour one photo via CSS and label it an actual colour variant.
5. Size chips (XS–XXL only where graded), `Size guide` bottom sheet with actual garment measurements, model size/height only if real sourced; size state persist across cart navigation.
6. Genuine preorder commitment module: full price, reservation/deposit due now, balance later, payment stage, order cutoff if genuine, estimated ship window only when confirmed, plain-English cancellation/refund. For unsigned concepts, CTA clearly `Request this design / Get notified` and shows **no money taken**.
7. Pincode serviceability input with authentic provider result or a transparent 'serviceability confirmation pending' state. Never invent shipping estimates.
8. `Add to Cart` / `Preorder` CTA on bottom sticky mobile bar **only for orderable variants**, otherwise `Join early access / Request this design` with functional lead form. No fake active Buy Now.
9. Compact accordions: Details, Fit/Size, Composition/Care, Original Verse & Attribution, Print/Artist Story, Production & Delivery, Returns & Refunds, Contact Support; source integrity with exact link.
10. `Style With / Pair It With` and `Others Exploring` product cards based on fit/colour/story, not random cross-sell; avoid paid reviews/social proof when nonexistent.
11. Persistent product slug/canonical, variant semantics, product schema only where accurate.

**Remove from primary consumer experience:** long technical prose about Sharp/composite/Design DNA, `Product photography notes` debug panel, `DEMO MODE` credential banner, huge missing-media bullet checklists, fake material claims, placeholder disabled widgets. The underlying honesty remains through a short, visible media note `Digital preview; final garment details confirmed before payment` and clear legal/fulfillment policies in an accordion when relevant. **Never hide the fact that no payment happens if the CTA is only an interest request.**

### 7.5 Navigation, information architecture

- Browse by apparel: T-shirts → boxy, oversized, regular, long sleeve; Bottoms → joggers, wide-leg, open hem, cargos; Other families only after approved assets/capabilities.
- Browse by meaning: authentic Gita, original motivation, gym, campus, friends, world languages; use evidence-backed content statuses.
- Browse by vibe: minimal, loud graphics, vintage, street, workout.
- Search supports Unicode scripts, English transliteration and source verse references; use token/synonym entries approved in admin, not hallucinated search results.
- Dedicated pages: `/collections/[slug]`, `/shop/[slug]`, `/designs` or `/ideas` for not-yet-visual-ready concepts, `/how-preorder-works`, `/size-guide`, `/contact`, `/policies`, `/account`, `/orders` as permitted by auth system.

### 7.6 Performance/accessibility

- Next Image with real width/height `sizes`, responsive formats, stable aspect ratio, optimized first hero/above-fold images; preload selectively; no duplicate data fetch waterfall or synchronous render-on-request.
- LCP aim <=2.5s p75 real users, CLS <=0.1, INP <=200ms where measurable; never assert passing without Lighthouse/RUM evidence.
- Mobile test 320, 360, 390, 430, 768, 1024, 1440 widths; touch targets >=44px; color contrast WCAG AA; drawers trap focus and restore; readable Indic type; proper keyboard controls.
- No layout shifts when swatches load images; no accidental horizontal overflow, sticky bars covering footer/buttons or thumb gallery.

---

## 8. ADMIN CONTROL CENTER: REAL MERCHANDISING & APPAREL OPERATIONS

Augment existing Gita Admin and Medusa Admin, never create duplicate control paths. Make each admin action map to a live storefront outcome. Implement protected areas and roles:

| Admin function | Expected controls | Frontend effect |
|---|---|---|
| Design workbench | Verse source review, garment cut, colours, art style, image jobs, media QA, publish/rollback | New accurate products/collection visuals |
| Garment library | Base blanks, silhouettes, fabric, GSM, measured size charts, approved colourways, supplier sample, print capability | Real fit/material filter and descriptions |
| Creative collections | Seasonal story, hero sets, collection ranking, inclusion rules, media/copy versions | Curated home/category pages |
| Catalog/variants | SKU, stock/preorder stage, prices, size/color, SEO, approval | Cards, swatches, stock/orderability |
| Media library | Licensed sources, masks, render queue, duplicate detector, QA contact sheet, approvals | Product hero/gallery publishing |
| Content/rights | Gita chapter/verse source, translation rights, original content review, script QA | Correct product text and story |
| Preorder & manufacturing | Supplier capability/capacity, sample proofs, production batches, ETA, escalation | Real preorder availability and order timeline |
| CRM/interest | Design wishlists, waitlist requests, consent, demand by collection/size/colour | Better product prioritisation; no fake sales |
| Pricing/promos | True SKU price, GST, margin floors, valid coupon and historic MRP | Correct price/discount math |
| CMS | Home hero, drop banners, category chips, lookbooks, navigation | Instant published updates via revalidation |
| Orders/refunds | Deposit/balance, cancel/refund reconciliation, shipments, communications | Accurate account and email status |
| Growth analytics | Clicks, variants selected, wishlist, requests, reservation conversion | Demand ranking and funnel improvement |
| Access/audit | Merchandiser, designer, finance, operations, customer support, superadmin | Safe limited edit rights |

**Workflow state:** `DRAFT → ARTWORK_REVIEW → MEDIA_REVIEW → SAMPLE_CAPABILITY_REVIEW → MERCH_APPROVED → CONCEPT_VISIBLE → PREORDER_ELIGIBLE → PREORDER_OPEN → CLOSED`. Moving between states must be enforced server-side. `CONCEPT_VISIBLE` does not imply money can be taken.

**Product approval gate**: design rights, native language text verification, garment truth, media source/license, approved cut/size, price/tax, manufacturer print capability, paid-order capacity and ship window. Separate **creative approval**, **media approval**, **manufacturing readiness**, **financial readiness**. Support mass review actions but never automatically approve unsafe data.

**Metrics**: raw candidate count, real base-design count, distinct published designs, visual QA pass rate, unique actual model reference sources, colour variants, product views, wishlist rates, request-to-preorder conversion, deposit liabilities, outstanding balances, COGS estimates and vendor throughput. Don't combine wishlists with sales.

---

## 9. MEDUSA V2 INTEGRATION — IN PLACE, SURGICAL, NO LOSS OF ATTRIBUTES

The repo already has `apps/commerce` plus Medusa bridge. **Do not reinstall from scratch or run incompatible duplicate migrations**. Use Medusa v2 as canonical commerce where actual migration is verified. Maintain a single source of truth per domain:

- `Gita Creative/Prisma`: verse content, artwork, Design DNA, media approvals, supplier proofs and the temporary authoring catalog.
- `Medusa`: product commerce records/variants after cutover, price lists, carts, payment/order lifecycle, customers, shipping, promotions, inventory/capacity interface.
- `Gita Bridge`: stable design ↔ Medusa product/variant IDs; publication proof states; reconciliation.

**Known bug to fix before flipping Medusa feature flag:** `apps/web/src/lib/commerce/medusa-catalog-adapter.ts` currently maps every Medusa product to `category:'tees'`, `palette:'charcoal'`, `status:'CONCEPT'`, false `orderable` and minimal image fields. Replace with strongly typed metadata mapping, reads from canonical creative records by external ID, and correct variant price, size, fabric/colour, category, garment family, media and publication state. Do not assume Medusa product options include the full Gita media rights record. Implement mapping tests for tees, pants, multiple colors, sizes, inactive products and preorder stage.

**Cutover pattern:** `GITA_READ` → `MEDUSA_SHADOW` (diff report, no public effect) → `MEDUSA_READ_CANARY` (1–5% read paths, verified) → `MEDUSA_READ` → isolated cart/payment migration after financial tests. Keep rollback for each. Compare counts, slugs, prices, currencies, variants, media, category, SEO and status per product. Any mismatch blocks cutover. No dual writes without idempotent outbox and conflict resolution. Never let Medusa defaults cause all products to become charcoal tees.

**Preorder model:** use Medusa approved product variants + custom production/deposit module where applicable; supplier capacity and preorder lead times must remain authoritative before accepting real deposits. Offer a separate guest interest/request path before commercial approval. No fake customers/orders or `payment captured` status based on a browser callback.

---

## 10. PREORDER-FIRST COMMERCIAL UX — MAKE TO ORDER, NOT MADE UP

There are two independent funnels:

**A. Preorder interest (available before payment activation):** product/variant/colour/size selector → email/phone consent → confirm request / waitlist record → receipt screen and optional opt-in update → demand dashboard. Copy must say **'No payment taken. This is not a confirmed order or manufacturing commitment.'** Implement guest-friendly lead intake with verification/rate limiting, idempotent POST, spam prevention, consent log, unsubscribe and privacy controls. Never require Google login to submit an interest request.

**B. Real commercial preorder (only approved SKUs after business gates):** valid variant → accurate total price → deposit (for example ₹99 configurable) or full prepayment → verified provider capture → customer receipt, capacity reservation → production batching → balance due notification → verified balance payment → manufacture/dispatch under signed business workflow → delivery; cancellation/refund path.

**Example accounting:** ₹999 total; ₹99 deposit captured; ₹900 outstanding. Display explicitly: `Total ₹999 / Pay now ₹99 / Later ₹900`; shipping/taxes include real amounts. Deposit is part of price. For failed, pending, partial, refunded, duplicated, cancelled payments, authoritative financial ledger reconciles to gateway. Never claim ₹99 paid when only a Razorpay order ID exists.

**For genuine make-on-demand launch:** A shared manufacturer-approved base garment + colour/size + verified print method and per-design artwork proof can support many artwork variants; do not demand 1,000 custom cut samples if commercially unnecessary. But vendor contract/capacity, fabric/fit sample for each approved garment base/style, colour/print capability, artwork right/quality and delivery estimates are still required. Only product/variant combinations actually covered may open preorders; others remain requests.

**Financial and legal release gate:** legal seller identity, tax and invoice process, reviewed policies, privacy and grievance support, payment provider KYC, sandbox and live webhook/refund testing, production capacity, cancellation terms, ETA, return/exchange terms, no misleading MRP. Keep `ENABLE_CHECKOUT=false` until signed approvals; Medusa feature flags must also fail closed.

---

## 11. SEO AND CONTENT ENGINE — 1,000 QUALITY PAGES, NOT 1,000 THIN COPIES

Create SEO program for main homepage, category, collection, verified culture/verse editorial, campaign landing pages and product pages:

- Unique product title/H1 by garment cut, original design name and relevant collection; descriptive 150–300 word **actual** differentiated copy only where supported by product facts; avoid keyword-stuffed synthetic duplications.
- Real canonical route (`/shop/[slug]`) with stable redirects from legacy slugs; product metadata change invalidates cache and updated sitemap, not destructive new URLs.
- `Product` structured data and `Offer` only when accurately offered for commerce; concepts should not misrepresent `InStock`, genuine reviews, price, aggregate rating or delivery. `ItemList`, `BreadcrumbList`, collection description and brand `Organization` structured data where appropriate.
- Variant URL strategy with canonical to main product unless truly unique indexable product with distinct content; no 1,000 indexable parameter/filter combinations; use `robots` and canonical correctly.
- `sitemap.xml` includes approved/quality published pages; noindex thin duplicates, broken assets, sandbox/demo and draft concepts until editorial/asset standards met. `robots.txt` should not disallow publicly indexed useful assets.
- Product `og:image` uses valid media asset; actual source URL must be reachable with HTTP 200, mime image, correct aspect. If concept isn't photo-ready, don't publish misleading thumbnails as Open Graph product photos.
- Page speed budgets: mobile above-fold image optimized, stable CLS, lazy load below fold, no N+1 media queries, server paging and caching/revalidation.
- Content hub with accurate Gita citations, English/Gujarati/Hindi interpretation correctly labelled, discoverable related designs; admin review and change log. `hreflang` only if real localized page exists, not machine-generated placeholders.
- Implement Search Console / analytics integration points with consent and server-side event observability; do not invent traffic numbers.

---

## 12. RELEASE PHASES — BUILD, VERIFY, SHIP

### Phase 0 — Baseline and protection

- Update branch; compare HEAD with current deployment. Create feature branch `feat/fashion-storefront-relaunch` if permitted; otherwise work safely without overwriting changes.
- Inventory current records, images, approved states, model source files, Medusa bridge, Railway topology, tests, redirects and SEO.
- Snapshot production data/storage and document rollbacks. Seed and migrate in isolated staging first.
- Run all existing checks; document preexisting failures separately.

**Exit:** baseline with real evidence; rollback known; no destructive updates.

### Phase 1 — Fashion merchandising schema + importer

- Add garment base-style, colourway, artwork, design/variant/collection and publishing metadata as needed.
- Refactor existing 1,000 design briefs into curated, versioned Design DNA and fashion-led product names; preserve old links and stable IDs.
- Full creative/variant/media mapping with Medusa bridge shadow; fix hardcoded tees/charcoal data loss.
- Add admin review/variant tools and content integrity tests.

**Exit:** 1,000+ base creative records verified distinct, no duplicate overwrite; taxonomy and attributes actually queryable.

### Phase 2 — Original garment artwork + photo pipeline

- Make real garment-specific artwork, accurate silhouette assets, source masks, model photography/VTON adapters, transparency and typography.
- Add licensing/source inventory and per-asset QA. Use persistent storage and human approval.
- Pilot **48 distinct designs** across >=5 patterns/subtypes, >=10 colours, both top/bottom, >=4 verified actual model source images if available; if no licensed pants models, report blocker and do not fake them.
- Prioritize a **hero catalogue subset** that can pass qualitative review. The rest of 1,000 concepts remain discoverable but not falsely positioned as model-photo finished.

**Exit:** contact sheet reviewed, no purple rectangle/technical outlines, exactly matched images per approved SKU and colour.

### Phase 3 — Mobile PLP + PDP + home revamp

- Implement new responsive visual system, category rails, photo-first 2-column grid, wishlist, filters, sorting, swatches, sticky bar, search, collection campaigns.
- PDP carousel with front/back/close-up/lifestyle, true size guide/selection, pincode, preorder/interest CTA, accordions, suggested looks, source attribution.
- Clean consumer-facing copy; keep legal truth; no massive demo/debug banners. Remove demo credentials for production, **not just the visual banner**.
- Add empty, loading, errors, accessibility and performance.

**Exit:** actual screenshots at mobile widths look like professional retail, not technical demo; controls genuinely work.

### Phase 4 — Admin control and CRM/demand

- Admin design approval, batch media QA, publish/rollback, campaign CMS, garment specs, colour library and real facet counts.
- CRM interest leads + wishlists, source attribution, demand per design/size/colour, notifications and unsubscribes.
- Medusa and Gita publication sync with shadow parity reports.

**Exit:** changing approved design/price/media/collection in admin changes only intended frontend entities with audit trail and cache invalidation.

### Phase 5 — Preorder commercial readiness (depends on external approvals)

- Implement all payment/fulfillment code paths and sandbox tests independently, but production charges remain off if required credentials/approvals absent.
- Supplier shared-blank/printing capability matrix, base garment fit samples, quantity reservation, cancellation and shipping windows, deposit/refund ledger, guest/order status.
- Activate only genuine approved product variants, with separate go-live checklist and founder authorization.

**Exit:** checkout `NO-GO` until real approvals, or `GO` only with evidence. Do not hold fashion facelift hostage to payment onboarding.

### Phase 6 — SEO, QA and Railway

- SEO/canonicals/sitemaps, performance/accessibility, monitoring and image CDN.
- Automated and visual tests on staging; seeded DB twice; try rollback; deploy approved frontend to production.
- Verify live deployed SHA, actual media URLs and 1,000-record counts, not local generated hashes.

**Exit:** evidence-based frontend GO / commercial GO separately, with screenshots and exact URLs.

---

## 13. ACCEPTANCE TEST MATRIX — THESE MUST BE EXECUTABLE

### Creative catalogue

- [ ] `>=1000` unique base-design concepts from creative manifest; 2nd import has zero dupes.
- [ ] Apparel family, fit/cut, silhouette, palette, language, verse provenance, placement and print role are persisted and queryable.
- [ ] No concept falsely attributed to scripture; missing rights cannot publish.
- [ ] 48 curated hero-ready designs visibly different in actual photo/contact sheet; model reference count reflects independent photo hashes, not IDs.
- [ ] First 12 mobile cards include believable model-worn garments for promoted products, not a 2D pant outline or shared colour block.
- [ ] Model-worn pants actually show pants waist-to-ankle; no tee substitution. Front/back same garment/colour/artwork.
- [ ] All long/Indic text shows exact glyphs and is readable; no opaque rectangular backgrounds behind artwork.
- [ ] `ProductMedia` correct for variant and role, content hash/provenance/asset file exists, appropriate reviewer status.

### Storefront

- [ ] Home, category, search, collection and PDP are designed and actionable at widths 360, 390, 430, 768, 1440.
- [ ] Listing cards show name/type/price/colour, useful wishlist and accurate front photo; 2-column shop and sticky filter/sort mobile.
- [ ] Every filter changes result set and URL; sort stable; pagination does not duplicate/skip items.
- [ ] PDP uses accurate colour swatch→media→price/size; no CSS-only fake garment colour.
- [ ] Front/back gallery thumb buttons and swipes work; one broken media asset fails QA.
- [ ] `Size guide`, `How preorder works`, delivery pincode, materials, product story and relevant related products are usable.
- [ ] Guest interest request has correct status and confirmation; duplicate/abusive submissions are handled safely.
- [ ] No `DEMO MODE` credentials or developer debug copy on public pages in production; finance features still genuinely disabled if not approved.
- [ ] Every displayed fabric/fit/size/ETA detail traceable to verified product/vendor metadata or visibly proposed.

### Commerce/Medusa bridge

- [ ] Under shadow/canary, Medusa and Gita product family, price INR paise, status, variants, fit, colour, photo, slug and tax match; **no hardcoded `tees` and `charcoal`**.
- [ ] No phantom published `PREORDER`/stock from a concept, and no unauthorized price change.
- [ ] Supplier/rights/media/orderability gates enforced server-side even if client modifies request.
- [ ] Deposit ₹99 example reconciles full total and outstanding balance, signed webhooks idempotent, refunds tested in sandbox before live use.
- [ ] A user can understand when they are simply requesting design vs placing a paid order.

### SEO/performance/security

- [ ] Canonicals, OG thumbnails, robots and sitemap audited for at least 100 sample products plus top collections.
- [ ] No duplicate title/meta boilerplate across 1,000; thin/unapproved pages noindexed where appropriate.
- [ ] Real p75 performance where measurement exists or Lighthouse lab budget accurately reported; image URLs don't invoke CPU render per user request.
- [ ] Admin RBAC/CSRF/rate-limit validation, security review, no leaked secrets or public demo credentials.
- [ ] Existing Next.js, Medusa, Prisma migration, unit/E2E builds pass or actual blockers documented with evidence.

### Deploy/evidence

- [ ] `npm ci && npm run typecheck && npm run lint && npm test && npm run build` in applicable packages; Medusa tests/build also executed.
- [ ] Railway stage deployment healthy, screenshot diff for 360px/390px mobile, test browsing actual live catalogue.
- [ ] Production promoted only passing approved changes, deploy SHA/ID reported; rollback exercised.
- [ ] Report `designs`, `colour variants`, `actual orderable SKU variants`, `images generated`, `approved hero images`, `model-source hashes`, `products missing photos`, `mockups-only`, `real paid orders`, `interest-only leads` separately.

---

## 14. INTEGRATION TEST CASES / IMPLEMENTATION DETAILS

Write tests and scripts rather than hand-checking only:

```text
T-01 old-vmb-slug-survives-and-resolves
T-02-gita-verse-source-and-native-script-exact
T-03-1000-base-designs-are-distinct
T-04-variant-colour-image-mapping-and-no-cross-contamination
T-05-no-tee-media-on-track-pant-and-vice-versa
T-06-no-artwork-opaque-squares-or-garment-mask-spill
T-07-actual-source-model-uniqueness-not-metadata-slot-count
T-08-front-back-colour-and-graphic-consistency
T-09-no-fabric-size-or-supplier-claims-without-proof
T-10-seed-two-runs-create-no-duplicates
T-11-deleted-or-unapproved-media-is-not-consumer-hero
T-12-storefront-filter-colour-size-fit-price-language-and-sort
T-13-zero-results-and-invalid-page-route
T-14-size-selection-and-swatch-update-PDP-cart
T-15-preorder-interest-no-payment-accurate-receipt
T-16-no-orderability-without-capacity-tax-sample-rights
T-17-medusa-shadow-parity-all-fashion-fields
T-18-idempotent-payment-webhook-and-balance-ledger
T-19-mobile-sticky-bottom-bar-and-drawer-keyboard-accessibility
T-20-sitemap-canonical-structured-data-and-no-fake-offer
T-21-image-public-url-200-correct-mime-valid-bytes-sha
T-22-demo-auth-disabled-in-production-not-just-banner
T-23-admin-publication-change-invalidates-storefront-cache
T-24-railway-redeploy-does-not-break-persistent-media
```

Add Playwright E2E if not installed: mobile screenshot tests for shop, a real T-shirt PDP and a real track pant PDP, filters, colour change, size chart, reserve-interest and navigation. Save before/after evidence to `apps/web/docs/qa/fashion-relaunch/` with manifest of image/test SHA, not just screenshots floating in temporary workspace.

For live visual comparisons avoid The Souled Store asset copying. The seven founder screenshots are acceptance references for *fit visibility, gallery, facets, image variety and hierarchy*; your resulting Gita UI needs original art direction.

---

## 15. HOW YOU MUST WORK AS CURSOR AGENT

1. **Understand before modifying:** Inspect current git/DB/Medusa state and screenshots; don't overwrite changes made since the reference SHA.
2. **Create an evidence-backed gap list** sorted P0 = garment quality and retail UI, P1 = creative/admin/publishing, P2 = commercial/SEO, P3 = expansion.
3. **Ship P0 first:** fix flat-lay-only consumer hero; create approved 48-design campaign subset and full mobile shop/PDP UX; do not spend first week reinventing admin CRM when product images remain poor.
4. **Implement as source edits:** schemas, services, components, API routes, SQL/Medusa migrations, tests, seed scripts, design manifests, real images only when authorized tools/hardware/photos exist.
5. **Make local stages autonomous:** if real AI rendering capacity is unavailable, implement fully the job/provenance pipeline and produce what accurate, license-backed assets allow. Mark missing photos as blockers; do not label generated prompts as actual images.
6. **Run tests continually** and fix the actual errors; record command, output, pass count, date and code SHA.
7. **Use separate feature flags** for new store UI, candidate media, Gita/Medusa shadow reads, interest intake and real paid preorder. Ensure old live customer history is untouched.
8. **Publish to Railway safely:** never run unbounded GPU jobs on web request path, never wipe Postgres, and never expose app secrets. Deploy to staging first; public feature cutover requires parity, screenshots and rollback plan.
9. **Do not ask the founder to re-supply already-known URLs/specs.** Human input only for truly necessary licensing, supplier, legal, merchant credentials, domain access, and approval of model/campaign assets.
10. **Do not stop with a roadmap.** Write code and evidence until all feasible, tool-accessible tasks are completed in this session. If platform/session limits stop work, produce a precise resumable state, not a false 'done'.

### Required final answer format from Cursor

```text
Git HEAD inspected:
Production SHA before / after:
Phase completed:
Changed files and migration names:
Actual creative designs in DB:
Distinct base garments / cuts / colours / artistic treatments:
Human source photo count (independent):
True on-model photo approved count:
Real product images per family and colour:
Flatlay-only / missing-media counts:
Storefront pages and responsive screenshots:
Preorder interest pathway status:
Real paid-order eligibility count:
Medusa shadow parity count and mismatches:
Tests passed / failed and commands:
SEO and performance measurements:
Railway web + worker + Medusa health/deploy IDs:
Blocking external approvals, licenses and costs:
GO/NO-GO (visual browsing vs paid preorders, separately):
Next exact action for the founder:
```

**FINAL SUCCESS STANDARD:** Customers see varied **fashion**, fit and colour, desire a particular design, understand the garment and original words, and can express genuine preorder interest or place a legitimate paid preorder if that product is approved. They do **not** see giant lavender technical drawings, reused models with inaccurate shirts, fake stock, AI-model disclaimers dominating the page, or programmer-only metadata instead of a shopping experience.

---

## 16. ONE-LINE EXECUTION INVOCATION

Paste this in Cursor Agent after saving this file in the repository root:

> **Act as Principal CTO, Fashion Creative Director and Senior Enterprise Commerce Engineer. Read `GITA_COMPLETE_FASHION_STOREFRONT_REDESIGN_CURSOR.md` in full, re-audit latest main and Railway, then EXECUTE the entire contract in staged, surgical, idempotent code changes. Prioritize actual model-worn apparel truth and the premium mobile store before touching secondary modules. Preserve 1,000+ distinct creative designs and the existing Medusa bridge, fix hardcoded apparel mappings, build real admin-controlled colourways and preorder-intent flow, verify human-readable scripts/media rights, run QA including screenshot evidence, deploy safe changes to Railway, and report actual GO/NO-GO with deployment IDs. Do not stop at planning, do not invent completed imagery or payments, and do not overwrite production data.**

