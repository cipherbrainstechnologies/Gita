import {describe, expect, it} from "vitest";
import {buildDesignDna} from "./design-dna";
import {renderOnModelRaster} from "./render-on-model-raster";
import {assessOnModelFrame} from "./visual-quality-gate";

describe("visual-quality-gate", () => {
  it("passes v2 CPU compositor output", async () => {
    const dna = buildDesignDna({
      slug: "vmb-qa-001",
      designBriefFingerprint: "fp-qa-001",
      quoteFingerprint: "q-1",
      quoteText: "Stay present. Build steady.",
      garmentFamily: "TEES",
    });
    const frame = await renderOnModelRaster(dna, "front");
    const qa = await assessOnModelFrame(frame.bytes, dna, "front");
    expect(qa.pass).toBe(true);
    expect(frame.bytes.length).toBeGreaterThan(10_000);
  });
});