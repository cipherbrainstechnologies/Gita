import {afterEach, describe, expect, it} from "vitest";
import {fromDb, getCatalogProducts, getProductBySlug, isSaleable, sampleConcepts} from "./catalog";
import {stage} from "./config";
import {orderSchema, waitlistSchema} from "./checkout";

const row = (status: string, enabled: boolean[]) => ({
  id: "p1", slug: "x", title: "X", description: null, collection: "C", tagline: "LINE ONE.", palette: "olive", category: "tees", audienceFit: "ADULT_UNISEX",
  designVersionId: null, supplierId: null, status, images: null, fabricComposition: null, gsm: null, countryOfOrigin: null, hsnCode: null, disclosure: null,
  sampleApprovedAt: null, approvedBy: null, publishedAt: null, createdAt: new Date(), updatedAt: new Date(),
  variants: enabled.map((e, i) => ({id: "v" + i, productId: "p1", sku: "S" + i, size: ["M", "S", "XL"][i] ?? "L", colour: "olive", fit: "Boxy", garmentMeasurements: null,
    mrpPaise: BigInt(99900), pricePaise: BigInt(99900 + i * 100), costPaise: null, taxRateBasisPoints: null, currency: "INR", enabled: e, createdAt: new Date(), updatedAt: new Date()}))
}) as unknown as Parameters<typeof fromDb>[0];

describe("catalog mapping", () => {
  it("is orderable only for PREORDER with an enabled variant", () => {
    expect(fromDb(row("PREORDER", [true, false])).orderable).toBe(true);
    expect(fromDb(row("PREORDER", [false, false])).orderable).toBe(false);
    expect(fromDb(row("CONCEPT", [true])).orderable).toBe(false);
    expect(fromDb(row("SAMPLE_APPROVED", [true])).orderable).toBe(false);
  });
  it("lists only enabled sizes when orderable, sorted, price in INR from paise", () => {
    const p = fromDb(row("PREORDER", [true, true, false]));
    expect(p.sizes).toEqual(["S", "M"]);
    expect(p.priceInr).toBe(999);
    expect(fromDb(row("CONCEPT", [false, false, false])).sizes).toEqual(["S", "M", "XL"]);
  });
  it("serialises paise as strings (JSON safe)", () => { expect(() => JSON.stringify(fromDb(row("CONCEPT", [false])))).not.toThrow(); });
});

describe("catalog fallback", () => {
  const prev = process.env.DATABASE_URL;
  afterEach(() => { if (prev === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = prev; });
  it("falls back to non-orderable samples when DB is not configured", async () => {
    delete process.env.DATABASE_URL;
    const all = await getCatalogProducts();
    expect(all).toHaveLength(sampleConcepts.length);
    expect(all.every(p => !p.orderable && p.status === "CONCEPT" && p.source === "sample")).toBe(true);
    expect((await getProductBySlug("less-proving"))?.name).toBe("Less Proving Relaxed Tee");
    expect(await getProductBySlug("nope")).toBeNull();
  });
  it("attaches editorial media for Quiet Power and Karma concepts", async () => {
    delete process.env.DATABASE_URL;
    const quiet = await getProductBySlug("quiet-is-a-power-move");
    const karma = await getProductBySlug("karma-action-oversized-tee");
    expect(quiet?.media?.length).toBeGreaterThanOrEqual(3);
    expect(karma?.media?.some((m) => m.view === "front")).toBe(true);
    expect(isSaleable(quiet!, false)).toBe(false);
    expect(isSaleable(quiet!, true)).toBe(false);
  });
});

describe("flags & input schemas", () => {
  it("derives stage", () => {
    const e = {...process.env};
    delete process.env.PREVIEW_MODE; process.env.ENABLE_CHECKOUT = "false"; expect(stage()).toBe("preview");
    process.env.PREVIEW_MODE = "false"; expect(stage()).toBe("waitlist");
    process.env.ENABLE_CHECKOUT = "true"; expect(stage()).toBe("checkout");
    for (const [k, v] of [["PREVIEW_MODE", e.p], ["ENABLE_CHECKOUT", e.c]] as const) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  });
  it("normalises waitlist input and rejects bad email", () => {
    expect(waitlistSchema.parse({email: " A@B.CO ", productSlug: "less-proving", size: "m"})).toEqual({email: "a@b.co", productSlug: "less-proving", size: "M"});
    expect(waitlistSchema.safeParse({email: "nope", productSlug: "less-proving", size: "M"}).success).toBe(false);
    expect(waitlistSchema.safeParse({email: "a@b.co", productSlug: "../x", size: "M"}).success).toBe(false);
  });
  it("requires policy acceptance and a 6-digit pincode for orders", () => {
    const ship = {name: "Asha Rao", phone: "9876543210", line1: "12 MG Road", city: "Pune", state: "MH", pincode: "411001"};
    expect(orderSchema.safeParse({productSlug: "x", size: "M", acceptPolicies: true, shipping: ship}).success).toBe(true);
    expect(orderSchema.safeParse({productSlug: "x", size: "M", acceptPolicies: false, shipping: ship}).success).toBe(false);
    expect(orderSchema.safeParse({productSlug: "x", size: "M", acceptPolicies: true, shipping: {...ship, pincode: "12"}}).success).toBe(false);
  });
});
