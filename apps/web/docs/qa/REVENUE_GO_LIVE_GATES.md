# Revenue go-live gates (including deposit preorders)

| Gate | Owner | Status |
|------|-------|--------|
| Counsel-approved policies (preorder, refund, shipping, privacy) | Legal | BLOCKED |
| GSTIN + legal seller on Railway | Finance | BLOCKED |
| Razorpay KYC + webhook secret + sandbox capture/refund replay | Payments | BLOCKED |
| Manufacturer sample + graded size chart per style family | Operations | BLOCKED |
| `PreorderCapacity.confirmed` per paid SKU | Merch/Ops | BLOCKED |
| ≥1,000 approved front/back on-model assets | Studio/GPU | BLOCKED |
| Deposit terms disclosure on PDP + checkout | Product/Legal | PARTIAL (UI copy + server math) |
| Consumer Protection E-Commerce Rules (2020) + 2027 amendments tracking | Legal | IN_REVIEW |

**Deposit default:** `DepositPolicy.enabled=false`, `pauseDepositCheckout=true`. Full-price capture remains unless `ENABLE_DEPOSIT_CHECKOUT=true` and policy is deliberately enabled by staff after counsel sign-off.