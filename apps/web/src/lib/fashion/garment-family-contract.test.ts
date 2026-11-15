import {describe, expect, it} from "vitest";
import {buildDesignDna} from "./design-dna";
import {resolveGarmentPresentation} from "./garment-family-contract";
import {renderOnModelRaster} from "./render-on-model-raster";
import {assessOnModelFrame} from "./visual-quality-gate";
import {reportSourceDiversity} from "./model-identities";
import {renderArtworkPng} from "./artwork-raster";
import sharp from "sharp";

describe("garment-family-contract", () => {
  it("routes pants to flat-lay when no pants photos exist", () => {
    const dna = buildDesignDna({
      slug: "vmb-1000",
      designBriefFingerprint: "fp-pants-1",
      quoteFingerprint: "q-p",
      quoteText: "Grounded ambition.",
      garmentFamily: "PANTS",
    });
    const c = resolveGarmentPresentation(dna, "/images/quiet-power-editorial-front.webp");
    expect(c.presentation).toBe("FLATLAY");
    expect(c.code).toBe("TEE_PHOTO_FOR_PANTS");
  });

  it("reports honest source diversity (slots ≠ unique humans)", () => {
    const r = reportSourceDiversity();
    expect(r.assignmentSlots).toBe(24);
    expect(r.distinctHumanSourcePhotos).toBeLessThan(r.assignmentSlots);
    expect(r.pantsOnModelPhotos).toBe(0);
  });

  it("artwork PNG has transparent pixels (no opaque plate)", async () => {
    const dna = buildDesignDna({
      slug: "vmb-tee",
      designBriefFingerprint: "fp-art",
      quoteFingerprint: "q-a",
      quoteText: "Build quietly.",
      garmentFamily: "TEES",
    });
    const art = await renderArtworkPng(dna);
    const {data, info} = await sharp(art.bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if ((data[i] ?? 0) < 16) transparent++;
    }
    expect(transparent / (info.width * info.height)).toBeGreaterThan(0.7);
  });

  it("pants render is flat-lay waist-to-ankle preview", async () => {
    const dna = buildDesignDna({
      slug: "vmb-1000",
      designBriefFingerprint: "fp-pants-render",
      quoteFingerprint: "q-pr",
      quoteText: "Keep the story moving.",
      garmentFamily: "PANTS",
    });
    const frame = await renderOnModelRaster(dna, "front");
    expect(frame.presentation).toBe("FLATLAY");
    expect(frame.visualKind).toBe("PANTS_FLATLAY_PREVIEW");
    const qa = await assessOnModelFrame(frame.bytes, dna, "front", {
      presentation: frame.presentation,
      visualKind: frame.visualKind,
    });
    expect(qa.pass).toBe(true);
  });

  it("tees always render as unique designer flat-lays (no shared model plates)", async () => {
    const dna = buildDesignDna({
      slug: "vmb-0999",
      designBriefFingerprint: "fp-tee-render-dark",
      quoteFingerprint: "q-tr",
      quoteText: "Today is enough.",
      garmentFamily: "TEES",
    });
    const c = resolveGarmentPresentation(dna);
    expect(c.presentation).toBe("FLATLAY");
    const frame = await renderOnModelRaster(dna, "front");
    expect(frame.presentation).toBe("FLATLAY");
    expect(frame.visualKind).toBe("TEE_FLATLAY_PREVIEW");
    const qa = await assessOnModelFrame(frame.bytes, dna, "front", {
      presentation: frame.presentation,
      visualKind: frame.visualKind,
    });
    expect(qa.pass).toBe(true);
  });
});

