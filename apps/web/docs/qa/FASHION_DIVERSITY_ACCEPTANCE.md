# Fashion diversity acceptance

## P0 defect (fixed)

`attach-concept-model-gallery.ts` reused the same `/images/*-editorial-*` assets for all concept SKUs and set `approvedForPublication: true`. That script is **blocked** unless `--legacy-simulation-only` is passed (never on production).

## Remediation pipeline

1. `npm run db:remediate:template-media` — unapproves shared templates on `vmb-*` concepts.
2. `npm run db:register:product-visuals-v2` — persists Design DNA on `conceptMeta` and registers per-SKU `/api/catalog/visual/{slug}/{view}` previews with `contentSha256` and `storefrontVisible: true` (not purchase approval).
3. `npm run audit:visual-diversity` — distinct URL / content-hash counts; fails if shared templates remain approved.

## Human gates

- `approvedForPublication: true` — only after human review of **on-model** or **photographed** assets.
- Storefront cards may show `TYPOGRAPHIC_FLAT` previews labelled **DESIGN PREVIEW**.

## GPU on-model (next)

Queue FASHN VTON / Diffusers jobs via existing worker — do not attach template URLs.