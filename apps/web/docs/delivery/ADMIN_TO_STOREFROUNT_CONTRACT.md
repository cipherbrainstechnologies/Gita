# Admin → storefront contract (excerpt)

| Admin control | Storefront consumer |
|---------------|---------------------|
| `Product.status` + variant `enabled` | PREORDER chip, checkout eligibility |
| `Product.images` / `ProductMediaV2` | PDP gallery, card cover, model preview watermark |
| `DepositPolicy` | Checkout charge amount when `ENABLE_DEPOSIT_CHECKOUT` + enabled |
| `PreorderCapacity.confirmed` | Checkout 409 when exhausted |
| `PolicyVersion APPROVED` | Checkout 503 when missing |
| `Promotion` rules | **Not wired** — checkout ignores promos today |
| CMS blocks | **Not wired** — homepage static Next.js |
| Integration vault `RAZORPAY` | Payment widget / webhooks |