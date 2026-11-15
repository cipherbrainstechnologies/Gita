import {describe, expect, it} from "vitest";
import {buildDesignDna} from "./design-dna";
import {renderOnModelRaster} from "./render-on-model-raster";
import {assessOnModelFrame} from "./visual-quality-gate";

describe("visual-quality-gate", () => {
  it("passes v3 tee compositor output", async () => {
    const dna = buildDesignDna({
      slug: "vmb-qa-001",
      designBriefFingerprint: "fp-qa-001",
      quoteFingerprint: "q-1",
      quoteText: "Stay present. Build steady.",
      garmentFamily: "TEES",
    });
    const frame = await renderOnModelRaster(dna, "front");
    const qa = await assessOnModelFrame(frame.bytes, dna, "front", {
      presentation: frame.presentation,
      visualKind: frame.visualKind,
    });
    expect(qa.pass).toBe(true);
    expect(["ON_MODEL", "FLATLAY"]).toContain(frame.presentation);
    expect(frame.bytes.length).toBeGreaterThan(10_000);
  });

  it("rejects pants claimed as tee on-model composite", async () => {
    const dna = buildDesignDna({
      slug: "vmb-qa-pants",
      designBriefFingerprint: "fp-qa-pants",
      quoteFingerprint: "q-p",
      quoteText: "Move with intent.",
      garmentFamily: "PANTS",
    });
    const frame = await renderOnModelRaster(dna, "front");
    expect(frame.presentation).toBe("FLATLAY");
    const bad = await assessOnModelFrame(frame.bytes, dna, "front", {
      presentation: "ON_MODEL",
      visualKind: "ON_MODEL_CPU_COMPOSITE",
    });
    expect(bad.pass).toBe(false);
  });
});