import {describe, expect, it} from "vitest";
import {ORDER_STATUSES, ORDER_TRANSITIONS, canAdvance, canRequestRefund} from "./orders.rules";
import {advanceOrderSchema, listOrdersQuerySchema, refundRequestSchema} from "./orders.schema";

describe("order transitions", () => {
  it("walks the production pipeline in order", () => {
    const chain = ["PAID", "VENDOR_CONFIRMED", "IN_PRODUCTION", "QUALITY_CONTROL", "READY_TO_DISPATCH", "SHIPPED", "DELIVERED"] as const;
    for (let i = 0; i < chain.length - 1; i++) expect(canAdvance(chain[i], chain[i + 1])).toBe(true);
  });
  it("cannot skip stages or go backwards", () => {
    expect(canAdvance("PAID", "IN_PRODUCTION")).toBe(false);
    expect(canAdvance("PAID", "SHIPPED")).toBe(false);
    expect(canAdvance("IN_PRODUCTION", "VENDOR_CONFIRMED")).toBe(false);
    expect(canAdvance("DELIVERED", "SHIPPED")).toBe(false);
  });
  it("staff can never set PAID from an unpaid order or reach REFUND states by advancing", () => {
    expect(canAdvance("PAYMENT_PENDING", "PAID")).toBe(false);
    expect(canAdvance("DRAFT", "PAID")).toBe(false);
    for (const s of ORDER_STATUSES) {
      expect(canAdvance(s, "REFUND_PENDING")).toBe(false);
      expect(canAdvance(s, "REFUNDED")).toBe(false);
      expect(canAdvance(s, "CANCELLED")).toBe(false);
    }
  });
  it("terminal and refund states have no staff transitions", () => {
    for (const s of ["DELIVERED", "CANCELLED", "REFUND_PENDING", "REFUNDED"] as const) expect(ORDER_TRANSITIONS[s]).toEqual([]);
  });
  it("refunds need a captured-payment lifecycle state", () => {
    expect(canRequestRefund("PAID")).toBe(true);
    expect(canRequestRefund("DELIVERED")).toBe(true);
    for (const s of ["DRAFT", "PAYMENT_PENDING", "CANCELLED", "REFUND_PENDING", "REFUNDED"] as const) expect(canRequestRefund(s)).toBe(false);
  });
});

describe("order schemas", () => {
  it("requires an audited reason of at least 3 chars", () => {
    expect(advanceOrderSchema.safeParse({to: "VENDOR_CONFIRMED"}).success).toBe(false);
    expect(advanceOrderSchema.safeParse({to: "VENDOR_CONFIRMED", reason: "ok"}).success).toBe(false);
    expect(advanceOrderSchema.safeParse({to: "VENDOR_CONFIRMED", reason: "Supplier confirmed by email"}).success).toBe(true);
    expect(refundRequestSchema.safeParse({}).success).toBe(false);
  });
  it("rejects unknown statuses and extra keys (no client-supplied amounts)", () => {
    expect(advanceOrderSchema.safeParse({to: "TELEPORTED", reason: "because"}).success).toBe(false);
    expect(refundRequestSchema.safeParse({reason: "defect", amountPaise: 1}).success).toBe(false);
  });
  it("bounds the list query", () => {
    expect(listOrdersQuerySchema.parse({}).limit).toBe(50);
    expect(listOrdersQuerySchema.safeParse({limit: "1000"}).success).toBe(false);
    expect(listOrdersQuerySchema.safeParse({status: "NOPE"}).success).toBe(false);
  });
});
