import {describe, expect, it} from "vitest";
import {sampleConcepts} from "./catalog";

describe("promoted PDP media bar", () => {
  it("Quiet Power exposes 6 labelled simulated views", () => {
    const p = sampleConcepts.find((x) => x.slug === "quiet-is-a-power-move");
    expect(p?.media?.length).toBeGreaterThanOrEqual(6);
    const views = new Set(p!.media!.map((m) => m.view));
    for (const v of ["front", "back", "side", "detail", "on-model", "print-proof"] as const) {
      expect(views.has(v)).toBe(true);
    }
    expect(p!.media!.every((m) => m.simulated === true)).toBe(true);
  });
});
