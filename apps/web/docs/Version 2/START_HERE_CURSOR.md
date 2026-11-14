# CURSOR: VERSE//MODE V2 — FINISH THIS REAL FASHION COMMERCE PRODUCT (SINGLE EXECUTION INSTRUCTION)

You are the execution agent working as the CEO/product strategist, creative director, genuine apparel-production specialist, lead UI/UX designer, staff full-stack architect, security engineer, source-text and multilingual editorial quality lead, senior QA and delivery manager. **Deliver working, tested code and documented evidence, not roleplayed statements of completion.**

## The founder's reported defects and required outcome

- Running product URL reported: `https://web-production-b2b81db7.up.railway.app/shop/quiet-is-a-power-move` — its SVG tee is not a sellable-looking product. Replace/retire every SVG-as-product-photo visual. Use approved garment photography and genuine AI-simulated concept renders with truthful labeling. On all published PDPs show actual materials, sizes, color variants, prints, front/back/side/detail images, supplier-backed dispatch and working preorder steps.
- The 1,000 English synthetic phrases in `data/verses_1000_drafts.csv` are NOT authentic Gita or multilingual content. Do not treat them as ancient wisdom; archive as low-priority raw drafts.
- Founder specifically wants Bhagavad Gita Sanskrit shlokas; original/explanatory English/Hindi/Gujarati translations; more worldwide languages; great motivation/friendship/gym/college designs; anime/cartoon/movie **themes** and legally licensed dialogue, with original non-infringing alternatives by default.
- Business remains India-first, Railway-hosted, preorder-first **without saleable inventory until a sample and supplier-confirmed capacity/dispatch window exist**.

## FIRST: synchronize with the actual codebase

1. Read `README.md`, `START_HERE_CURSOR_V1.md`, ALL `docs/**`, ALL `data/v2/**`, and `src/**`, `prisma/schema.prisma`, `scripts/**`.
2. Determine whether you are in the original ZIP scaffold, the updated V2 scaffold or a different GitHub/Railway production source. **If a live existing application exists, perform an in-place merge**; do not wipe the running app, overwrite real customer records, remove current working integrations, or blindly reset its DB.
3. Create a git feature branch and baseline tests/status. Produce a proof-based inventory: working/scaffold/missing/broken. Make a granular delivery backlog in `docs/roadmap/DELIVERY_BACKLOG.md` tracking owner role, scope, priority, dependency, acceptance test and actual status. Update continuously.
4. Read source protection policy: no copying The Souled Store's assets/code/text/photos/patterns or modern translations without rights. Browse its site only for broad, permissible UX and material-quality benchmarks. Build an original identity and commerce design.
5. Ask for human input ONLY where real-world third-party documents, access, supplier lab results, trademark license, bank/KYC or legal sign-off are inherently needed. Implement fully testable sandbox flows and other work without blocking.

## P0-A: implement a real source-aware writing studio (authenticity first)

Use `data/v2/authentic_gita_seed.json` as the VERIFIED SOURCE TEXT demonstration; five real Bhagavad Gita verse references, URLs, actual Sanskrit and editorial draft interpretations are included. `data/v2/original_slogans_seed.json` contains 25 original language candidates. `data/v2/screenshot_quote_unverified.json` is explicitly NOT an authenticated Gita verse; quarantine it. `data/v2/launch_language_matrix.csv` sets language rollout.

Create fully functional DB-backed Content Sources -> Canonical Passage -> Translation -> Editorial Slogan -> Apparel Artwork -> Product Release chain. Extend existing models or the V2 Prisma models: ContentSource, ContentPassage, ContentLocalization, ApparelTechPack, ProductMediaV2 and ContentApprovalAudit. Generate migration **against the actual database safely** (backup and rollback); never assume a schema change has already run. Use unique passage keys, NFC normalization and fingerprints, source URLs, chapter/verse, copyright and license evidence. A media quote cannot be auto-approved for commercial garments just because it is short.

Content types with distinct validations:
- `SCRIPTURE_SOURCE` — exact source quotation with chapter and verse, human authentication.
- `SCRIPTURE_INSPIRED_ORIGINAL` — brand-authored modern interpretation; never claim exact translated Gita.
- `ORIGINAL_EDITORIAL` — independent modern slogans (gym, comedy, friendship, self-mastery, campus, culture, confidence).
- `HISTORICAL_PUBLIC_DOMAIN` — authenticated public-domain works with provenance.
- `LICENSED_POP_CULTURE` — direct anime/movie/cartoon/TV/game quotes or characters only with explicit territorial, product and usage rights.
- `UNVERIFIED_SOCIAL_QUOTE` — forbidden from scripture attribution and commercial publication until verified.

