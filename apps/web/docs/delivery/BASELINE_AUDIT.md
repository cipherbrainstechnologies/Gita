# Baseline audit — enterprise admin execution

**HEAD branch:** `cursor/enterprise-admin-storefront-133f`  
**Live:** https://web-production-b2b81db7.up.railway.app/

| Area | Status | Evidence |
|------|--------|----------|
| 1,000 concept products | VERIFIED LIVE | SSH seed 2026-11-14; audit pass |
| Paginated `/shop` | VERIFIED LIVE | API `total` ~1007 |
| Deposit schema + math | IMPLEMENTED | `DepositPolicy`; checkout off |
| Admin command center | PARTIAL→EXTENDED | Live DB counts + catalog pipeline |
| Admin catalog 1000 rows | PARTIAL | list take 1200; client table needs virtual scroll |
| AI Studio / worker | PARTIAL | Sandbox placeholders; `AI_RENDER` vault optional |
| Promotions at checkout | MISSING | Admin promos not applied server-side |
| CMS homepage | PARTIAL | Mostly static; PolicyVersion for legal |
| Razorpay live | BLOCKED EXTERNAL | Sandbox not evidenced on prod |
| 2000 unique model photos | PARTIAL | Template gallery attach script; not per-SKU render yet |
| Franchise POS | SCAFFOLD | Demo pilot |
| Paid preorder eligible | 0 | By design until gates |