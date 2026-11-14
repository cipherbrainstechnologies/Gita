# Integrations, configuration and Railway runbook

## Core secrets bootstrap (Railway variables only)
`DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `INTEGRATION_MASTER_KEY`, `NEXTAUTH_URL`/`AUTH_URL` if required by Auth.js version, `APP_BASE_URL`. Object storage connection/access keys may be Railway-managed env if integration cannot bootstrap through admin. No sensitive key embedded in client JS, build-time NEXT_PUBLIC, logs, git or database plaintext.

## Admin Integrations menu
1. **Razorpay**: toggle sandbox/live; key ID; key secret; webhook secret; manual credential rotation; test-connection and last webhook timestamps. Key never shown once saved; mask `••••1234`; require reauthentication to rotate.
2. **Shiprocket**: API username/token, pickup postcode, live/sandbox if offered; test serviceability; webhook header token.
3. **Transactional email**: SMTP/API, from name/domain verified, address of grievance/support, order/invoice/dispatch/refund templates.
4. **WhatsApp Cloud API / partner**: WhatsApp business number ID, access token, approved template names and language; consent/purpose, quality rating/opt-out handling. Transactional service messages distinct from marketing.
5. **SMS**: DLT Principal Entity/headers/templates, SMS vendor credentials, consent and sender/channel-specific compliance.
6. **AI**: model/provider endpoint allowlist, image generation budget/credits, separate external GPU service URL, provider key, model license record and prompt version.
7. **Tax/invoice**: legal seller name, GSTIN, registered addresses, HSN/tax rates by SKU, invoice prefix and series per fiscal year, credit notes and refund setup; only authorized finance role.
8. **Corporate/franchise**: store location ID, tax registration and ownership, commission scheme, payout bank info via secure partner onboarding, POS device/terminal identifiers.

Implement all above settings as Zod-validated forms with server-only encrypt/decrypt, audit, masked GET. Show a clear `NOT CONNECTED / SANDBOX / LIVE HEALTHY / FAILED` state; never simulate successful provider registration.

## Railway deployment
1. Push to a private GitHub repo. New Railway Project -> GitHub source. Provision PostgreSQL, Redis, and Storage Bucket.
2. Web service: repository root, build `npm ci && npm run build`; start `npm run start`; expose Railway domain/custom domain. Reference `${{Postgres.DATABASE_URL}}`, `${{Redis.REDIS_URL}}` according to Railway's UI; supply auth key and other env vars.
3. Worker service: same repo, build `npm ci && npm run build:worker` (if compiled separately) or installed TS runtime; start `npm run worker`; **no public domain**; share DB/Redis/bucket references. Set worker process concurrency and job cost ceilings.
4. Pre-deploy command `npx prisma migrate deploy` after migrations actually created; seed controlled, not automatic in prod. `prisma db push` must not be used as prod migration strategy.
5. OAuth authorized redirect URI: `https://YOUR-DOMAIN/api/auth/callback/google`; configure Google consent screen and privacy/terms domain. Test trusted origins and account linking.
6. Razorpay/Shiprocket webhooks to public HTTPS endpoints, verify signatures in application. Mail service DKIM/SPF/DMARC. Test sandbox before live.
7. Alerts for payment webhook lag, unsuccessful job spikes, orphaned payment/order reconciliation, SKU out-of-range, no new outbound notifications, expired secrets, backup restoration.

**Note:** Admin DB-encrypted credentials and Railway env are complementary. You cannot securely bootstrap the DB or OAuth without environment-level credentials.

## First administrator bootstrap
After database migration and Google OAuth are verified, run `npm run admin:bootstrap -- verified-owner@example.com` once from a trusted CLI environment (never the website). Later user management must be RBAC-audited through the admin UI. A matching email is only an admin after a successful Google OAuth session, not a passwordless admin bypass.
