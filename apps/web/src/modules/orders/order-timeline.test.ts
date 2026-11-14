import {describe, expect, it} from "vitest";
import {formatPaise} from "../../lib/format";
import {buildTimeline} from "./order-timeline";

const states = (s: string, paid?: string | null) => buildTimeline(s, paid).steps.map(x => x.state);

describe("order timeline", () => {
  it("marks earlier steps done and the current step current", () => {
    const st = states("IN_PRODUCTION");
    expect(st.slice(0, 4)).toEqual(["done", "done", "done", "done"]);
    expect(st[4]).toBe("current");
    expect(st.slice(5)).toEqual(Array(4).fill("upcoming"));
  });
  it("DRAFT is current, rest upcoming", () => {
    expect(states("DRAFT")).toEqual(["current", ...Array(8).fill("upcoming")]);
  });
  it("DELIVERED is fully done", () => {
    expect(states("DELIVERED")).toEqual(Array(9).fill("done"));
  });
  it("cancelled before payment only reaches DRAFT and reports off-path status", () => {
    const t = buildTimeline("CANCELLED", null);
    expect(t.offPath?.label).toBe("Cancelled");
    expect(t.steps.map(x => x.state)).toEqual(["done", ...Array(8).fill("upcoming")]);
  });
  it("refund after payment keeps PAID reached", () => {
    const t = buildTimeline("REFUNDED", "2026-11-15T00:00:00Z");
    expect(t.steps.slice(0, 3).map(x => x.state)).toEqual(["done", "done", "done"]);
    expect(t.steps[3].state).toBe("upcoming");
  });
});

describe("formatPaise", () => {
  it("uses Indian digit grouping without floats", () => {
    expect(formatPaise("123456700")).toBe("₹12,34,567.00");
    expect(formatPaise(99900n)).toBe("₹999.00");
    expect(formatPaise("5")).toBe("₹0.05");
  });
});
