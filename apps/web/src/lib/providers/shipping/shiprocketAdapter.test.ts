import {describe, expect, it} from "vitest";
import {ShiprocketAdapter} from "./shiprocketAdapter";

describe("ShiprocketAdapter", () => {
  it("reports NOT_CONFIGURED without credentials", () => {
    expect(new ShiprocketAdapter({}).status).toBe("NOT_CONFIGURED");
  });
  it("rejects invalid pincode", async () => {
    const r = await new ShiprocketAdapter({}).serviceability("12");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INVALID_PINCODE");
  });
  it("does not invent serviceability when unconfigured", async () => {
    const r = await new ShiprocketAdapter({}).serviceability("560001");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("NOT_CONFIGURED");
  });
  it("never invents AWB", async () => {
    const r = await new ShiprocketAdapter({token: "x"}).bookShipment();
    expect(r.ok).toBe(false);
  });
});
