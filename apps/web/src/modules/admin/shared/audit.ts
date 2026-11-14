import type {Prisma, PrismaClient} from "@prisma/client";
import type {StaffIdentity} from "@/lib/admin";

/** Prisma client or interactive-transaction client; repositories accept either so writes and audit rows commit together. */
export type Db = PrismaClient | Prisma.TransactionClient;

/** Stable actor label for AuditLog rows (kept free of server-only imports so it is unit-testable). */
export const auditActor = (s: StaffIdentity): string => `staff:${s.email}`;

export function writeAudit(db: Db, staff: StaffIdentity, action: string, target: string, details: Prisma.InputJsonValue) {
  return db.auditLog.create({data: {actor: auditActor(staff), action, target, details: {...(details as object), actorRole: staff.role}}});
}
