# Milestone progress tracker — VERSE//MODE

Last updated: 2026-11-15 (agent session). Railway project: `verse-mode`.

## Sprint status

| Sprint | Scope | Status | Notes |
|--------|-------|--------|-------|
| A | Foundation, schema, auth, storefront, size chart, contact | **DONE (demo)** | Demo credentials + Google scaffold; storefront live |
| B | Cart, checkout, payments, notifications, customer orders | **DONE (demo)** | Waitlist live; cart intent; Razorpay HMAC inbox; DEMO sample PAID order |
| C | Studio jobs, approvals, GPU adapters | **DONE (demo)** | Worker live; sandbox graphics; approval inbox |
| D | Admin catalog/orders/marketing/integrations/ops | **DONE (demo)** | Full admin modules gated by RBAC |
| E | Franchise / POS | **PARTIAL** | Company-store pilot create under DEMO_AUTH only; POS receipts not built |
| F | Security, a11y, DR, Railway | **PARTIAL** | Deployed + smoke; restore drill / pen-test / WCAG audit pending |

## Go-live gates (`docs/qa/GO_LIVE_GATES.md`)

These remain **BLOCKED for market launch** even when demo software is complete:

- Legal entity / GST / counsel-signed policies
- Supplier-signed print samples & real measurements
- Google OAuth production credentials (demo passwords are not a market IdP)
- Razorpay KYC + sandbox replay proof with merchant keys
- Shiprocket live AWB
- Accountant-verified GST/invoice series
- Under-18 counsel sign-off
- Backup restore drill + grievance officer live

## Demo logins (only when `DEMO_AUTH=true`)

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `admin@verse.mode` | `VerseDemo!Admin26` |
| Designer staff | `staff@verse.mode` | `VerseDemo!Staff26` |
| Operations | `ops@verse.mode` | `VerseDemo!Ops26` |
| Customer | `customer@verse.mode` | `VerseDemo!Cust26` |

Seed: `npm run db:seed:demo` (after migrate).

## Next engineering steps (after this ship)

1. Wire Razorpay sandbox keys in Integrations vault; exercise webhook capture end-to-end.
2. Apply promotions at checkout; 30-day price history UI.
3. POS stock ledger + company-store receipt (E20).
4. Playwright e2e for login → waitlist → admin approve.
5. Remove / disable `DEMO_AUTH` before any real customer traffic.
