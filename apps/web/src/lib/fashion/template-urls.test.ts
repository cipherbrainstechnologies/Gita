import {describe, expect, it} from "vitest";
import {isSharedTemplateUrl} from "./template-urls";

describe("shared template guard", () => {
  it("detects known editorial paths", () => {
    expect(isSharedTemplateUrl("/images/quiet-power-editorial-front.webp")).toBe(true);
    expect(isSharedTemplateUrl("/api/catalog/visual/vmb-001/front")).toBe(false);
  });
});