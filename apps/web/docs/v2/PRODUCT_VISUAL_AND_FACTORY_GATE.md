# Real product photography, textile quality and shopper-ready PDP

## Why baseline failed

`src/components/GarmentArt.tsx` is a simple vector outline with two lines of SVG text: usable as a concept thumbnail, **not** product photography. Do not publish or sell this mockup as if it is physical inventory.

## Gallery contract

Each saleable tee/jogger must have verified **front, back, side, print close-up, fabric/neck rib or stitching close-up and on-model** imagery; garment color and printed art must match SKU and proof. Lifestyle images are optional and should never replace documentary detail images. An AI composite may be used in the concept stage, clearly labelled simulated.

`/shop/karma-action-oversized-tee` includes a first original AI studio mockup split into front, back and paired images, solely to demonstrate improved gallery styling. The artwork typography and physical garment are not factory-verified. Prior to preorder, replace synthetic imagery with supplier-approved sample photos and genuine texture/size evidence.

### Design direction and manufacturing choices to evaluate

| Garment | Initial vendor brief (not product claim) | Proof requirements |
|---|---|---|
| Everyday oversized tee | 100% combed cotton single jersey, evaluate 220–240 GSM, drop shoulder, rib crewneck | Actual GSM + wash shrinkage/spirality, handfeel, colorfastness, stitching, fit, pilling and print wash cycle |
| Lightweight gym tee | Evaluate breathable performance blend or cotton option by activity use case, quantify fabric GSM | Moisture transport, breathability, wash performance, heat-transfer comfort |
| Premium relaxed tee | Evaluate 180–220 GSM cotton as alternative fit, colorfastness | Same, plus neck stretch and skew |
| Daily track pants | Evaluate cotton-poly blend French terry/interlock; straight/tapered options | Actual composition and GSM, dimensional stability, pilling and elastic/drawcord durability |
| Gym joggers | Evaluate 4-way-stretch knit, pocket construction and breathability | Recovery, stretch retention, seam strength, performance and wash tests |

These are **research specifications for RFQs**, not assertions of The Souled Store's exact construction or quality. Benchmark its customer-facing interaction patterns and verified product descriptions without copying protected designs, photos, branding, text or site code.

## PDP requirements

- Media gallery: keyboard-navigable with front/back/side/close-up and alt text; swipe on mobile; no derivative AI-upscale that alters print or garment.
- Garment info: legal seller, product name, SKU, color, print options, supplier-approved fabric composition/GSM, fit, wash-care, country of origin, manufacturer/packer/importer details where required, inclusive tax, all-in shipping fee before payment.
- Size: actual chest/shoulder/length or waist/hip/inseam in CM and inches; model measurement and worn size for on-model photos.
- No phantom low stock. Preorder means supplier capacity reservation, max order cutoffs, promised dispatch period, explicit cancellation and support.
- Order only for eligible product+variant; disable checkout if material/size/image/source/legal/shipping/tax proofs missing.
- A real customer must be able to get correct size, delivery expectation, returns/cancellation, tax invoice, customer support and a trackable order; no fake reviews or fabric-test badges.

## Media generation workflow

1. Purchase/use authorized blank garment pattern/sample media, or create high-quality simulated mockups with model consent and correct fit.
2. Produce print-ready SVG/PDF/transparent PNG asset with clear vector font outlines, placement millimetres and separation.
3. Composite approved print onto exact garment pattern for accurate *concept* front/back and multiple colorways.
4. Generate on-model view with licensed model data/AI provider; flag as simulated until real sample photo. Reject hand/face artifacts, unnatural drape, wrong seams, mismatched color, crooked text, inconsistent logo.
5. After factory sample arrives, photograph product and replace synthetic-only sales proof; supplier and merchandiser both sign off.
6. Store provenance of image generator/provider, prompt, revision hash, source artwork, retouching and approval in DB; never reuse model photo for a different SKU without accurate recoloring/re-approval.
