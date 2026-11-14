import {describe, expect, it} from "vitest";
import {evaluateApprovalGate, mergeHumanReview, type HumanReview} from "./studio.rules";
import {decisionSchema} from "./studio.schema";

const review = (o: Partial<HumanReview> = {}): HumanReview => ({decision: "APPROVE", resultingState: "APPROVED", note: "ok", reviewer: "a@b.co", reviewedAt: "2026-11-15T00:00:00Z", simulationOverride: false, ...o});
const ck = {provenanceLicence: true, quoteAuthenticity: true, culturalReview: true};

describe("approval gate", () => {
  it("passes only with real artwork", () => {
    expect(evaluateApprovalGate({hasArtwork: true, isSimulation: false}, {demo: false}).ok).toBe(true);
  });
  it("blocks simulation-only and missing artwork", () => {
    expect(evaluateApprovalGate({hasArtwork: true, isSimulation: true}, {demo: false})).toMatchObject({ok: false, blockers: ["SIMULATION_ONLY"]});
    expect(evaluateApprovalGate({hasArtwork: false, isSimulation: false}, {demo: false})).toMatchObject({ok: false, blockers: ["NO_ARTWORK"]});
  });
  it("demo override passes but is recorded", () => {
    expect(evaluateApprovalGate({hasArtwork: true, isSimulation: true}, {demo: true})).toEqual({ok: true, blockers: [], demoOverrideUsed: true});
    expect(evaluateApprovalGate({hasArtwork: true, isSimulation: false}, {demo: true}).demoOverrideUsed).toBe(false);
  });
});

describe("semanticReview merge", () => {
  it("keeps automated findings and appends history", () => {
    const first = mergeHumanReview({similarity: 0.12}, review({note: "first", decision: "REJECT", resultingState: "REJECTED"}));
    expect(first.similarity).toBe(0.12);
    expect((first.humanReview as HumanReview).note).toBe("first");
    const second = mergeHumanReview(first, review({note: "second"}));
    expect((second.reviewHistory as HumanReview[]).map(r => r.note)).toEqual(["first", "second"]);
    expect((second.humanReview as HumanReview).note).toBe("second");
  });
  it("handles null and non-object prior values without losing them", () => {
    expect(mergeHumanReview(null, review()).humanReview).toBeTruthy();
    expect(mergeHumanReview("legacy", review()).previous).toBe("legacy");
    expect(mergeHumanReview([1], review()).previous).toEqual([1]);
  });
});

describe("decision schema", () => {
  it("approval requires the full checklist and a note", () => {
    expect(decisionSchema.safeParse({candidateId: "c1", decision: "APPROVE", note: "looks good"}).success).toBe(false);
    expect(decisionSchema.safeParse({candidateId: "c1", decision: "APPROVE", note: "looks good", checklist: {...ck, culturalReview: false}}).success).toBe(false);
    expect(decisionSchema.safeParse({candidateId: "c1", decision: "APPROVE", note: "looks good", checklist: ck}).success).toBe(true);
    expect(decisionSchema.safeParse({candidateId: "c1", decision: "APPROVE", note: "  ", checklist: ck}).success).toBe(false);
  });
  it("rejection needs only a note", () => {
    expect(decisionSchema.safeParse({candidateId: "c1", decision: "REJECT", note: "invented scripture"}).success).toBe(true);
    expect(decisionSchema.safeParse({candidateId: "c1", decision: "PUBLISH", note: "nope"}).success).toBe(false);
  });
});
