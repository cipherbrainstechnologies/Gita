# AI Apparel & Verse Factory — deterministic workflow with durable memory

## Repo choice
- **Main artwork orchestration:** `huggingface/diffusers` (`https://github.com/huggingface/diffusers`), optionally **ComfyUI** as an isolated GPU rendering service (`https://github.com/Comfy-Org/ComfyUI`); adopt a commercially-permitted **specific checkpoint** after license review. These can generate motifs/graphic compositions, but **cannot guarantee typography accuracy or factory-ready vector**. Render all words using deterministic font/layout tools and explicitly licensed fonts, not baked image-model text.
- **Optional virtual try-on:** FASHN VTON v1.5 (`https://github.com/fashn-AI/fashn-vton-1.5`, Apache-2.0 core): good for garment-on-model imagery; not a quote/print generator. Verify third-party component licenses and model input privacy.
- **Explicit exclusion:** CatVTON's default BY-NC-SA assets are not cleared for commercial use. ComfyUI GPL terms are not equal to model licenses. Source, output rights, checkpoints and third-party assets logged.
- **Railway topology:** Next backend orchestrates remote GPU API / user-managed ComfyUI GPU service. Railway CPU worker makes jobs, metadata and thumbnails; no assumption Railway provides suitable GPU.

## Design pipeline (all phases persisted)
`NEW_PROMPT -> IDEATION -> TEXT_REVIEW -> ORIGINALITY_CHECK -> ART_RENDER -> LAYOUT -> MOCKUP -> PRINT_VALIDATION -> HUMAN_APPROVAL -> PRODUCT_DRAFT -> READY_TO_PREORDER -> ARCHIVED`.
1. Fetch theme backlog + sales learnings (avoid demographic stereotypes). Select phrase type `ORIGINAL_ENGLISH`, `ORIGINAL_HINDI`, `ORIGINAL_GUJARATI`, `ORIGINAL_SANSKRIT_INSPIRED`, or `VERIFIED_HISTORICAL`. Historical line must store precise work, source, edition, license/public-domain assessment, editor; otherwise stay unpublishable.
2. Generate constrained 6–14 word English phrase or verified phrase variant. No copyrighted slogans, politician/celebrity voice, hateful material, false scriptural attribution, plagiarism or claims of proof via AI detection.
3. Normalize Unicode NFKC, whitespace, punctuation, case; SHA256 exact unique key; reject near-duplicates by token 3-gram Jaccard & embedding similarity (pgvector optional). Never delete rejected records: persist reason/hash. Different colors/sizes are VARIANTS of same design, not new designs.
4. Design brief: garment category/fit, typography stack/licensed font, line breaks, placement (left chest/center/back/sleeve/side leg/ankle), composition, colorway with CMYK approx, accent motif, all-over area and maximum print width/height from manufacturer. Mark `print_method`, `min_stroke`, bleed, line thickness, DPI if raster.
5. Render motif provider under license; text composited as editable SVG. Scan trademark keywords and source provenance; human designer tests readability at 1m, 30cm, on body wrinkles and in B&W. Output editable art SVG/PDF + high-res exported transparent PNG + accurate flat lay + separate AI lifestyle render labelled simulated.
6. Product manager only approves when sample vendor agrees printable color, garment fit, production lead time, cost and cancellation policy. Supply real size chart/fit table and approve final screenprint/DTF/embroidery proof.
7. Immutable design revision, art file SHA256, provider/model/version/seed/params, prompt revision, background source, language reviewer, approver, QA proof, supplier test record.

## One-click worker UX
Admin selects `theme`, `garment`, `audience (adults only by default)`, `batch_size` default 20 (max 100), `language`, `aesthetic`, target margin, design guardrails and optional stock/production capacity. Click `GENERATE`; server inserts job with idempotency key -> enqueues Redis BullMQ -> worker batch process with progress, cost estimate, retries (exponential + dead letter), cancel/resume, provenance -> review inbox. Always inspect cost before launching AI.

## Anti-duplicate design-memory algorithm
```
namespace = language + quote-normalized + garment-family + artwork-layout-family
identity = sha256(namespace)
BEGIN TRANSACTION; INSERT design_candidate(identity UNIQUE, idea_id, state='DRAFT'); COMMIT
if collision: mark already_existing and DO NOT regenerate
if semantic_similarity >= policy_threshold or pHash distance below threshold: pause for human review
reserve approved design slug and SKU namespace via unique DB constraint
store rejected/archived fingerprints permanently; variant color doesn't create a new concept
```
Near-duplicate blocking thresholds are **calibrated on the actual catalog**, not guessed hardcoded guarantees. Check OCR back from proof, exact quote matches, manual inspection and trademark review.

## Data resources
`data/verses_1000_drafts.csv` and `data/design_briefs_1000.csv` are initial editorial work queues **not all publishable**. Reject synthetic grammar, formulaic wording or semantic repeats even if unique exact hashes; 1000 is a backlog size, not quality metric. Do not call an English phrase Sanskrit or assign it to a famous authority without a source.

## Image & type production QA
Full print spec from vendor, minimum readable letters, garment-safe contrast and knit/hem interactions, try-on disclosure, photo consent, trans/non-binary fit access, skin-tone fidelity; don't synthesize minors as product models.
