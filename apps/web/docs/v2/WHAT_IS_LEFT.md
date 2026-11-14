# VERSE//MODE — Gap Analysis (updated during V2 execution)

## Verified state after V2 merge into `apps/web` (15 Nov 2026)

| Workstream | Status | Evidence / notes | Launch critical |
|---|---|---|---|
| Storefront PDP media | **IMPROVED** | Quiet Power + Karma have multi-view AI-simulated photos; SVG no longer primary merch for those SKUs | YES |
| Honest empty media state | **PASS** | Products without `media[]` show photo-pending / empty state, not fake stock | YES |
| Verse library UI | **PASS (draft)** | `/inspiration` + `data/v2/*` seeds; translations still NEED_NATIVE_REVIEW | YES |
| Content DB models | **IMPLEMENTED** | Migration `20251115030000_v2_content_library` + seed script | YES |
| Admin content / collections | **SCAFFOLD** | `/admin/content`, `/admin/collections` — additive; does not replace other-agent Admin modules | YES |
| Design worker pipeline stages | **DOCUMENTED** | `src/lib/studio-pipeline.ts` stage list; worker still draft-assembly + graphic enrich | YES |
| Checkout / payments | **BLOCKED** | Sandbox adapters exist; live keys / KYC / counsel gates remain | YES |
| Supplier sample / GSM | **BLOCKED** | Fabric targets are proposals only | YES |
| Franchise/POS | **DEFER** | Other agent owns demo/pilot foundations — do not clash | NO |

## Go-to-market gates (unchanged)

**Concept → Creative review → Source verified → Rights cleared → Translation reviewed → Print-ready → Manufacturer blank → Sample QC → Photos approved → Capacity/dispatch → PREORDER → Paid order.**

## Priorities remaining

1. Native language review for EN/HI/GU drafts; expand locales per matrix.
2. Wire ProductMediaV2 rows to real object storage + approval workflow.
3. Complete studio stage machine persistence on JobRun.
4. Physical sample + tech pack signoff before enabling `ENABLE_CHECKOUT` for any SKU.
5. Google OAuth production redirect + Razorpay sandbox E2E on Railway.
