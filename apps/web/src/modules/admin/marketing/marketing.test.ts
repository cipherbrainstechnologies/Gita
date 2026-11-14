import {describe, expect, it} from "vitest";
import {createPromotionSchema, updatePromotionSchema} from "./marketing.schema";
import {buildDiscountRule, buildEligibility, percentOffOf, promotionPhase} from "./marketing.rules";

const base = {code: "launch10", label: "Launch 10", kind: "LAUNCH", startsAt: "2026-12-01T00:00:00+05:30", endsAt: "2026-12-31T23:59:00+05:30", percentOff: 10};

describe("promotion schema", () => {
  it("normalises code, parses dates with offset and defaults to inactive, non-exclusive", () => {
    const p = createPromotionSchema.parse(base);
    expect(p.code).toBe("LAUNCH10");
    expect(p.startsAt).toBeInstanceOf(Date);
    expect(p.startsAt.toISOString()).toBe("2026-11-30T18:30:00.000Z");
    expect(p.active).toBe(false);
    expect(p.exclusive).toBe(false);
  });
  it("rejects timezone-less dates, reversed windows and bad percentages", () => {
    expect(createPromotionSchema.safeParse({...base, startsAt: "2026-12-01T00:00:00"}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, endsAt: base.startsAt}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, percentOff: 0}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, percentOff: 71}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, percentOff: 12.5}).success).toBe(false);
  });
  it("rejects malformed codes, unknown kinds and unknown keys", () => {
    expect(createPromotionSchema.safeParse({...base, code: "x"}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, code: "BAD CODE"}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, kind: "SPONSORED"}).success).toBe(false);
    expect(createPromotionSchema.safeParse({...base, discountRule: {percentOff: 99}}).success).toBe(false);
  });
  it("min order is paise bigint", () => {
    expect(createPromotionSchema.parse({...base, minOrderPaise: "199900"}).minOrderPaise).toBe(199900n);
  });
  it("update schema is partial but strict", () => {
    expect(updatePromotionSchema.parse({active: true})).toEqual({active: true});
    expect(updatePromotionSchema.safeParse({id: "x"}).success).toBe(false);
  });
});

describe("promotion rules", () => {
  const now = new Date("2026-12-10T00:00:00Z");
  const w = {startsAt: new Date("2026-12-01T00:00:00Z"), endsAt: new Date("2026-12-31T00:00:00Z")};
  it("derives phase from flag and window", () => {
    expect(promotionPhase({active: true, ...w}, now)).toBe("LIVE");
    expect(promotionPhase({active: false, ...w}, now)).toBe("INACTIVE");
    expect(promotionPhase({active: true, startsAt: new Date("2027-01-01"), endsAt: new Date("2027-02-01")}, now)).toBe("SCHEDULED");
    expect(promotionPhase({active: true, startsAt: new Date("2026-01-01"), endsAt: new Date("2026-02-01")}, now)).toBe("EXPIRED");
  });
  it("round-trips the percent rule and builds adult-only eligibility", () => {
    expect(percentOffOf(buildDiscountRule(15))).toBe(15);
    expect(percentOffOf({type: "FLAT", amount: 5})).toBeNull();
    expect(percentOffOf(null)).toBeNull();
    expect(buildEligibility("BIRTHDAY", false)).toEqual({adultsOnly: true, birthdayOnly: true, stacking: "SINGLE_CODE_PER_ORDER"});
    expect(buildEligibility("LAUNCH", true)).toMatchObject({birthdayOnly: false, stacking: "EXCLUSIVE"});
  });
});
