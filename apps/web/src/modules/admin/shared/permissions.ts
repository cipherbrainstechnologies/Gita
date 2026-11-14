import {ALL_STAFF_ROLES, type StaffRole} from "@/lib/admin";

/** Single source of truth for which staff roles may use each admin surface. Reads are broader than writes. */
export const PERMISSIONS = {
  catalogRead: ALL_STAFF_ROLES,
  catalogWrite: ["SUPERADMIN", "MERCHANDISER"],
  ordersRead: ["SUPERADMIN", "OPERATIONS", "SUPPORT", "FINANCE"],
  ordersAdvance: ["SUPERADMIN", "OPERATIONS"],
  ordersRefund: ["SUPERADMIN", "FINANCE", "SUPPORT"],
  studio: ["SUPERADMIN", "DESIGNER", "MERCHANDISER"],
  marketingRead: ["SUPERADMIN", "MERCHANDISER", "FINANCE"],
  marketingWrite: ["SUPERADMIN", "MERCHANDISER"],
  franchiseRead: ["SUPERADMIN", "OPERATIONS", "FRANCHISE_MANAGER", "FINANCE"],
  franchiseWrite: ["SUPERADMIN", "FRANCHISE_MANAGER"],
  integrations: ["SUPERADMIN"]
} as const satisfies Record<string, readonly StaffRole[]>;

/** `DEMO_AUTH` unlocks demo-only shortcuts (PREORDER without capacity, simulation approvals, pilot store creation). Never on by default. */
export const demoAuth = (): boolean => process.env.DEMO_AUTH === "true";
