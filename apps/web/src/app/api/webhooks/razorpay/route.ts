import {createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import {prisma} from '@/lib/db';
import {decryptSecret} from '@/lib/vault';
import {getPaymentGateway} from '@/lib/providers/payments';

export const runtime = 'nodejs';

type RpPayload = {
  event?: string;
  payload?: {
    payment?: {entity?: {id?: string; order_id?: string; amount?: number; currency?: string; status?: string}};
    order?: {entity?: {id?: string}};
  };
};

async function webhookSecret(): Promise<string | null> {
  const fromEnv = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (fromEnv) return fromEnv;
  try {
    const row = await prisma.integrationSetting.findUnique({where: {provider: 'RAZORPAY'}});
    if (!row) return null;
    const plain = decryptSecret({payload: row.encryptedPayload, nonce: row.nonce, authTag: row.authTag}, 'RAZORPAY');
    const parsed = JSON.parse(plain) as {webhookSecret?: string};
    return typeof parsed.webhookSecret === 'string' && parsed.webhookSecret.length > 0 ? parsed.webhookSecret : null;
  } catch {
    return null;
  }
}

/**
 * Durable Razorpay webhook inbox.
 * - Verifies HMAC over the raw body before any state change.
 * - Persists PaymentEvent uniquely by providerEventId (or payload hash fallback).
 * - Marks order PAID only on payment.captured with matching amount.
 * Fail closed: unverified or unconfigured → 503/401; never invent success.
 */
export async function POST(request: Request) {
  const secret = await webhookSecret();
  if (!secret) {
    return NextResponse.json(
      {error: 'Razorpay webhook is not configured; set RAZORPAY_WEBHOOK_SECRET or vault webhookSecret'},
      {status: 503},
    );
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  if (rawBody.byteLength === 0 || rawBody.byteLength > 512_000) {
    return NextResponse.json({error: 'Invalid body'}, {status: 400});
  }

  const gateway = getPaymentGateway();
  const verified = gateway.verifySignedWebhook(rawBody, request.headers, secret);
  if (!verified.ok) {
    const status = verified.error.code === 'INVALID_CONFIG' ? 503 : 401;
    return NextResponse.json({error: verified.error.message}, {status});
  }

  let json: RpPayload;
  try {
    json = JSON.parse(rawBody.toString('utf8')) as RpPayload;
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400});
  }

  const eventType = verified.value.eventType || json.event || 'unknown';
  const payment = json.payload?.payment?.entity;
  const providerOrderId = payment?.order_id || json.payload?.order?.entity?.id || null;
  const providerPaymentId = payment?.id || null;
  const providerEventId =
    verified.value.eventId ||
    `sha256:${verified.value.payloadSha256 || createHash('sha256').update(rawBody).digest('hex')}`;

  let existing;
  try {
    existing = await prisma.paymentEvent.findUnique({
      where: {provider_providerEventId: {provider: 'RAZORPAY', providerEventId}},
    });
  } catch {
    return NextResponse.json({error: 'Database unavailable'}, {status: 503});
  }
  if (existing?.processedAt) {
    return NextResponse.json({ok: true, duplicate: true, result: existing.result});
  }

  let orderId: string | null = null;
  let result = 'IGNORED';

  try {
    if (eventType === 'payment.captured' && providerOrderId && providerPaymentId) {
      const paymentRow = await prisma.payment.findUnique({where: {providerOrderId}});
      if (!paymentRow) {
        result = 'NO_MATCHING_PAYMENT';
      } else if (payment?.amount != null && BigInt(payment.amount) !== paymentRow.amountPaise) {
        result = 'AMOUNT_MISMATCH';
        await prisma.auditLog.create({
          data: {
            actor: 'system:razorpay-webhook',
            action: 'PAYMENT_AMOUNT_MISMATCH',
            target: paymentRow.orderId,
            details: {providerPaymentId, expected: paymentRow.amountPaise.toString(), got: String(payment.amount)},
          },
        });
      } else {
        orderId = paymentRow.orderId;
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: {id: paymentRow.id},
            data: {
              providerPaymentId,
              status: 'CAPTURED',
              capturedAt: new Date(),
            },
          });
          const depositCapture = paymentRow.intentType === 'DEPOSIT';
          await tx.order.update({
            where: {id: paymentRow.orderId},
            data: depositCapture
              ? {status: 'DEPOSIT_PAID', depositPaidAt: new Date()}
              : {status: 'PAID', paidAt: new Date()},
          });
          await tx.auditLog.create({
            data: {
              actor: 'system:razorpay-webhook',
              action: depositCapture ? 'ORDER_DEPOSIT_PAID' : 'ORDER_PAID',
              target: paymentRow.orderId,
              details: {providerPaymentId, providerOrderId, eventType, intentType: paymentRow.intentType},
            },
          });
        });
        result = 'CAPTURED';
      }
    } else if (eventType === 'payment.failed' && providerOrderId) {
      const paymentRow = await prisma.payment.findUnique({where: {providerOrderId}});
      if (paymentRow) {
        orderId = paymentRow.orderId;
        await prisma.payment.update({where: {id: paymentRow.id}, data: {status: 'FAILED'}});
        result = 'FAILED_RECORDED';
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message.slice(0, 200) : 'processing_error';
    try {
      await prisma.paymentEvent.upsert({
        where: {provider_providerEventId: {provider: 'RAZORPAY', providerEventId}},
        create: {
          provider: 'RAZORPAY',
          providerEventId,
          payloadSha256: verified.value.payloadSha256,
          orderId,
          type: eventType,
          result: `ERROR:${msg}`,
        },
        update: {result: `ERROR:${msg}`},
      });
    } catch {
      /* ignore secondary failure */
    }
    return NextResponse.json({error: 'Webhook processing failed; will retry'}, {status: 500});
  }

  try {
    await prisma.paymentEvent.upsert({
      where: {provider_providerEventId: {provider: 'RAZORPAY', providerEventId}},
      create: {
        provider: 'RAZORPAY',
        providerEventId,
        payloadSha256: verified.value.payloadSha256,
        orderId,
        type: eventType,
        processedAt: new Date(),
        result,
      },
      update: {processedAt: new Date(), result, orderId: orderId ?? undefined},
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ok: true, duplicate: true});
    }
    return NextResponse.json({error: 'Could not persist webhook event'}, {status: 500});
  }

  return NextResponse.json({ok: true, result});
}
