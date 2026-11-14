import {auth} from "@/auth";
import {prisma} from "@/lib/db";

export type StaffRole = "SUPERADMIN" | "MERCHANDISER" | "OPERATIONS" | "SUPPORT" | "FINANCE" | "DESIGNER" | "FRANCHISE_MANAGER";
export const ALL_STAFF_ROLES: readonly StaffRole[] = ["SUPERADMIN", "MERCHANDISER", "OPERATIONS", "SUPPORT", "FINANCE", "DESIGNER", "FRANCHISE_MANAGER"];
export type StaffIdentity = {email: string; role: StaffRole};

/**
 * Resolves the signed-in Google account to an ACTIVE AdminUser row. Authorisation always happens in the database on every
 * privileged request; the session alone never grants staff access. Throws only on infrastructure failure (DB unreachable).
 */
export async function staffIdentity(): Promise<StaffIdentity | null> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;
  const staff = await prisma.adminUser.findUnique({where: {email}, select: {role: true, active: true}});
  return staff?.active ? {email, role: staff.role} : null;
}

export async function adminRole(): Promise<StaffRole | null> {
  return (await staffIdentity())?.role ?? null;
}

export async function canAdmin(roles?: StaffRole[]): Promise<boolean> {
  return (await requireAdmin(roles)) !== null;
}

/**
 * Canonical staff gate. Returns the identity when the caller is an active staff member whose role is in `roles`
 * (any role when omitted); returns null otherwise. Throws only when the database cannot be reached (callers must fail closed).
 * Pages should prefer `gateAdmin` so an outage is shown as unavailable instead of forbidden.
 */
export async function requireAdmin(roles?: readonly StaffRole[]): Promise<StaffIdentity | null> {
  const staff = await staffIdentity();
  if (!staff) return null;
  return !roles || roles.includes(staff.role) ? staff : null;
}

export type GateResult = {state: "ok"; staff: StaffIdentity} | {state: "forbidden"} | {state: "unavailable"};
export async function gateAdmin(roles?: readonly StaffRole[]): Promise<GateResult> {
  try {
    const staff = await requireAdmin(roles);
    return staff ? {state: "ok", staff} : {state: "forbidden"};
  } catch {
    return {state: "unavailable"};
  }
}