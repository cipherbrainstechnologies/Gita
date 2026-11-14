import {z} from "zod";
import {ORDER_STATUSES, type OrderStatus} from "./orders.rules";

const statusEnum = z.enum(ORDER_STATUSES as unknown as [OrderStatus, ...OrderStatus[]]);
const reason = z.string().trim().min(3).max(500);

export const listOrdersQuerySchema = z.object({
  status: statusEnum.optional(),
  q: z.string().trim().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

/** `to` is validated against the transition table by the service; `reason` is mandatory and lands in AuditLog. */
export const advanceOrderSchema = z.object({
  to: statusEnum,
  reason,
  expectedVersion: z.number().int().min(1).optional()
}).strict();

export const refundRequestSchema = z.object({
  reason,
  expectedVersion: z.number().int().min(1).optional()
}).strict();

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type AdvanceOrderInput = z.infer<typeof advanceOrderSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