Build `Admin > Content Library` with import/verify/edit/compare/approve/reject/version/deprecate, source preview and exact user-facing attribution, locale reviewer assignment and audit. Create `Admin > Collections` for GITA//CODE, NO EXCUSES, CAMPUS CHAOS, THE NEXT ARC, WORLD//WORDS and CINEMA//STATE.

**Critical**: Gita contains roughly 700 canonical verses, so the demand for *1,000 authentic Gita verses* would be mathematically impossible; the target is **1,000+ approved culturally varied, distinct creative lines across all source classes**. Do not create fictitious ancient scripture to reach a count. Separate candidate count from approved quote count, print asset count and publishable product count. Reject the current low-diversity deterministic slogans from release if they sound templated/repetitive.

Language releases: P0 original Sanskrit plus English/Hindi/Gujarati; P1 Marathi/Bengali/Tamil/Telugu/Punjabi/Malayalam/Spanish/French; P2 German/Portuguese/Japanese/Korean/Arabic/Chinese Simplified. Add more on demand. Native review and cultural check are REQUIRED; for Arabic ensure RTL and bidirectional layout, for Devanagari and Indic scripts ensure ligature/matra/shaping correctness, and for East Asian languages ensure character and font correctness. Add localized storefront filtering separately from print-language choice. No raw on-the-fly machine translation of scripture as ready-to-print product copy. Store translation rights and exact version.

Creative quality goal: expressive contemporary designs, real typographic experimentation and visual narrative, rather than 1,000 plain sentences printed across a chest. Print variants: small left-chest artwork + large back illustration, back-only art, text-led wrap typography, vertical jogger embroidery, sleeve patch, woven neck label, minimal and loud variants. Automatically test layout clipping, exact script, readability after printing, no trademarked marks or too-similar visual identity.

## P0-B: build the AI apparel worker as a real production pipeline

Preserve the existing queue architecture and bounded one-click batching (20 default, 100 max). Worker chain:

`SOURCE_DISCOVERY -> PROVENANCE_RIGHTS_CHECK -> CONTENT_DEDUP -> SEMANTIC_EDITOR -> LOCALE_DRAFT -> HUMAN_LANGUAGE_REVIEW -> DESIGN_BRIEF -> DRAW_AND_LAYOUT -> PRINT_ASSET_EXPORT -> GARMENT_MOCKUP -> ON_MODEL_SIMULATION -> VISUAL_QA -> MERCHANDISER_APPROVAL -> SUPPLIER_TECH_PACK -> SAMPLE_SIGNOFF -> PREORDER_ELIGIBLE`.

- Use authorized image generation/rendering provider adapter. Hugging Face Diffusers/ComfyUI can underpin art concepts, but a print art layout and typography vector engine is needed; FASHN VTON is for try-on and not text graphic generation. Run GPU workloads on permitted external GPU/API, not in a Railway web instance. Respect model/weight/source licenses and user-data consent.
- Real editable print files (SVG/PDF or production standard, fonts outlined where legal) and layered art; source file + variants/version number, SHA256 hash, art dimensions mm, bleed/separations, color profile and printing method from real supplier.
- For actual manufactured shirts/tracks: supplier specification for cotton %/GSM, knit, yarn, neck rib, stitching, finishing, grading/size chart, wash shrinkage, colorfastness and print durability. No invented product properties or counterfeit 'premium' certifications.
- Visually accurate approved garment mockup and simulated on-model image (with clear provenance). Render apparel naturally: textile folds, true chest/back location, drape, natural lighting, no fake logos, no hallucinated text. Flag all generated photos as simulations until replaced by photographs of physical sample where approval requires.
- For each product, store real approved front, back, side, detail and on-model media; compare printed art revision and photo visually. Require human print and sample QC.
- One-click AI job must be idempotent and restart-safe with durable history, rejected/discarded outcomes, exact+semantic+perceptual duplicate checks, similarity thresholds and manual override with reason. New jobs must not regenerate previous ideas, artwork or variants merely by different wording.
- Build dashboards for jobs/failed stages, art proof previews, approvals, language verification, licensing expiry and manufacturer sample queues. No fake complete states.

## P0-C: premium customer UX and PDP

The current V2 scaffold includes `/shop/karma-action-oversized-tee` with ONE original AI concept photo prepared as a **visual direction prototype**, not a physical garment photo. It also intentionally shows an unready state on `/shop/quiet-is-a-power-move` because there is no corresponding approved image. Create real matching artwork/mockup/media for the Quiet Power tee; do not reuse Gita images for that design.

Replace hard-coded `sampleConcepts` with server-driven catalog database queries, durable asset storage (S3/R2-compatible), image CDN optimization, generated canonical URLs and accessible layout. Start with proof of product content quality: a real design has multiple consistent colors and views, verified print, composition/GSM, quality claims and care, genuine sizing table in cm/inches, model dimensions, clear tax-inclusive price and shipping disclosure. Mobile experience should resemble a serious consumer apparel storefront in usability, **without cloning a competitor**:

