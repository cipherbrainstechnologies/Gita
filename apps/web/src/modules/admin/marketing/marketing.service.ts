import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import type {StaffIdentity} from "@/lib/admin";
import {ApiError} from "../shared/http";
import {writeAudit} from "../shared/audit";
import {POST_REDEMPTION_EDITABLE, type CreatePromotionInput, type UpdatePromotionInput} from "./marketing.schema";
import {buildDiscountRule, buildEligibility, percentOffOf, promotionPhase, type PromotionPhase} from "./marketing.rules";
import * as repo from "./marketing.repository";

export type PromotionDto = {
  id: string; code: string; kind: string; label: string; startsAt: string; endsAt: string; active: boolean; phase: PromotionPhase;
  percentOff: number | null; exclusive: boolean; maxRedemptions: number | null; maxPerCustomer: number | null;
  minOrderPaise: string | null; marginFloorBasisPoints: number | null; redemptions: number; createdAt: string;
};

type Row = Awaited<ReturnType<typeof repo.findPromotion>> & object;
const toDto = (p: Row, redemptions: number, now: Date): PromotionDto => ({
  id: p.id, code: p.code, kind: p.kind, label: p.label, startsAt: p.startsAt.toISOString(), endsAt: p.endsAt.toISOString(), active: p.active,
  phase: promotionPhase(p, now), percentOff: percentOffOf(p.discountRule), exclusive: (p.eligibility as {stacking?: string} | null)?.stacking === "EXCLUSIVE" || p.exclusive,
  maxRedemptions: p.maxRedemptions, maxPerCustomer: p.maxPerCustomer, minOrderPaise: p.minOrderPaise?.toString() ?? null,
  marginFloorBasisPoints: p.marginFloorBasisPoints, redemptions, createdAt: p.createdAt.toISOString()
});

export async function listPromotions(): Promise<PromotionDto[]> {
  const rows = await repo.listPromotions(prisma);
  const counts = await repo.redemptionCounts(prisma, rows.map(r => r.id));
  const now = new Date();
  return rows.map(r => toDto(r, counts.find(c => c.promotionId === r.id)?._count._all ?? 0, now));
}

function assertWindow(startsAt: Date, endsAt: Date, active: boolean) {
  if (endsAt <= startsAt) throw new ApiError(422, "INVALID_WINDOW", "endsAt must be after startsAt.");
  if (active && endsAt <= new Date()) throw new ApiError(422, "WINDOW_ENDED", "An expired promotion cannot be activated.");
}

export async function createPromotion(staff: StaffIdentity, input: CreatePromotionInput): Promise<PromotionDto> {
  assertWindow(input.startsAt, input.endsAt, input.active);
  return prisma.$transaction(async tx => {
    const created = await repo.createPromotion(tx, {
      code: input.code, kind: input.kind, label: input.label, startsAt: input.startsAt, endsAt: input.endsAt,
      eligibility: buildEligibility(input.kind, input.exclusive), discountRule: buildDiscountRule(input.percentOff), exclusive: input.exclusive,
      maxRedemptions: input.maxRedemptions ?? null, maxPerCustomer: input.maxPerCustomer ?? null, minOrderPaise: input.minOrderPaise ?? null,
      marginFloorBasisPoints: input.marginFloorBasisPoints ?? null, active: input.active
    });
    await writeAudit(tx, staff, "PROMOTION_CREATED", created.id, {code: created.code, kind: created.kind, percentOff: input.percentOff, active: created.active, startsAt: input.startsAt.toISOString(), endsAt: input.endsAt.toISOString()});
    return toDto(created, 0, new Date());
  });
}

export async function updatePromotion(staff: StaffIdentity, id: string, input: UpdatePromotionInput): Promise<PromotionDto> {
  const keys = Object.keys(input).filter(k => (input as Record<string, unknown>)[k] !== undefined);
  if (!keys.length) throw new ApiError(422, "NO_CHANGES", "Nothing to update.");
  return prisma.$transaction(async tx => {
    const cur = await repo.findPromotion(tx, id);
    if (!cur) throw new ApiError(404, "PROMOTION_NOT_FOUND", "Promotion not found.");
    const redemptions = await repo.redemptionCount(tx, id);
    if (redemptions > 0) {
      const locked = keys.filter(k => !(POST_REDEMPTION_EDITABLE as readonly string[]).includes(k));
      if (locked.length) throw new ApiError(409, "PROMOTION_REDEEMED", "This promotion has redemptions; only active, label, endsAt and limits can change.", {locked});
    }
    const startsAt = input.startsAt ?? cur.startsAt, endsAt = input.endsAt ?? cur.endsAt, active = input.active ?? cur.active;
    assertWindow(startsAt, endsAt, active);
    const kind = input.kind ?? cur.kind;
    const exclusive = input.exclusive ?? cur.exclusive;
    const data: Prisma.PromotionUpdateInput = {};
    if (input.code !== undefined) data.code = input.code;
    if (input.label !== undefined) data.label = input.label;
    if (input.kind !== undefined) data.kind = input.kind;
    if (input.startsAt !== undefined) data.startsAt = input.startsAt;
    if (input.endsAt !== undefined) data.endsAt = input.endsAt;
    if (input.active !== undefined) data.active = input.active;
    if (input.percentOff !== undefined) data.discountRule = buildDiscountRule(input.percentOff);
    if (input.maxRedemptions !== undefined) data.maxRedemptions = input.maxRedemptions;
    if (input.maxPerCustomer !== undefined) data.maxPerCustomer = input.maxPerCustomer;
    if (input.minOrderPaise !== undefined) data.minOrderPaise = input.minOrderPaise;
    if (input.marginFloorBasisPoints !== undefined) data.marginFloorBasisPoints = input.marginFloorBasisPoints;
    if (input.exclusive !== undefined || input.kind !== undefined) { data.exclusive = exclusive; data.eligibility = buildEligibility(kind, exclusive); }
    const updated = await repo.updatePromotion(tx, id, data);
    await writeAudit(tx, staff, "PROMOTION_UPDATED", id, {code: updated.code, fields: keys, active: updated.active});
    return toDto(updated, redemptions, new Date());
  });
}

export async function deletePromotion(staff: StaffIdentity, id: string): Promise<{deleted: true}> {
  return prisma.$transaction(async tx => {
    const cur = await repo.findPromotion(tx, id);
    if (!cur) throw new ApiError(404, "PROMOTION_NOT_FOUND", "Promotion not found.");
    if ((await repo.redemptionCount(tx, id)) > 0) throw new ApiError(409, "PROMOTION_REDEEMED", "Redeemed promotions cannot be deleted; deactivate it instead.");
    await repo.deletePromotion(tx, id);
    await writeAudit(tx, staff, "PROMOTION_DELETED", id, {code: cur.code});
    return {deleted: true as const};
  });
}
