import {describe, expect, it} from "vitest";
import {createCompanyStoreSchema} from "./franchise.schema";
import {istDayStart} from "../dashboard/dashboard.rules";

const store = {slug: "pilot-store-01", name: "Pilot Store", legalOwner: "Example Retail Pvt Ltd", address: {line1: "12 MG Road", city: "Pune", state: "Maharashtra", pincode: "411001"}};

describe("company store schema", () => {
  it("accepts a valid pilot and normalises GSTIN", () => {
    const s = createCompanyStoreSchema.parse({...store, gstin: "27abcde1234f1z5"});
    expect(s.gstin).toBe("27ABCDE1234F1Z5");
  });
  it("has no way to choose a store type, status or franchise fields", () => {
    expect(createCompanyStoreSchema.safeParse({...store, storeType: "FRANCHISE"}).success).toBe(false);
    expect(createCompanyStoreSchema.safeParse({...store, active: true}).success).toBe(false);
  });
  it("rejects bad pincode, slug and GSTIN", () => {
    expect(createCompanyStoreSchema.safeParse({...store, address: {...store.address, pincode: "4110"}}).success).toBe(false);
    expect(createCompanyStoreSchema.safeParse({...store, slug: "Bad Slug"}).success).toBe(false);
    expect(createCompanyStoreSchema.safeParse({...store, gstin: "NOTAGSTIN"}).success).toBe(false);
  });
});

describe("dashboard IST day boundary", () => {
  it("starts the day at 00:00 IST (18:30 UTC previous day)", () => {
    expect(istDayStart(new Date("2026-11-15T10:00:00Z")).toISOString()).toBe("2026-11-14T18:30:00.000Z");
  });
  it("a UTC time after 18:30 belongs to the next IST day", () => {
    expect(istDayStart(new Date("2026-11-14T19:00:00Z")).toISOString()).toBe("2026-11-14T18:30:00.000Z");
    expect(istDayStart(new Date("2026-11-14T18:29:00Z")).toISOString()).toBe("2026-11-13T18:30:00.000Z");
  });
});