- Responsive top nav / collections / multilingual source theme exploration / search with synonyms / filters (gender cuts, fit, category, print language, fandom *licensed only*, fabric, color, price, new drops).
- Product grid with on-model front/back cards, preview swap, wishlist, authentic (non-fabricated) trust signals, fashion-led campaign assets.
- PDP with 6+ real/simulated truthful images, alt text, touch/keyboard gallery, fit info, fabric and care, mockup disclosure, stock-neutral preorder status, size recommender based on measurements, delivery/cancellation windows, reviews only from genuine customers once available.
- Purchase CTA only when eligibility gates pass. Until then `Notify me` opt-in (must be real), not misleading `Add to cart`.
- Document `isSaleable` invariant: source verified/rights cleared; art and text approved; actual sample approved; tech pack approved; official seller and legal policies complete; prices/tax confirmed; variant size/color/capacity/dispatch confirmed; real media approved; payment/shipping provider healthy; no outstanding safety/compliance blockers.
- Separate Men/Women/Unisex when cuts and sizing genuinely differ; no inference that one shirt fits all body types. Use clear inclusive design and real supplier-based sizes (XS–3XL only where approved).
- Add genuine preorder lifecycle and order lookup, appropriate browser-visible discounts and honest promotional pricing.

## P0-D: complete transactional backend, admin and Railway

Implement full data-backed cart, coupon engine (seasonal/category/launch/partner/birthday; eligibility, exclusivity, stacking, budget caps, anti-abuse), customer consent/account, Google OIDC, server-side admin RBAC, encrypted admin integrations in Postgres under Railway-held master key, order-state machine, Razorpay adapter + HMAC raw webhook and replay handling, payment reversal and partial refunds, invoice and tax document policy, pincode serviceability, shipping labels/AWB/tracking, e-mail/SMS/WhatsApp approved notifications, returns/RTO, support/admin audit, orders/finance dashboards, GST/HSN and seller disclosures, release metrics.

Production launch focus is D2C preorders; franchise/POS only **after** online pilot, with separate store stock/ownership ledger, controlled stock transfer, returns attribution, POS receipts, commission and tax. Follow original master `START_HERE_CURSOR_V1.md` and all existing architecture/security docs for deeper detail. Protect under-18 visitors from inappropriate targeting; get India consumer/privacy counsel review of customer accounts, DOB/birthday discounts and marketing consent. Do NOT copy Souled Store legal text: draft original policies tailored to actual seller and have counsel approve before checkout.

Railway services: Next.js web, persistent Postgres, Redis BullMQ worker, R2/S3 object storage, separate GPU/API provider, migration predeploy, backups, error and performance monitoring. Public assets must have allowed signed uploads and domain origin/CSP rules. Payments must run sandbox and test-mode before live. Configured integration secrets in DB must be encrypted/masked, never returned or echoed.

## Working output and acceptance tests

1. Run installation/build/typecheck/lint, unit, DB migrations against disposable DB, seed verification, Playwright desktop/mobile, a11y and upload security checks; report actual commands and results. Do not invent passes if environment is offline.
2. Add tests for: verified canonical passage + wrong-verse rejection; source category restrictions; harmful content/cultural review; diacritic/dead glyph failures; locale proofs; similarity/no-repeat even after worker restart; print asset dimension and hash consistency; AI-generated photo vs approved sample; cross-product media mismatch; unapproved product not purchasable; price/size tax authority; payment replay/out-of-order messages; refund and webhook HMAC; queue death/retry; multi-device UX and accessibility; phone and WhatsApp opt-in privacy.
3. Build a high-quality *demonstrably functional* initial creative collection (e.g. 12-24 art-rendered products if provider working; if not, at least 3 founder-approved realistic original designs with local static sample images, clearly labeled simulation, and a functioning upload/review path). Never fake that 1,000 finished designs exist merely because CSV rows exist.
4. Create a product acceptance sheet for each approved item: exact source, translation status, legal rights, original art license, supplier spec, size, images, cost/margin, sample result, dispatch, payment/shipping configuration, legal sign-off.
5. Update `docs/v2/WHAT_IS_LEFT.md` and backlog with PASS/FAIL/BLOCKED evidence and links. Produce `docs/qa/RUN_LOG.md` with real outputs and outstanding blockers.
6. Last report must distinguish **implemented**, **verified**, **not working**, **needs credentials**, **needs physical sample**, **needs legal review**, and **deployed**. Include actual Railway public URLs only if deployed and checked.
7. Iterate independently through all implementation stages; do not stop after writing plans, mocks or placeholders. If a third-party integration cannot be configured, keep its live action blocked and continue with testable sandbox and unrelated features.

This is one uninterrupted engineering execution instruction with real external gates. Begin by reading and merging safely, then implement in the prioritized order and verify each acceptance gate.
