# Acceptance matrix — enterprise admin

| Module | Status | Preorder gate |
|--------|--------|---------------|
| Command center | VERIFIED STAGING | — |
| Catalog 1000+ | VERIFIED LIVE | concepts only |
| Model previews | IMPLEMENTED (attach script) | not sample proof |
| Deposit policy | IMPLEMENTED | disabled prod |
| Orders/refunds | PARTIAL | no provider refund |
| Marketing promos | SCAFFOLD | — |
| CMS | SCAFFOLD | — |
| Studio GPU | BLOCKED CONFIG | — |
| Payments live | NO-GO | external KYC |

**Visible catalog products (DB):** 1000 concept SKUs + editorial samples  
**Front/back approved media rows:** run `audit:1000-catalog` after `db:attach:concept-gallery`  
**Preorder-eligible variants:** 0 (production safe)  

**GO browse / model preview:** YES when attach script run on production DB  
**GO paid customer deposits:** NO-GO until legal, Razorpay, supplier capacity, unique per-SKU renders reviewed