# Apparel visual recovery — pilot evidence

**Renderer:** `cpu-garment-truth-v4`  
**Date:** 2026-11-15  
**Git:** `734c531` on `main`  
**Railway web deploy:** `f399f4d1` SUCCESS · worker `5afe9f77` SUCCESS

## What changed

| Fix | Result |
|-----|--------|
| Transparent artwork PNG | No opaque colour squares on chest |
| Removed broad mask recolour + flip | No purple/olive face/body polygons; no mirrored logos |
| Pants → continuous waist-to-ankle flat-lay | Never tee photography for `PANTS` |
| Tee colour gate | On-model only for near-black colourways; else colour-matched tee flat-lay |
| Honest diversity | 24 assignment slots → **6** distinct human source photos; **0** pants on-model photos |
| Batch flags | `--dry-run --limit --offset --batch-size --force --force-version --resume --persist` |

## Pilot 20 (10 pants + 10 tees)

All `qaPass: true`. Frames in `docs/qa/apparel-visual-baseline/after-*-front.webp`.

- Pants: all `PANTS_FLATLAY_PREVIEW`
- Tees: mix of `ON_MODEL_CPU_COMPOSITE` (charcoal/chocolate) and `TEE_FLATLAY_PREVIEW` (saturated/light colourways)

## Asset shortages (honest)

- Commissioned track-pant on-model photography: **0**
- Distinct adult model faces in-repo: **~6** (not 24)
- Full colourway on-model library: not available → flat-lay used when colour ≠ black editorial

## GO / NO-GO

| Gate | Status |
|------|--------|
| Visual catalogue readiness (pilot 20) | **GO** for truthful garment class (pants≠tees; no polygon plates) |
| Full 1000 photoreal colourway on-model | **NO-GO** until licensed bottoms + colourway shoots |
| Paid preorder | **NO-GO** (`checkoutEnabled: false`) |

## Commands

```bash
npm run pilot:apparel-visual-20
npm run test
npm run typecheck
npm run batch:on-model -- --limit=20 --force
npm run batch:on-model -- --limit=20 --resume   # idempotent second pass
```
