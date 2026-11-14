# Execution playbook

1. Audit git SHA ↔ Railway deployment; live GET health/PDP/shop/inspiration/login
2. Protect: branch + non-destructive migrations; never wipe Postgres
3. Update `docs/roadmap/DELIVERY_BACKLOG.md` with P0 first (PDP media, Gita source honesty)
4. Implement gaps; fail closed on payments/shipping
5. `npm run typecheck|test|build|verify:data` (+ `verify_v2.py` when present)
6. `railway up` web+worker; migrate; seed demo if DEMO_AUTH
7. Browser/HTTP verify; write `docs/qa/IMPLEMENTATION_EVIDENCE.md`
8. Loop until only `BLOCKED_EXTERNAL` remains
