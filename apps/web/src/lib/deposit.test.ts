import {describe, expect, it} from "vitest";
import {calculateDepositBreakdown} from "./deposit";

const policy = {
  enabled: true,
  flatDepositPaise: 9900n,
  maxDepositPercentBps: 2500,
  pauseDepositCheckout: false,
};

describe("deposit breakdown", () => {
  it("charges full amount when deposit checkout is disabled", () => {
    const b = calculateDepositBreakdown(199900n, policy, {depositCheckoutEnabled: false});
    expect(b.usingDeposit).toBe(false);
    expect(b.chargeNowPaise).toBe(199900n);
  });

  it("charges ₹99 deposit for a typical preorder total", () => {
    const b = calculateDepositBreakdown(199900n, policy, {depositCheckoutEnabled: true});
    expect(b.usingDeposit).toBe(true);
    expect(b.depositDuePaise).toBe(9900n);
    expect(b.balanceDuePaise).toBe(190000n);
    expect(b.chargeNowPaise).toBe(9900n);
  });

  it("never exceeds max percent cap", () => {
    const b = calculateDepositBreakdown(30000n, {...policy, flatDepositPaise: 9900n}, {depositCheckoutEnabled: true});
    expect(b.depositDuePaise).toBe(7500n);
  });
});