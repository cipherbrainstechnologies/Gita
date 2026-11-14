# QA matrix (Gherkin-style)

| ID | User journey / invariant | Expected |
|----|-------------------------|----------|
| CAT-01 | mobile filter + zero results | No broken cards; filters persistent |
| CAT-02 | concept-only item | No payable CTA; clear not-for-sale label |
| ART-01 | same quote case/punctuation | normalized duplicate rejected |
| ART-02 | near paraphrase | flagged for human similarity review |
| ART-03 | unverifiable Sanskrit attribution | blocked from publish |
| ART-04 | shirt art on pant layout | invalid placement/proof blocked |
| ART-05 | AI job retried/worker killed | no second design/charge; resumes |
| AUTH-01 | non-admin valid Google customer | admin forbidden on server and client |
| AUTH-02 | revoked admin role mid-session | following request forbidden |
| SEC-01 | integration admin GET | keys masked; no secrets leaked |
| SEC-02 | key rotation | prior secret ciphertext cannot decrypt with incorrect key |
| PAY-01 | spoofed browser paid state | still pending |
| PAY-02 | invalid Razorpay HMAC | 401, no mutation |
| PAY-03 | duplicate signed webhook | once-only payment and order side effects |
| PAY-04 | out-of-order refund and capture | state reconciles correctly |
| CART-01 | discount expiry crossing checkout | server recalculates/requests reapproval |
| CART-02 | simultaneous last preorder slots | one succeeds or both fail safely |
| LEG-01 | birthday coupon without DOB consent | not auto-profiled |
| LEG-02 | old price crossed out | 30-day-low rule / truthful price check |
| POS-01 | two stores same SKU | stock segregated per location |
| POS-02 | offline POS duplicate sync | idempotent receipt |
| COMMS-01 | SMS failure | order unaffected; queued retry |
| COMMS-02 | marketing opt-out | no promo sends; transactional limits observed |
| ORDR-01 | supplier delay | updated estimated ship & customer notice |
| ORDR-02 | cancellation before production | correct refund per stated terms and law |
| INV-01 | one paid order repeated webhooks | one immutable tax invoice, not many |
| INV-02 | refund/return | correct credit note and audit trail |

Testing tools: Vitest (domain functions), Playwright (browser), React Testing Library, accessibility axe, OWASP ZAP staging, provider sandbox test suite, pg transaction tests, Redis workers fault injection, load/soak at batch sizes 20/100.
