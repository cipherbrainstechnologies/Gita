# API contracts (v1 proposal)

Public GET: `/api/health`, `/api/products?category&fit&size&cursor`, `/api/products/:slug`, `/api/collections`, `/api/size-charts/:garment`, `/api/policies/:type/current`; GET `/api/orders/:publicId` only after authenticated ownership/one-time validated token.

Customer authenticated POST: `/api/cart`, `/api/cart/items`, `/api/checkout/quote`, `/api/checkout/initiate`, `/api/orders/:id/cancel`, `/api/returns`, `/api/profile/consent`, `/api/account/export`, `/api/account/delete-request`. Every write has CSRF/session validation, schema validation, rate-limits.

Admin role restricted: `/api/admin/studio/run`, `/api/admin/studio/jobs`, `/api/admin/studio/approve`, `/api/admin/designs`, `/api/admin/products`, `/api/admin/preorders/batches`, `/api/admin/orders`, `/api/admin/orders/:id/transition`, `/api/admin/refunds`, `/api/admin/stock/movements`, `/api/admin/discounts`, `/api/admin/integrations`, `/api/admin/integrations/:key/test`, `/api/admin/audit`, `/api/admin/franchises`, `/api/admin/pos/orders`.

Webhooks: `/api/webhooks/razorpay` raw bytes HMAC, `/api/webhooks/shipments/:provider` verified header, `/api/webhooks/communications/:provider`. Every event is persisted with idempotency and replay-safe transitions. Invalid signature = 401, valid duplicate = 200, valid new = 2xx after durable processing/enqueue. Never let webhook body specify trust level.

All APIs return envelope `{data, error: {code,message}, requestId}`; PII never in error logs. Monetary values integer paise; dates ISO with timezone. Cursor to implement complete OpenAPI contract and typed clients.
