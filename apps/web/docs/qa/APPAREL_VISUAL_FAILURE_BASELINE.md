# Apparel visual failure baseline (2026-11-15)

Live shop audited: `https://web-production-b2b81db7.up.railway.app/shop` @ deploy on `main` `98aa0f9`.

## Root causes (code)

| Module | Failure |
|--------|---------|
| `artwork-raster.ts` | Opaque full-frame `rect` fill → solid colour squares on chest |
| `garment-placements.ts` | Broad SVG polygons recolour face/neck/background |
| `render-on-model-raster.ts` | Uses tee editorial photos for `PANTS` DNA |
| `model-identities.ts` | 24 IDs map to ~6 unique source photos; no garment-family gate |
| `fabric-recolor.ts` | Recolours every mask pixel including spill |

## Pilot SKUs (before)

| Slug | Title family | Hero shows | Defect |
|------|--------------|------------|--------|
| `vmb-1000` | AMBITION Track Pant | Male in black tee | Olive polygon + opaque square; no pants |
| `vmb-0998` | AMBITION Track Pant | Female in dark tee | Tan polygon + orange square; no pants |
| `vmb-0999` | AMBITION Tee | Male in black tee | Purple polygon + purple square |
| `vmb-0997` | AMBITION Tee | Same pool as above | Opaque print block |

Before frames saved under `docs/qa/apparel-visual-baseline/before-*-front.webp`.

## Honest source inventory (pre-fix)

- Distinct editorial photo paths under `public/images/`: **11 files**, ~**5–6 unique human poses** (Quiet Power + Karma sets).
- Licensed **pants on-model** photos: **0**.
- Therefore pants must use garment-accurate flat-lay until commissioned bottoms photography exists.
