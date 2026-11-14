# Content Studio V2 — Authentic source, multilingual writing, media rights

## Distinct content provenance categories (NEVER merge)

1. **SCRIPTURE_SOURCE**: exact canonical Sanskrit from specified edition + chapter:verse + direct verifiable URL. For example Bhagavad Gita 2.47. Content must not be AI-hallucinated.
2. **SCRIPTURE_TRANSLATION**: human-edited translation with locale, named translator, legal permission/license; do not scrape and sell translations from web pages without permission.
3. **SCRIPTURE_INSPIRED_ORIGINAL**: contemporary original slogan inspired by the meaning, explicitly attributed as *inspired by* rather than verbatim Gita.
4. **OTHER_PUBLIC_DOMAIN**: source rights/edition proof, authenticity review; e.g., older philosophical works and folk maxims when verifiably public-domain.
5. **MODERN_ORIGINAL**: brand-created motivation/friendship/gym/college/cinema-style lines; originality/trademark and cultural review, not falsely attributed to a celebrity or character.
6. **LICENSED_POP_CULTURE**: permitted verbatim film/anime/cartoon lines, images and logos ONLY once a written merchandise license is signed for specific regions/products/dates. Without license, store only internal reference research and generate distinctive original narrative themes instead.
7. **UNVERIFIED_SOCIAL_QUOTE**: quarantine until source can be confirmed; never attribute to Sanskrit scripture by tone or appearance.

## Quality example: Gita 2.47

Original Sanskrit: `कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥`

Source: https://heritage.iitk.ac.in/SBG/2.47

Original brand slogan: **DO THE WORK. RELEASE THE RESULT.** This is a modern editorial interpretation, not literal Gita text; the product copy must say *inspired by 2.47*.

Product concept: relaxed heavyweight garment, minimal left-chest wordmark `KARMA / ACTION`, geometric sunrise and mountains on back + short English interpretation, or an alternative exact Sanskrit excerpt only after native Sanskrit typesetting review.

## Language rollout

P0: Sanskrit source, English, Hindi and Gujarati. P1: Marathi, Bengali, Tamil, Telugu, Punjabi, Malayalam, Spanish and French. P2: German, Portuguese, Japanese, Korean, Arabic and Simplified Chinese. See `data/v2/launch_language_matrix.csv`.

- Store source text once; translations as separately versioned locale records. **Never run machine translation at request time and immediately offer it as a merchandise graphic**.
- Different source scripts require native typographic review, font licenses, shaping, print RIP validation, line breaks, diacritics, text direction and production proof.
- Arabic right-to-left and mixed numeral flows require dedicated testing. Sanskrit Devanagari conjuncts, mātrās, and marks must be manually proofed. Treat Japanese/Chinese glyph selection carefully.
- For each product, pick ONE primary language/typographic hero and optionally one secondary line; do not cram 18 translations on a tee.
- Translation workflow: generate draft -> source alignment -> language QA -> cultural QA -> print preview -> human signoff -> publish.
- Design language, website locale, and shipping destination are distinct settings. A website translated into Spanish does not imply the user can order to Spain.

## AI Studio prompt stages

1. **Discover** original/scriptural source; identify ISBN/reference/rights and canonical source URL.
2. **Verify** verse against publicly inspectable primary text and reject incorrect chapter verse, synthetic Sanskrit, unattributed modern translation.
3. **Ideate** by audience, fit, print method and brand tone. Aim for semantic diversity; reject generic filler or paraphrase loops.
4. **Localize** via AI draft but require human editor signoff for each locale.
5. **Design** multiple original print layouts: minimal chest, statement back, typographic wrap, vertical pants print, woven patch, embroidered logo, illustrated philosophy; ensure no familiar protected character/costume/logos.
6. **Preflight** copyright, trademark, typography, content sensitivity, sex/age appropriate claims, exact and vector/semantic/perceptual duplications.
7. **Render** three coordinated assets: original editable print art, accurate on-flat apparel preview, photoreal on-model simulation; clearly marked mockup.
8. **Prove** print-ready CMYK/spot workflows per supplier process, correct dimensions, color profile, colorways and bleed; require physical samples for launch.
9. **Gate** source approval + native language + commercial rights + art QA + supplier tech pack + sample photo + dispatch SLA before publish.

## Dedupe and immutable history

Persist exact source hashes, semantic embedding versions, visual perceptual hashes, garment type, print placement, colorway and motif; record discarded concepts to avoid regeneration; enforce DB uniqueness of source passage, localized passage and artwork SHA; use job run ID and repeat-safe retry records. Similar artwork must be detected across themes/languages. Newly created variants of one licensed motif are linked, not passed off as unrelated original designs.

## Sample review questions for every art asset

- Is the line authentic, original, or licensed? Are we crediting the proper author/work?
- Is the script spelling, grammar and cultural register correct? Is it faithful to the source?
- Is the design independently recognizable and distinct from other brand designs and protected franchises?
- Will small punctuation remain legible after washing and printing on dark/light material?
- Is the model image clearly a simulation, with no claim to be a factory proof?
- Do the approved garment specs match the commercial listing and actual manufacturer?
