# On-model SKU render acceptance

## Storefront policy
- **Primary thumbnail:** `ON_MODEL_RASTER` or FASHN `ON_MODEL_VTON` (`isSimulation: false` only for publication approval).
- **Hidden from cards:** `TYPOGRAPHIC_FLAT`, `/api/catalog/visual/*` SVG routes, shared template URLs.

## Batch jobs
```bash
npm run db:batch:on-model -- --limit=20
npm run db:batch:on-model -- --limit=100 --offset=0
npm run audit:on-model-catalog
```

## FASHN upgrade
When `FASHN_VTON_API_URL` + GPU weights are live, use `tryVtonOnModel()` — simulations are never storefront-published.

## Honest limits
Raster pipeline uses licensed editorial photography with per-SKU colour grade and deterministic print overlay until full VTON is provisioned. Commission 24 distinct model shoots to replace identity slot reuse.