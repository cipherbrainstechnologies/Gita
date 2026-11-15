# Live paid sale — NO-GO (2026-11-15)

User request: “Render everything and go for Live sale now, with Photoreal.”

## What is running now

| Action | Status |
|--------|--------|
| Full catalogue force-render (`--limit=1000 --force`) on Railway web | **IN PROGRESS** (PID on web container) |
| Storefront images via `/api/catalog/on-model/*` | Live (renderer hybrid photoreal + flat-lay) |
| Local RTX 5060 Ti FASHN weights | Partial (`model.safetensors` + DWPose downloaded; human-parser/env still incomplete) |

## Paid live sale — **NO-GO**

Cannot set `ENABLE_CHECKOUT=true` or take real money. Missing:

1. **Razorpay** — no `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / webhook secret on Railway web
2. **Legal** — GSTIN, counsel-approved policies (see `GO_LIVE_GATES.md` / `REVENUE_GO_LIVE_GATES.md`)
3. **Ops** — manufacturer samples + confirmed preorder capacity (only **1** product is `PREORDER` today; 1000 are concepts)
4. **Photoreal bottoms library** — **0** licensed pants on-model photos; pants stay flat-lay until commissioned
5. **GPU production host** — Railway `aiProviders.render:false`; local VTON not yet serving production

Current: `ENABLE_CHECKOUT=false`, health `stage:waitlist`, `checkoutEnabled:false`.

## Photoreal honesty

| Family | Photoreal now? | Method |
|--------|----------------|--------|
| Near-black TEES | Yes | Licensed editorial photographs + transparent print |
| Coloured TEES | No (colour-true flat-lay) | Until colourway photography or verified free VTON |
| PANTS | No (garment-true flat-lay) | Until bottoms photography / full-body VTON refs |

## Unblock paid sale (ordered)

1. Add Razorpay live keys + webhook; sandbox capture/refund replay evidence
2. Legal entity + GSTIN + signed policies on PDP/checkout
3. Promote only sample-approved SKUs to `PREORDER` with confirmed capacity
4. Flip `ENABLE_CHECKOUT=true` only after (1)–(3)
5. Optional: host FASHN on GPU box; point `FASHN_VTON_API_URL` (never paid FASHN cloud)
