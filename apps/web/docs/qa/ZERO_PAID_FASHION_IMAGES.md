# Zero paid API fashion imagery

| Path | Cost |
|------|------|
| CPU compositor `render-on-model-raster.ts` (Sharp + masks) | ₹0 |
| Self-hosted FASHN (`services/gpu-inference/adapters/fashn`) | ₹0 compute you already have (Colab/Kaggle/local) |
| FASHN paid cloud API | **Blocked** (`FASHN_VTON_PAID_API` not used) |
| OpenAI / Midjourney / Replicate paid | **Not integrated** |

## Batch
```bash
npm run db:batch:on-model -- --limit=20 --force
npm run db:batch:on-model -- --limit=1000 --force --batch-size=8
npm run audit:on-model-catalog
```

## Acceptance labels
- `visualKind`: `ON_MODEL_CPU_COMPOSITE` (storefront) | `ON_MODEL_VTON_FREE` (only real GPU, not simulation)
- `approvedForPublication`: false until human review
- Disclosure: digital preview, not factory sample