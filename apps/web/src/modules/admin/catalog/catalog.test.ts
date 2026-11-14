import {describe, expect, it} from "vitest";
import {PRODUCT_TRANSITIONS, canTransition, evaluatePreorderGate, type PreorderFacts, type ProductStatus} from "./catalog.rules";
import {createProductSchema, setVariantEnabledSchema, updateProductSchema, upsertVariantSchema} from "./catalog.schema";

const now = new Date("2026-11-15T00:00:00Z");
const future = new Date("2027-01-15T00:00:00Z");
const ready: PreorderFacts = {
  hsnCode: "6109",
  variants: [{id: "v1", taxRateBasisPoints: 500}, {id: "v2", taxRateBasisPoints: null}],
  capacities: [{variantId: "v1", confirmed: true, capacity: 50, shipWindowTo: future}]
};

describe("status transitions", () => {
  it("allows only the forward chain plus limited rollback", () => {
    expect(canTransition("CONCEPT", "SAMPLE_PENDING")).toBe(true);
    expect(canTransition("SAMPLE_PENDING", "SAMPLE_APPROVED")).toBe(true);
    expect(canTransition("SAMPLE_APPROVED", "PREORDER")).toBe(true);
    expect(canTransition("SAMPLE_APPROVED", "SAMPLE_PENDING")).toBe(true);
  });
  it("never lets a concept jump straight to PREORDER or skip sample approval", () => {
    expect(canTransition("CONCEPT", "PREORDER")).toBe(false);
    expect(canTransition("CONCEPT", "SAMPLE_APPROVED")).toBe(false);
    expect(canTransition("SAMPLE_PENDING", "PREORDER")).toBe(false);
  });
  it("a live PREORDER can only be closed, and ARCHIVED is final", () => {
    expect(PRODUCT_TRANSITIONS.PREORDER).toEqual(["CLOSED"]);
    expect(PRODUCT_TRANSITIONS.ARCHIVED).toEqual([]);
    (["CONCEPT", "SAMPLE_PENDING", "SAMPLE_APPROVED", "PREORDER", "CLOSED"] as ProductStatus[]).forEach(s => expect(canTransition("ARCHIVED", s)).toBe(false));
  });
});

describe("PREORDER gate", () => {
  it("passes with HSN, a taxed variant and confirmed unexpired capacity on that variant", () => {
    expect(evaluatePreorderGate(ready, {demo: false, now})).toEqual({ok: true, blockers: [], demoBypassUsed: false});
  });
  it("blocks on missing or malformed HSN", () => {
    expect(evaluatePreorderGate({...ready, hsnCode: null}, {demo: false, now}).blockers).toContain("HSN_MISSING");
    expect(evaluatePreorderGate({...ready, hsnCode: "61"}, {demo: false, now}).blockers).toContain("HSN_MISSING");
  });
  it("blocks when no variant has a tax rate", () => {
    const g = evaluatePreorderGate({...ready, variants: [{id: "v1", taxRateBasisPoints: null}]}, {demo: false, now});
    expect(g.blockers).toContain("NO_VARIANT_TAX_RATE");
    expect(g.ok).toBe(false);
  });
  it("blocks on unconfirmed, expired, zero or wrong-variant capacity", () => {
    const cap = ready.capacities[0];
    for (const c of [{...cap, confirmed: false}, {...cap, shipWindowTo: new Date("2026-01-01")}, {...cap, capacity: 0}, {...cap, variantId: "v2"}]) {
      expect(evaluatePreorderGate({...ready, capacities: [c]}, {demo: false, now}).blockers).toEqual(["NO_CONFIRMED_CAPACITY"]);
    }
    expect(evaluatePreorderGate({...ready, capacities: []}, {demo: false, now}).ok).toBe(false);
  });
  it("demo waives ONLY the capacity requirement and reports that it did", () => {
    expect(evaluatePreorderGate({...ready, capacities: []}, {demo: true, now})).toEqual({ok: true, blockers: [], demoBypassUsed: true});
    const g = evaluatePreorderGate({hsnCode: null, variants: [], capacities: []}, {demo: true, now});
    expect(g.ok).toBe(false);
    expect(g.blockers).toEqual(["HSN_MISSING", "NO_VARIANT_TAX_RATE"]);
  });
  it("demo is not reported as used when real capacity exists", () => {
    expect(evaluatePreorderGate(ready, {demo: true, now}).demoBypassUsed).toBe(false);
  });
});

describe("catalog schemas", () => {
  const variant = {productId: "p1", sku: "vm-test-m", size: "m", colour: "Olive", fit: "Boxy", mrpPaise: 99900, pricePaise: "89900", taxRateBasisPoints: 500};
  it("normalises SKU/size and converts paise to bigint", () => {
    const v = upsertVariantSchema.parse(variant);
    expect(v.sku).toBe("VM-TEST-M");
    expect(v.size).toBe("M");
    expect(v.pricePaise).toBe(89900n);
    expect(v.mrpPaise).toBe(99900n);
  });
  it("rejects fractional, negative, zero and MRP-below-price values", () => {
    expect(upsertVariantSchema.safeParse({...variant, pricePaise: 899.5}).success).toBe(false);
    expect(upsertVariantSchema.safeParse({...variant, pricePaise: -1}).success).toBe(false);
    expect(upsertVariantSchema.safeParse({...variant, pricePaise: 0, mrpPaise: 0}).success).toBe(false);
    expect(upsertVariantSchema.safeParse({...variant, mrpPaise: 50000}).success).toBe(false);
    expect(upsertVariantSchema.safeParse({...variant, pricePaise: "999999999999", mrpPaise: "999999999999"}).success).toBe(false);
  });
  it("rejects out-of-range GST and unknown keys", () => {
    expect(upsertVariantSchema.safeParse({...variant, taxRateBasisPoints: 2801}).success).toBe(false);
    expect(upsertVariantSchema.safeParse({...variant, currency: "USD"}).success).toBe(false);
  });
  it("never accepts a status on create (products start as concepts)", () => {
    const base = {slug: "quiet-power", title: "Quiet Power", category: "tees"};
    expect(createProductSchema.safeParse(base).success).toBe(true);
    expect(createProductSchema.safeParse({...base, status: "PREORDER"}).success).toBe(false);
    expect(createProductSchema.safeParse({...base, slug: "Bad Slug"}).success).toBe(false);
  });
  it("update: empty strings clear to null, undefined stays untouched, unknown keys rejected", () => {
    const u = updateProductSchema.parse({id: "p1", tagline: "  ", title: "New title"});
    expect(u.tagline).toBeNull();
    expect(u.description).toBeUndefined();
    expect(updateProductSchema.safeParse({id: "p1", slug: "x"}).success).toBe(false);
    expect(updateProductSchema.safeParse({id: "p1", hsnCode: "12"}).success).toBe(false);
    expect(updateProductSchema.safeParse({id: "p1", status: "LIVE"}).success).toBe(false);
  });
  it("variant enable payload is strict", () => {
    expect(setVariantEnabledSchema.parse({sku: "vm-a-s", enabled: true})).toEqual({sku: "VM-A-S", enabled: true});
    expect(setVariantEnabledSchema.safeParse({sku: "vm-a-s", enabled: "yes"}).success).toBe(false);
  });
});
