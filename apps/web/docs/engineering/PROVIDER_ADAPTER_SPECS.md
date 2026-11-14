# Adapter boundary specifications

## PaymentGateway
`createOrder({orderId,amountPaise,currency,receipt}) -> {providerOrderId,clientPublishableKey}`; `verifySignedWebhook(rawBody,headers,configuredWebhookSecret)`; `fetchPaymentById`; `refund({paymentId,amountPaise,idempotencyKey})`; `verifyReconciliation`. Clear typed failures `INVALID_CONFIG`, `UNAVAILABLE`, `DECLINED`, `MISSING_CAPTURE`. Do not turn payment initiation into payment confirmation.

## LogisticsProvider
`serviceability(pincode,parcelSize,fromPin)`, `quote`, `bookShipment(physicalParcelDetails)`, `cancelShipment`, `createReversePickup`, `verifyWebhook`, `track`. Only allow booking when batch QC approved and package physically prepared; no imaginary AWB.

## MessageProvider
`sendTransaction(template,verifiedConsentedDestination,purpose,correlationId)`; classify mandatory service notice vs marketing and enforce consent as appropriate. Retain template ID and provider message ID, not sensitive message body.

## GraphicProvider
`estimateCost(prompt,motif,modelVersion)`, `generateMotif({seed,licensedCheckpoint,palette,placement})`, `generateFlatMockup`, `generateLifestyleSimulation` with clear disclosures. Unicode text must use a deterministic typesetter separate from model-based rendering. Model and weights license check mandatory.

## FactoryProvider
`confirmProductionCapacity` and `placeProductionOrder` only after supplier-specific contract, not a generic mocked API; maintain manual upload/email fallback with explicit operator signoff. No generic file export implies actual manufacture.

All providers: allowlisted endpoints, secret vault, disable/invalidate, health test, idempotency, rate/charge limits and safe retries. No user-set arbitrary webhook URLs executed without SSRF protection.
