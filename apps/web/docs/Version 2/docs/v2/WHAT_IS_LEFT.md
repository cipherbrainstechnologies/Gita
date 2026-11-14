# VERSE//MODE — Gap Analysis, 15 November 2026

## Verified state of the source kit (NOT a claim about live Railway DB)

| Workstream | In baseline | Still missing / action | Launch critical |
|---|---|---|---|
| Storefront UI | Next.js pages and concept product views | Real catalog API, approved media galleries, stock-neutral product specification, accessible PDP, size guide, cart; migrate off hardcoded sampleConcepts | YES |
| Authentic quotations | 1,000 artificial English slogans, 1,000 machine-combined design briefs | Canonical cited Sanskrit, source edition verification, original-language storage, translation approvals, rights workflows and editorial curating | YES |
| Product appearance | Basic flat SVG shirt silhouette | Actual manufacturer garment blanks, accurate artwork placement, authorized realistic on-model mockups and physical sample photography; front/back/details | YES |
| Design worker | Queue endpoint, briefs and worker scaffolding | Live AI rendering provider, semantic/perceptual dedupe, authoring & typography, layout engine, photo compositor, print-ready export, signed proofs | YES |
| Garment materials | Placeholder fabric field and speculative sizes | Supplier-verified cotton composition/GSM, size measurements, washes, seams, label, care, testing, MOQ and SLA | YES |
| Google sign-in | Auth.js integration scaffold | Google OAuth project, secure redirect, sessions, consent, production tests | YES |
| Admin | Pages/scaffolds | Full CRUD, design reviews, content sourcing, language review, access control, manufacturer batches, finance/returns/fulfilment, audit | YES |
| Checkout/payment | Explicit 503 / closed | Merchant KYC, live/test credentials, server-authoritative price & inventory, idempotent orders/webhooks, refunds, no fake success | YES |
| Shipping/communications | Provider requirements | Provider account/credentials, pincode check, shipping promises, AWB, tracking, outbox and verified opt-in templates | YES |
| Tax/legal | Original draft templates | Legal entity, GST/HSN/tax labels, invoice format, original policies reviewed by counsel, cancellation/refund/preorder rules | YES |
| Franchise/POS | Architecture spec | Store-level stock ownership, payments, tax, returns, transfers, settlements; later phase after online launch | NO (defer) |
| QA/production | Small unit tests / CI scaffold | Real DB seed/migration, E2E browsers, device/responsiveness, webhook race, supplier proof gate, load & security tests, monitoring | YES |

## Go-to-market gates

**Concept -> Creative review -> Source verified -> Rights cleared -> Translation reviewed -> Print-ready source -> Manufacturer blank chosen -> Sample produced -> Fit & print QC signed off -> Product images approved -> Production capacity and dispatch commitment -> PREORDER PUBLISHABLE -> Paid order -> Production and shipment.**

Customer-visible price, sizing, GSM and expected shipping times remain *illustrative* until confirmed. A model's simulated image is not a substitute for a physical garment sample.

## Priorities

P0 (before public launch): verified Gita content, actual product gallery, supplier tech pack and sample, Google auth, RBAC, order/payment/shipping, returns/legal/tax, QA.

P1 (first growth): 100-300 approved original designs, native-review translations, category/seasonal promos, communication flows, customer service analytics, paid marketing only to compliant audiences.

P2 (scale): 1,000+ screened design candidates, franchises/POS, licensed fan collections, advanced try-on, international sales, many more languages.

## Important IP distinction

- Ancient Sanskrit text can generally be used as public-domain source material. Modern translations, artwork and sound recordings can still have copyright or license restrictions.
- A short phrase attributed to a film/anime is not automatically safe to put on paid merchandise. Treat named franchises, character designs, recognizable costumes, logos and iconic dialogue as a **license-first** category; otherwise invent standalone original story-driven language.
- The founder's Instagram screenshot phrase is not authenticated as Bhagavad Gita or classical Sanskrit. Keep `data/v2/screenshot_quote_unverified.json` quarantined until a credible source and linguist confirm provenance.

## Current demo behavior

The new `/shop/karma-action-oversized-tee` page now has an original simulated editorial front/back image in three views. The `/shop/quiet-is-a-power-move` page now **fails visibly and honestly** instead of presenting a low-fidelity SVG as saleable merchandise; it requires a matching product photo and signed tech pack. All demo checkout is still DISABLED.
