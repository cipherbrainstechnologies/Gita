import {prisma} from "@/lib/db";
import type {StaffIdentity} from "@/lib/admin";
import {ApiError} from "../shared/http";
import {writeAudit} from "../shared/audit";
import {demoAuth} from "../shared/permissions";
import type {CreateCompanyStoreInput} from "./franchise.schema";
import * as repo from "./franchise.repository";

export type StoreDto = {
  id: string; slug: string; name: string; storeType: string; legalOwner: string; gstin: string | null; active: boolean; createdAt: string;
  address: {line1?: string; city?: string; state?: string; pincode?: string} | null;
  stock: {skus: number; onHand: number; reserved: number}; agreements: number;
};

/** Read-only view of every Store row. Stock shown is the physical-stock ledger total; nothing is inferred or shared with the web storefront. */
export async function listStores(): Promise<StoreDto[]> {
  const [stores, stock, agreements] = await Promise.all([repo.listStores(prisma), repo.stockTotals(prisma), repo.agreementCounts(prisma)]);
  return stores.map(s => {
    const st = stock.find(x => x.storeId === s.id);
    return {
      id: s.id, slug: s.slug, name: s.name, storeType: s.storeType, legalOwner: s.legalOwner, gstin: s.gstin, active: s.active, createdAt: s.createdAt.toISOString(),
      address: s.address && typeof s.address === "object" && !Array.isArray(s.address) ? (s.address as StoreDto["address"]) : null,
      stock: {skus: st?._count._all ?? 0, onHand: st?._sum.onHand ?? 0, reserved: st?._sum.reserved ?? 0},
      agreements: agreements.find(a => a.storeId === s.id)?._count._all ?? 0
    };
  });
}

/** Pilot creation is a demo/pilot convenience: refused unless DEMO_AUTH=true. Always COMPANY-owned and inactive. */
export async function createCompanyStore(staff: StaffIdentity, input: CreateCompanyStoreInput): Promise<StoreDto> {
  if (!demoAuth()) throw new ApiError(403, "DEMO_AUTH_REQUIRED", "Company-store pilots can only be created when DEMO_AUTH=true. Franchise stores are blocked pending legal review.");
  return prisma.$transaction(async tx => {
    const s = await repo.createStore(tx, {slug: input.slug, name: input.name, storeType: "COMPANY", legalOwner: input.legalOwner, address: input.address, gstin: input.gstin ?? null, active: false});
    await writeAudit(tx, staff, "STORE_CREATED", s.id, {slug: s.slug, storeType: "COMPANY", active: false});
    return {id: s.id, slug: s.slug, name: s.name, storeType: s.storeType, legalOwner: s.legalOwner, gstin: s.gstin, active: s.active, createdAt: s.createdAt.toISOString(), address: input.address, stock: {skus: 0, onHand: 0, reserved: 0}, agreements: 0};
  });
}
