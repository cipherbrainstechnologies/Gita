import {z} from "zod";
import {paiseSchema} from "../catalog/catalog.schema";

import {MAX_PERCENT_OFF, PROMOTION_KINDS} from "./marketing.rules";

const code = z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{2,31}$/, "3-32 chars: A-Z, 0-9, _ or -");
/** Timestamps must carry an explicit offset (e.g. +05:30) so promotion windows are never timezone-ambiguous. */
const instant = z.iso.datetime({offset: true}).transform(s => new Date(s));

const fields = {
  code,
  label: z.string().trim().min(2).max(120),
  kind: z.enum(PROMOTION_KINDS),
  startsAt: instant,
  endsAt: instant,
  percentOff: z.number().int().min(1).max(MAX_PERCENT_OFF),
  active: z.boolean(),
  exclusive: z.boolean(),
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable(),
  maxPerCustomer: z.number().int().min(1).max(100).nullable(),
  minOrderPaise: paiseSchema.nullable(),
  marginFloorBasisPoints: z.number().int().min(0).max(10_000).nullable()
};

export const createPromotionSchema = z.object({
  code: fields.code, label: fields.label, kind: fields.kind, startsAt: fields.startsAt, endsAt: fields.endsAt, percentOff: fields.percentOff,
  active: fields.active.default(false), exclusive: fields.exclusive.default(false),
  maxRedemptions: fields.maxRedemptions.optional(), maxPerCustomer: fields.maxPerCustomer.optional(),
  minOrderPaise: fields.minOrderPaise.optional(), marginFloorBasisPoints: fields.marginFloorBasisPoints.optional()
}).strict().refine(v => v.endsAt > v.startsAt, {message: "endsAt must be after startsAt", path: ["endsAt"]});

export const updatePromotionSchema = z.object({
  label: fields.label.optional(), kind: fields.kind.optional(), code: fields.code.optional(), startsAt: fields.startsAt.optional(), endsAt: fields.endsAt.optional(),
  percentOff: fields.percentOff.optional(), active: fields.active.optional(), exclusive: fields.exclusive.optional(),
  maxRedemptions: fields.maxRedemptions.optional(), maxPerCustomer: fields.maxPerCustomer.optional(),
  minOrderPaise: fields.minOrderPaise.optional(), marginFloorBasisPoints: fields.marginFloorBasisPoints.optional()
}).strict();

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;

/** Fields that may still change after a promotion has been redeemed (redemption snapshots must stay truthful). */
export const POST_REDEMPTION_EDITABLE = ["active", "label", "endsAt", "maxRedemptions", "maxPerCustomer"] as const;

