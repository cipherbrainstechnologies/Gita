# API contracts (v1 proposal)

Public GET: `/api/health`, `/api/products?category&fit&size&cursor`, `/api/products/:slug`, `/api/collections`, `/api/size-charts/:garment`, `/api/policies/:type/current`; GET `/api/orders/:publicId` only after authenticated ownership/one-time validated token.

Customer authenticated POST: `/api/cart`, `/api/cart/items`, `/api/checkout/quote`, `/api/checkout/initiate`, `/api/orders/:id/cancel`, `/api/returns`, `/api/profile/consent`, `/api/account/export`, `/api/account/delete-request`. Every write has CSRF/session validation, schema validation, rate-limits.

Admin role restricted: `/api/admin/studio/run`, `/api/admin/studio/jobs`, `/api/admin/studio/approve`, `/api/admin/designs`, `/api/admin/products`, `/api/admin/preorders/batches`, `/api/admin/orders`, `/api/admin/orders/:id/transition`, `/api/admin/refunds`, `/api/admin/stock/movements`, `/api/admin/discounts`, `/api/admin/integrations`, `/api/admin/integrations/:key/test`, `/api/admin/audit`, `/api/admin/franchises`, `/api/admin/pos/orders`.

Webhooks: `/api/webhooks/razorpay` raw bytes HMAC, `/api/webhooks/shipments/:provider` verified header, `/api/webhooks/communications/:provider`. Every event is persisted with idempotency and replay-safe transitions. Invalid signature = 401, valid duplicate = 200, valid new = 2xx after durable processing/enqueue. Never let webhook body specify trust level.

All APIs return envelope `{data, error: {code,message}, requestId}`; PII never in error logs. Monetary values integer paise; dates ISO with timezone. Cursor to implement complete OpenAPI contract and typed clients.

## Customer account (implemented)
- `GET /api/orders` - session required (401 `AUTH_REQUIRED`); returns `{orders: OrderView[]}` for the session email only (money = integer paise strings; no address data); 503 `ORDERS_UNAVAILABLE` when DB is down.
- `/api/cart` - session required. `GET` cart (prices resolved from catalog, never stored), `POST {productSlug,size,quantity}` (orderable items only, requires `ENABLE_CHECKOUT=true`), `PATCH {id,quantity}`, `DELETE ?id=`. Max 5 per line, 20 lines.

## Staff / admin APIs (implemented)

All require an active `AdminUser` whose role is allowed (see `src/modules/admin/shared/permissions.ts`), `Content-Type: application/json` on writes, and return `{error:{code,message,details?}}` on failure (403 non-staff, 422 validation, 409 conflict/gate, 503 DB unavailable). Money is integer paise (strings in responses).

| Method + path | Roles (write) | Notes |
|---|---|---|
| `GET /api/admin/catalog` | any staff | products, variants, derived preorder-gate blockers, confirmed capacity only |
| `POST /api/admin/catalog` | SUPERADMIN, MERCHANDISER | create CONCEPT product (no status input) |
| `PATCH /api/admin/catalog` | same | `{id, fields?, status?, reason?, demoAllowPreorder?}`; PREORDER gate server-side; `demoAllowPreorder` only with `DEMO_AUTH=true` |
| `POST/PATCH /api/admin/catalog/variants` | same | upsert by SKU / `{sku, enabled}` |
| `GET /api/admin/orders?status&q&limit` | SUPERADMIN, OPERATIONS, SUPPORT, FINANCE | no address, no secrets |
| `POST /api/admin/orders/:orderId/status` | SUPERADMIN, OPERATIONS | `{to, reason, expectedVersion?}` along allowed transitions |
| `POST /api/admin/orders/:orderId/refund` | SUPERADMIN, FINANCE, SUPPORT | `{reason}`; creates `Refund(PENDING_APPROVAL)`, order `REFUND_PENDING`; no provider call |
| `GET/POST /api/admin/studio/approvals` | SUPERADMIN, DESIGNER, MERCHANDISER | inbox / `{candidateId, decision, note, checklist?, demoAllowSimulation?}`; never publishes a product |
| `GET/POST /api/admin/marketing/promotions`, `PATCH/DELETE .../:id` | SUPERADMIN, MERCHANDISER | percent-off only, ISO dates with offset; not applied at checkout yet |
| `GET/POST /api/admin/franchise/stores` | SUPERADMIN, FRANCHISE_MANAGER | POST only with `DEMO_AUTH=true`, COMPANY stores only |
| `POST /api/admin/integrations/test` | SUPERADMIN | `{provider}` -> `NOT_CONFIGURED | SANDBOX | LIVE_VERIFIED | FAILED` |
