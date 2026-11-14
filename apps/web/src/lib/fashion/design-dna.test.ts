import {describe, expect, it} from "vitest";
import {buildDesignDna} from "./design-dna";
import {contentSha256FromSvg, renderFlatMockupSvg} from "./flat-mockup-svg";

describe("design-dna", () => {
  it("is stable for the same brief fingerprint", () => {
    const a = buildDesignDna({
      slug: "vmb-001",
      designBriefFingerprint: "fp-abc-123",
      quoteFingerprint: "q-1",
      quoteText: "Move quietly. Mean it.",
      garmentFamily: "TEES",
    });
    const b = buildDesignDna({
      slug: "vmb-001",
      designBriefFingerprint: "fp-abc-123",
      quoteFingerprint: "q-1",
      quoteText: "Move quietly. Mean it.",
      garmentFamily: "TEES",
    });
    expect(a).toEqual(b);
  });

  it("differs across fingerprints", () => {
    const a = buildDesignDna({
      slug: "vmb-001",
      designBriefFingerprint: "fp-a",
      quoteFingerprint: "q-1",
      quoteText: "One",
      garmentFamily: "TEES",
    });
    const b = buildDesignDna({
      slug: "vmb-002",
      designBriefFingerprint: "fp-b",
      quoteFingerprint: "q-2",
      quoteText: "Two",
      garmentFamily: "TEES",
    });
    expect(a.colourHex).not.toBe(b.colourHex);
  });

  it("renders unique SVG bytes per SKU", () => {
    const dna = buildDesignDna({
      slug: "vmb-099",
      designBriefFingerprint: "unique-fp-99",
      quoteFingerprint: "q-99",
      quoteText: "Your pace is valid.",
      garmentFamily: "PANTS",
    });
    const svg = renderFlatMockupSvg(dna, "front");
    expect(svg).toContain("Your pace is valid");
    expect(contentSha256FromSvg(svg)).toHaveLength(64);
  });
});