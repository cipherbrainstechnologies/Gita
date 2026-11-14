# CTO vendor choices and why

- **Shop engine:** custom Next.js modular monolith for unique AI studio/franchise workflows. Accept tradeoff: higher build/QA cost versus Shopify/WooCommerce, and no promise of instant production readiness.
- **Gateway:** Razorpay as first India-focused candidate; Cashfree as second adapter later. Support gateway order, server verification, refund, webhook and tax reconciliation. Onboarding/KYC unavoidable.
- **Logistics:** Shiprocket for aggregated India couriers; direct courier API only after measured scale. No courier API makes `shipped` true without AWB.
- **AI:** Diffusers + external licensed model or paid image API, controlled provider abstraction; SVG typography layer; FASHN VTON optional for product display, not design.
- **DB:** Railway PostgreSQL authoritative; Redis/BullMQ for work; cloud bucket for asset files. No persistent files on app container.
- **Messaging:** email + WhatsApp approved service templates + DLT-registered transactional SMS; separate consent for promotions.
- **Search:** PostgreSQL search at launch; dedicated search service only when catalog size/latency requires it. 1k conceptual items must not burden storefront.
- **Franchise:** POS pilot first, commission/legal integration later; do not overbuild independent marketplace seller settlement at launch.
