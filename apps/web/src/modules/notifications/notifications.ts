import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import {demoAuthEnabled} from "@/lib/demo";

/**
 * Transactional outbox for customer notifications (table: NotificationOutbox).
 * - `enqueue` is best-effort and idempotent per `idempotencyKey`; it never throws into the caller's request path.
 * - No real email provider is wired yet. Under DEMO_AUTH, rows are marked SENT_DEMO by a synchronous no-op sender;
 *   otherwise they remain QUEUED for a future real sender (worker). Nothing is ever claimed as delivered outside demo.
 * Payload must contain non-secret template variables only.
 */
export type NotificationEvent = "WAITLIST_JOINED" | "ORDER_CREATED";
const TEMPLATES: Record<NotificationEvent, string> = {WAITLIST_JOINED: "waitlist-joined.v1", ORDER_CREATED: "order-created.v1"};

export async function enqueueNotification(a: {
  event: NotificationEvent; email: string; idempotencyKey: string; orderPublicId?: string; payload?: Record<string, string | number>;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const row = await prisma.notificationOutbox.create({data: {
      recipientId: a.email, destination: a.email, orderId: a.orderPublicId, eventType: a.event, channel: "EMAIL",
      templateId: TEMPLATES[a.event], payload: a.payload ?? {}, idempotencyKey: a.idempotencyKey
    }, select: {id: true}});
    if (demoAuthEnabled()) await markSentDemo(row.id);
  } catch (e) {
    // Duplicate key == already enqueued: idempotent success. Anything else is swallowed (logged) so commerce paths are unaffected.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) console.error("[notifications] enqueue failed", (e as Error).message);
  }
}

async function markSentDemo(id: string): Promise<void> {
  await prisma.notificationOutbox.updateMany({where: {id, status: "QUEUED"}, data: {status: "SENT_DEMO", sentAt: new Date(), attempts: {increment: 1}}});
}

/** Sync no-op sender for demo: flushes any QUEUED rows. Returns count marked. Does nothing outside DEMO_AUTH. */
export async function flushDemoOutbox(limit = 50): Promise<number> {
  if (!demoAuthEnabled() || !process.env.DATABASE_URL) return 0;
  const rows = await prisma.notificationOutbox.findMany({where: {status: "QUEUED"}, select: {id: true}, take: limit, orderBy: {scheduledAt: "asc"}});
  for (const r of rows) await markSentDemo(r.id);
  return rows.length;
}
