# 1,000 concept catalog progress

| Gate | Target | Current (engineering) | Status |
|------|--------|------------------------|--------|
| Source briefs CSV | 1,000 | 1,000 (`data/design_briefs_1000.csv`) | VERIFIED_FILE |
| DB `Product` concepts | 1,000 | Run `npm run db:seed:1000-concepts` on migrated DB | SCRIPT_READY |
| Variants (6 × disabled) | 6,000 | Same seed | SCRIPT_READY |
| Paginated `/shop` | 30/page | Implemented (`queryCatalogPage`) | IMPLEMENTED |
| Front on-model approved | ≥1,000 | 0 (pipeline not run) | BLOCKED_GPU |
| Back on-model approved | ≥1,000 | 0 | BLOCKED_GPU |
| Artwork editorial sign-off | per SKU | REQUIRED flag on all concepts | NOT_STARTED |
| Supplier/sample approval | per SKU | REQUIRED | NOT_STARTED |
| Paid preorder eligible SKUs | 0 until gates | Demo Quiet Power only when seeded | GATED |
| ₹99 deposit checkout | Policy + webhook | Schema + `calculateDepositBreakdown`; `ENABLE_DEPOSIT_CHECKOUT` default off | IMPLEMENTED_UNTESTED |

**Honest headline:** concept import and storefront pagination are implementable now; live customer preorders remain **NO-GO** until media QA, supplier proofs, legal seller, and Razorpay sandbox/live merchant are verified.